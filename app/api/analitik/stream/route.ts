import type { NextRequest } from "next/server"
import { query } from "@/lib/db"

// Fungsi untuk mengirim data real-time menggunakan Server-Sent Events (SSE)
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  // Buat response stream
  const stream = new ReadableStream({
    async start(controller) {
      // Fungsi untuk mengirim data ke client
      const sendData = async () => {
        try {
          // Dapatkan pengunjung aktif dalam 5 menit terakhir
          const activeVisitorsQuery = `
            SELECT COUNT(DISTINCT session_id) as active_visitors
            FROM analitik_pengunjung
            WHERE timestamp >= NOW() - INTERVAL '5 minutes'
          `

          // Dapatkan total kunjungan hari ini
          const todayVisitsQuery = `
            SELECT COUNT(*) as total_visits
            FROM analitik_pengunjung
            WHERE DATE(timestamp) = CURRENT_DATE
          `

          // Dapatkan pengunjung unik hari ini
          const uniqueVisitorsQuery = `
            SELECT COUNT(DISTINCT session_id) as unique_visitors
            FROM analitik_pengunjung
            WHERE DATE(timestamp) = CURRENT_DATE
          `

          // Jalankan query
          const activeVisitorsResult = await query(activeVisitorsQuery)
          const todayVisitsResult = await query(todayVisitsQuery)
          const uniqueVisitorsResult = await query(uniqueVisitorsQuery)

          // Buat data untuk dikirim
          const data = {
            activeVisitors: Number.parseInt(activeVisitorsResult.rows[0].active_visitors),
            todayVisits: Number.parseInt(todayVisitsResult.rows[0].total_visits),
            uniqueVisitors: Number.parseInt(uniqueVisitorsResult.rows[0].unique_visitors),
            timestamp: new Date().toISOString(),
          }

          // Kirim data ke client
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch (error) {
          console.error("Error mengirim data real-time:", error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Terjadi kesalahan" })}\n\n`))
        }
      }

      // Kirim data pertama kali
      await sendData()

      // Kirim data setiap 5 detik
      const interval = setInterval(async () => {
        await sendData()
      }, 5000)

      // Bersihkan interval jika koneksi ditutup
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
      })
    },
  })

  // Kembalikan response dengan header yang sesuai untuk SSE
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

