import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { generateSlug } from "@/lib/utils"

// GET - Ambil semua data blog
export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM blog 
      ORDER BY tanggal_publikasi DESC
    `)

    return NextResponse.json({ data: result.rows }, { status: 200 })
  } catch (error) {
    console.error("Error mengambil data blog:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data blog" }, { status: 500 })
  }
}

// POST - Tambah data blog baru
export async function POST(request: NextRequest) {
  try {
    const { judul, ringkasan, konten, gambar_url, kategori, penulis } = await request.json()

    // Validasi input
    if (!judul || !ringkasan || !konten || !penulis) {
      return NextResponse.json({ error: "Judul, ringkasan, konten, dan penulis harus diisi" }, { status: 400 })
    }

    // Generate slug dari judul
    const slug = generateSlug(judul)

    // Cek apakah kolom slug sudah ada di tabel blog
    let hasSlugColumn = true
    try {
      await query(`SELECT slug FROM blog LIMIT 1`)
    } catch (error) {
      console.log("Kolom slug belum ada, menambahkan kolom slug...")
      hasSlugColumn = false

      // Tambahkan kolom slug jika belum ada
      try {
        await query(`ALTER TABLE blog ADD COLUMN slug VARCHAR(255) UNIQUE`)
        console.log("Kolom slug berhasil ditambahkan")

        // Update slug untuk data yang sudah ada
        await query(`
          UPDATE blog 
          SET slug = LOWER(REPLACE(REPLACE(REPLACE(judul, ' ', '-'), '.', ''), ',', ''))
          WHERE slug IS NULL
        `)

        // Buat indeks untuk slug
        await query(`CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog(slug)`)

        hasSlugColumn = true
      } catch (error) {
        console.error("Error menambahkan kolom slug:", error)
      }
    }

    // Jika kolom slug sudah ada, cek apakah slug sudah digunakan
    if (hasSlugColumn) {
      try {
        const slugCheck = await query(`SELECT * FROM blog WHERE slug = $1`, [slug])

        // Jika slug sudah ada, tambahkan timestamp
        const finalSlug = slugCheck.rows.length > 0 ? `${slug}-${Date.now().toString().slice(-6)}` : slug

        // Insert data dengan slug
        const result = await query(
          `
          INSERT INTO blog (judul, ringkasan, konten, gambar_url, kategori, penulis, slug)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `,
          [judul, ringkasan, konten, gambar_url, kategori, penulis, finalSlug],
        )

        return NextResponse.json({ data: result.rows[0] }, { status: 201 })
      } catch (error) {
        console.error("Error saat memeriksa slug:", error)
      }
    }

    // Fallback jika ada masalah dengan kolom slug
    const result = await query(
      `
      INSERT INTO blog (judul, ringkasan, konten, gambar_url, kategori, penulis)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [judul, ringkasan, konten, gambar_url, kategori, penulis],
    )

    return NextResponse.json({ data: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("Error menambah data blog:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat menambah data blog" }, { status: 500 })
  }
}

