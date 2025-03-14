import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { generateSlug } from "@/lib/utils"

// GET - Ambil data blog berdasarkan slug
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug
    const result = await query(
      `
      SELECT * FROM blog 
      WHERE slug = $1
    `,
      [slug],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Artikel blog tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ data: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error("Error mengambil data blog:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data blog" }, { status: 500 })
  }
}

// PUT - Update data blog
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug
    const { judul, ringkasan, konten, gambar_url, kategori, penulis } = await request.json()

    // Validasi input
    if (!judul || !ringkasan || !konten || !penulis) {
      return NextResponse.json({ error: "Judul, ringkasan, konten, dan penulis harus diisi" }, { status: 400 })
    }

    // Generate slug baru jika judul berubah
    const newSlug = generateSlug(judul)

    // Cek apakah slug baru sudah ada dan bukan milik artikel ini
    if (newSlug !== slug) {
      const slugCheck = await query(`SELECT * FROM blog WHERE slug = $1 AND slug != $2`, [newSlug, slug])

      // Jika slug sudah ada, tambahkan timestamp
      const finalSlug = slugCheck.rows.length > 0 ? `${newSlug}-${Date.now().toString().slice(-6)}` : newSlug

      const result = await query(
        `
        UPDATE blog 
        SET judul = $1, ringkasan = $2, konten = $3, gambar_url = $4, kategori = $5, penulis = $6, slug = $7, updated_at = CURRENT_TIMESTAMP
        WHERE slug = $8
        RETURNING *
      `,
        [judul, ringkasan, konten, gambar_url, kategori, penulis, finalSlug, slug],
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Artikel blog tidak ditemukan" }, { status: 404 })
      }

      return NextResponse.json({ data: result.rows[0] }, { status: 200 })
    } else {
      // Jika judul tidak berubah, update tanpa mengubah slug
      const result = await query(
        `
        UPDATE blog 
        SET judul = $1, ringkasan = $2, konten = $3, gambar_url = $4, kategori = $5, penulis = $6, updated_at = CURRENT_TIMESTAMP
        WHERE slug = $7
        RETURNING *
      `,
        [judul, ringkasan, konten, gambar_url, kategori, penulis, slug],
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Artikel blog tidak ditemukan" }, { status: 404 })
      }

      return NextResponse.json({ data: result.rows[0] }, { status: 200 })
    }
  } catch (error) {
    console.error("Error mengupdate data blog:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengupdate data blog" }, { status: 500 })
  }
}

// DELETE - Hapus data blog
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug
    const result = await query(
      `
      DELETE FROM blog 
      WHERE slug = $1
      RETURNING *
    `,
      [slug],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Artikel blog tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ message: "Artikel blog berhasil dihapus" }, { status: 200 })
  } catch (error) {
    console.error("Error menghapus data blog:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat menghapus data blog" }, { status: 500 })
  }
}

