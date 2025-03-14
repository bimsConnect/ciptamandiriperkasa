import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { headers } from "next/headers"

// POST - Rekam kunjungan baru
export async function POST(request: NextRequest) {
  try {
    const { session_id, halaman, referrer } = await request.json()

    // Validasi input
    if (!session_id || !halaman) {
      return NextResponse.json({ error: "Session ID dan halaman harus diisi" }, { status: 400 })
    }

    // Dapatkan IP address dari header
    const headersList = await headers()
    const forwarded = headersList.get("x-forwarded-for")
    const ip_address = forwarded ? forwarded.split(",")[0] : "127.0.0.1"

    // Dapatkan user agent
    const user_agent = request.headers.get("user-agent") || ""

    // Rekam kunjungan
    await query(
      `
      INSERT INTO analitik_pengunjung (session_id, ip_address, user_agent, halaman, referrer)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [session_id, ip_address, user_agent, halaman, referrer],
    )

    // Update statistik harian
    const today = new Date().toISOString().split("T")[0]

    // Cek apakah sudah ada statistik untuk hari ini
    const existingStats = await query(
      `
      SELECT * FROM statistik_harian WHERE tanggal = $1
    `,
      [today],
    )

    if (existingStats.rows.length === 0) {
      // Buat statistik baru untuk hari ini
      await query(
        `
        INSERT INTO statistik_harian (tanggal, pengunjung_unik, total_kunjungan)
        VALUES ($1, 1, 1)
      `,
        [today],
      )
    } else {
      // Update statistik yang sudah ada
      // Cek apakah session_id sudah ada untuk hari ini
      const existingSession = await query(
        `
        SELECT COUNT(*) FROM analitik_pengunjung 
        WHERE session_id = $1 AND DATE(timestamp) = $2
      `,
        [session_id, today],
      )

      const isNewVisitor = Number.parseInt(existingSession.rows[0].count) <= 1

      await query(
        `
        UPDATE statistik_harian 
        SET 
          pengunjung_unik = pengunjung_unik + $1, 
          total_kunjungan = total_kunjungan + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE tanggal = $2
      `,
        [isNewVisitor ? 1 : 0, today],
      )
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error merekam kunjungan:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat merekam kunjungan" }, { status: 500 })
  }
}

// GET - Dapatkan statistik pengunjung
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "today"

    let timeFilter = ""
    let params: any[] = []

    switch (period) {
      case "today":
        timeFilter = "DATE(timestamp) = CURRENT_DATE"
        break
      case "yesterday":
        timeFilter = "DATE(timestamp) = CURRENT_DATE - INTERVAL '1 day'"
        break
      case "week":
        timeFilter = "timestamp >= CURRENT_DATE - INTERVAL '7 days'"
        break
      case "month":
        timeFilter = "timestamp >= CURRENT_DATE - INTERVAL '30 days'"
        break
      case "custom":
        const startDate = searchParams.get("start")
        const endDate = searchParams.get("end")
        if (startDate && endDate) {
          timeFilter = "DATE(timestamp) BETWEEN $1 AND $2"
          params = [startDate, endDate]
        } else {
          timeFilter = "DATE(timestamp) = CURRENT_DATE"
        }
        break
      default:
        timeFilter = "DATE(timestamp) = CURRENT_DATE"
    }

    // Dapatkan jumlah pengunjung unik
    const uniqueVisitorsQuery = `
      SELECT COUNT(DISTINCT session_id) as unique_visitors
      FROM analitik_pengunjung
      WHERE ${timeFilter}
    `

    // Dapatkan total kunjungan
    const totalVisitsQuery = `
      SELECT COUNT(*) as total_visits
      FROM analitik_pengunjung
      WHERE ${timeFilter}
    `

    // Dapatkan halaman yang paling banyak dikunjungi
    const topPagesQuery = `
      SELECT halaman, COUNT(*) as visits
      FROM analitik_pengunjung
      WHERE ${timeFilter}
      GROUP BY halaman
      ORDER BY visits DESC
      LIMIT 5
    `

    // Dapatkan pengunjung aktif dalam 5 menit terakhir
    const activeVisitorsQuery = `
      SELECT COUNT(DISTINCT session_id) as active_visitors
      FROM analitik_pengunjung
      WHERE timestamp >= NOW() - INTERVAL '5 minutes'
    `

    // Dapatkan statistik per jam untuk hari ini
    const hourlyStatsQuery = `
      SELECT 
        EXTRACT(HOUR FROM timestamp) as hour,
        COUNT(*) as visits
      FROM analitik_pengunjung
      WHERE DATE(timestamp) = CURRENT_DATE
      GROUP BY hour
      ORDER BY hour
    `

    // Jalankan semua query
    const uniqueVisitorsResult = await query(uniqueVisitorsQuery, params)
    const totalVisitsResult = await query(totalVisitsQuery, params)
    const topPagesResult = await query(topPagesQuery, params)
    const activeVisitorsResult = await query(activeVisitorsQuery)
    const hourlyStatsResult = await query(hourlyStatsQuery)

    // Dapatkan statistik harian untuk 7 hari terakhir
    const dailyStatsQuery = `
      SELECT 
        tanggal,
        pengunjung_unik,
        total_kunjungan
      FROM statistik_harian
      WHERE tanggal >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY tanggal
    `

    const dailyStatsResult = await query(dailyStatsQuery)

    return NextResponse.json(
      {
        uniqueVisitors: Number.parseInt(uniqueVisitorsResult.rows[0].unique_visitors),
        totalVisits: Number.parseInt(totalVisitsResult.rows[0].total_visits),
        topPages: topPagesResult.rows,
        activeVisitors: Number.parseInt(activeVisitorsResult.rows[0].active_visitors),
        hourlyStats: hourlyStatsResult.rows,
        dailyStats: dailyStatsResult.rows,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error mengambil statistik pengunjung:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil statistik pengunjung" }, { status: 500 })
  }
}
