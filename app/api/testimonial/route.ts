import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET - Ambil semua data testimonial
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    let sql = `SELECT * FROM testimonial`
    const params: any[] = []

    if (status) {
      sql += ` WHERE status = $1`
      params.push(status)
    }

    sql += ` ORDER BY created_at DESC`

    const result = await query(sql, params)

    return NextResponse.json({ data: result.rows }, { status: 200 })
  } catch (error) {
    console.error("Error mengambil data testimonial:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data testimonial" }, { status: 500 })
  }
}

// POST - Tambah data testimonial baru (dari form publik)
export async function POST(request: NextRequest) {
  try {
    const { nama, peran, pesan, rating, gambar_url } = await request.json()

    // Validasi input
    if (!nama || !pesan || !rating) {
      return NextResponse.json({ error: "Nama, pesan, dan rating harus diisi" }, { status: 400 })
    }

    const result = await query(
      `
      INSERT INTO testimonial (nama, peran, pesan, rating, gambar_url, status)
      VALUES ($1, $2, $3, $4, $5, 'menunggu')
      RETURNING *
    `,
      [nama, peran, pesan, rating, gambar_url],
    )

    return NextResponse.json({ data: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("Error menambah data testimonial:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat menambah data testimonial" }, { status: 500 })
  }
}

