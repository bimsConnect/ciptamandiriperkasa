import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET - Ambil data testimonial berdasarkan ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await query(
      `
      SELECT * FROM testimonial 
      WHERE id = $1
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Data testimonial tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ data: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error("Error mengambil data testimonial:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data testimonial" }, { status: 500 })
  }
}

// PATCH - Update status testimonial (approve/reject)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { status } = await request.json()

    // Validasi status
    if (!status || !["disetujui", "ditolak", "menunggu"].includes(status)) {
      return NextResponse.json({ error: "Status harus disetujui, ditolak, atau menunggu" }, { status: 400 })
    }

    const result = await query(
      `
      UPDATE testimonial 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `,
      [status, id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Data testimonial tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ data: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error("Error mengupdate status testimonial:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengupdate status testimonial" }, { status: 500 })
  }
}

// DELETE - Hapus data testimonial
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await query(
      `
      DELETE FROM testimonial 
      WHERE id = $1
      RETURNING *
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Data testimonial tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ message: "Data testimonial berhasil dihapus" }, { status: 200 })
  } catch (error) {
    console.error("Error menghapus data testimonial:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat menghapus data testimonial" }, { status: 500 })
  }
}

