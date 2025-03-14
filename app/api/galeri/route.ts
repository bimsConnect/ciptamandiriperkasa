import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET - Ambil semua data galeri
export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM galeri 
      ORDER BY created_at DESC
    `)

    return NextResponse.json({ data: result.rows }, { status: 200 })
  } catch (error) {
    console.error("Error mengambil data galeri:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data galeri" }, { status: 500 })
  }
}

// POST - Tambah data galeri baru
export async function POST(request: NextRequest) {
  try {
    const { judul, lokasi, deskripsi, gambar_url } = await request.json()

    // Validasi input
    if (!judul || !lokasi || !gambar_url) {
      return NextResponse.json({ error: "Judul, lokasi, dan URL gambar harus diisi" }, { status: 400 })
    }

    const result = await query(
      `
      INSERT INTO galeri (judul, lokasi, deskripsi, gambar_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [judul, lokasi, deskripsi, gambar_url],
    )

    return NextResponse.json({ data: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("Error menambah data galeri:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat menambah data galeri" }, { status: 500 })
  }
}

