import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { generateSlug } from "@/lib/utils"

// GET - Ambil data blog berdasarkan ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Cek apakah id adalah angka (ID) atau string (slug)
    const isNumeric = /^\d+$/.test(id)

    let result

    if (isNumeric) {
      // Jika id adalah angka, cari berdasarkan id
      result = await query(
        `
        SELECT * FROM blog 
        WHERE id = $1
      `,
        [id],
      )
    } else {
      // Jika id adalah string, cari berdasarkan slug
      // Cek apakah kolom slug ada
      try {
        result = await query(
          `
          SELECT * FROM blog 
          WHERE slug = $1
        `,
          [id],
        )
      } catch (error) {
        // Jika kolom slug belum ada, cari berdasarkan id saja
        console.error("Error querying by slug:", error)
        result = await query(
          `
          SELECT * FROM blog 
          WHERE id = $1
        `,
          [id],
        )
      }
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Data blog tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ data: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error("Error mengambil data blog:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data blog" }, { status: 500 })
  }
}

// PUT - Update data blog
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { judul, ringkasan, konten, gambar_url, kategori, penulis } = await request.json()

    // Validasi input
    if (!judul || !ringkasan || !konten || !penulis) {
      return NextResponse.json({ error: "Judul, ringkasan, konten, dan penulis harus diisi" }, { status: 400 })
    }

    // Cek apakah kolom slug ada
    let hasSlugColumn = true
    try {
      await query(`SELECT slug FROM blog LIMIT 1`)
    } catch (error) {
      console.log("Kolom slug belum ada")
      hasSlugColumn = false
    }

    let result

    if (hasSlugColumn) {
      // Generate slug dari judul
      const slug = generateSlug(judul)

      // Cek apakah slug sudah ada dan bukan milik artikel ini
      const slugCheck = await query(`SELECT * FROM blog WHERE slug = $1 AND id != $2`, [slug, id])

      // Jika slug sudah ada, tambahkan timestamp
      const finalSlug = slugCheck.rows.length > 0 ? `${slug}-${Date.now().toString().slice(-6)}` : slug

      result = await query(
        `
        UPDATE blog 
        SET judul = $1, ringkasan = $2, konten = $3, gambar_url = $4, kategori = $5, penulis = $6, slug = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `,
        [judul, ringkasan, konten, gambar_url, kategori, penulis, finalSlug, id],
      )
    } else {
      // Update tanpa kolom slug
      result = await query(
        `
        UPDATE blog 
        SET judul = $1, ringkasan = $2, konten = $3, gambar_url = $4, kategori = $5, penulis = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `,
        [judul, ringkasan, konten, gambar_url, kategori, penulis, id],
      )
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Data blog tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ data: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error("Error mengupdate data blog:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengupdate data blog" }, { status: 500 })
  }
}

// DELETE - Hapus data blog
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const result = await query(
      `
      DELETE FROM blog 
      WHERE id = $1
      RETURNING *
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Data blog tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ message: "Data blog berhasil dihapus" }, { status: 200 })
  } catch (error) {
    console.error("Error menghapus data blog:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat menghapus data blog" }, { status: 500 })
  }
}

