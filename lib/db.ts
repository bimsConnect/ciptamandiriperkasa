import { Pool } from "pg"
import bcrypt from "bcryptjs"

// Buat koneksi pool ke Neon DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Ubah ini untuk mengatasi masalah SSL
})

// Fungsi untuk menjalankan query
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Eksekusi query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error menjalankan query", error)
    throw error
  }
}

// Fungsi untuk membuat tabel jika belum ada
export async function initializeDatabase() {
  try {
    // Buat tabel users
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Buat tabel galeri
    await query(`
      CREATE TABLE IF NOT EXISTS galeri (
        id SERIAL PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        lokasi VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        gambar_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Buat tabel blog
    await query(`
      CREATE TABLE IF NOT EXISTS blog (
        id SERIAL PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        ringkasan TEXT NOT NULL,
        konten TEXT NOT NULL,
        gambar_url VARCHAR(255),
        kategori VARCHAR(100),
        penulis VARCHAR(100) NOT NULL,
        tanggal_publikasi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Buat tabel testimonial
    await query(`
      CREATE TABLE IF NOT EXISTS testimonial (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        peran VARCHAR(100),
        pesan TEXT NOT NULL,
        rating DECIMAL(2,1) NOT NULL,
        gambar_url VARCHAR(255),
        status VARCHAR(20) DEFAULT 'menunggu' CHECK (status IN ('disetujui', 'ditolak', 'menunggu')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Buat tabel analitik pengunjung
    await query(`
      CREATE TABLE IF NOT EXISTS analitik_pengunjung (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        ip_address VARCHAR(50),
        user_agent TEXT,
        halaman VARCHAR(255) NOT NULL,
        referrer VARCHAR(255),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Buat tabel untuk menyimpan statistik harian
    await query(`
      CREATE TABLE IF NOT EXISTS statistik_harian (
        id SERIAL PRIMARY KEY,
        tanggal DATE NOT NULL UNIQUE,
        pengunjung_unik INT DEFAULT 0,
        total_kunjungan INT DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Buat indeks untuk meningkatkan performa query
    await query(`CREATE INDEX IF NOT EXISTS idx_analitik_session_id ON analitik_pengunjung(session_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_analitik_timestamp ON analitik_pengunjung(timestamp)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_analitik_halaman ON analitik_pengunjung(halaman)`)

    // Cek apakah sudah ada user admin
    const adminCheck = await query(`SELECT * FROM users WHERE role = 'admin' LIMIT 1`)

    // Jika belum ada admin, buat user admin default
    if (adminCheck.rows.length === 0) {
      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("admin123", salt)

      // Tambahkan user admin
      await query(
        `
        INSERT INTO users (username, email, password, role)
        VALUES ($1, $2, $3, $4)
      `,
        ["admin", "admin@brickproperty.com", hashedPassword, "admin"],
      )

      console.log("User admin default berhasil dibuat")
    }

    console.log("Database berhasil diinisialisasi")
  } catch (error) {
    console.error("Gagal menginisialisasi database", error)
    throw error
  }
}

