import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET - Ambil data galeri berdasarkan ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await query(
      `
      SELECT * FROM galeri 
      WHERE id = $1
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Data galeri tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ data: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error("Error mengambil data galeri:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data galeri" }, { status: 500 })
  }
}

// PUT - Update data galeri
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { judul, lokasi, deskripsi, gambar_url } = await request.json()

    // Validasi input
    if (!judul || !lokasi || !gambar_url) {
      return NextResponse.json({ error: "Judul, lokasi, dan URL gambar harus diisi" }, { status: 400 })
    }

    const result = await query(
      `
      UPDATE galeri 
      SET judul = $1, lokasi = $2, deskripsi = $3, gambar_url = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `,
      [judul, lokasi, deskripsi, gambar_url, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Data galeri tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ data: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error("Error mengupdate data galeri:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengupdate data galeri" }, { status: 500 })
  }
}

// DELETE - Hapus data galeri
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await query(
      `
      DELETE FROM galeri 
      WHERE id = $1
      RETURNING *
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Data galeri tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ message: "Data galeri berhasil dihapus" }, { status: 200 })
  } catch (error) {
    console.error("Error menghapus data galeri:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat menghapus data galeri" }, { status: 500 })
  }
}

