const { Pool } = require("pg")
const bcrypt = require("bcryptjs")

// Buat koneksi pool ke Neon DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Fungsi untuk menjalankan query
async function query(text, params) {
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

async function seedDatabase() {
  try {
    console.log("Memulai seeding database...")

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

    // Menambahkan data contoh untuk galeri
    await query(`
      INSERT INTO galeri (judul, lokasi, deskripsi, gambar_url) 
      VALUES 
        ('Modern Villa', 'Jakarta Selatan', 'Villa modern dengan 5 kamar tidur dan kolam renang pribadi', '/placeholder.svg?height=600&width=800'),
        ('Luxury Apartment', 'Jakarta Pusat', 'Apartemen mewah dengan pemandangan kota yang spektakuler', '/placeholder.svg?height=600&width=800'),
        ('Family House', 'Bandung', 'Rumah keluarga yang nyaman dengan taman luas', '/placeholder.svg?height=600&width=800'),
        ('Beachfront Villa', 'Bali', 'Villa tepi pantai dengan akses langsung ke pantai pribadi', '/placeholder.svg?height=600&width=800'),
        ('City Apartment', 'Surabaya', 'Apartemen modern di pusat kota dengan akses mudah ke fasilitas publik', '/placeholder.svg?height=600&width=800'),
        ('Mountain Retreat', 'Bogor', 'Rumah peristirahatan dengan pemandangan gunung yang menakjubkan', '/placeholder.svg?height=600&width=800')
      ON CONFLICT DO NOTHING
    `)

    // Menambahkan data contoh untuk blog
    await query(`
      INSERT INTO blog (judul, ringkasan, konten, gambar_url, kategori, penulis) 
      VALUES 
        ('Tips Membeli Rumah Pertama untuk Keluarga Muda', 
        'Panduan lengkap untuk keluarga muda yang ingin membeli rumah pertama mereka dengan budget terbatas.', 
        '<p>Membeli rumah pertama adalah langkah besar dalam kehidupan setiap keluarga. Berikut adalah beberapa tips yang dapat membantu Anda:</p>
        <h3>1. Tetapkan Budget yang Realistis</h3>
        <p>Sebelum mulai mencari rumah, tentukan berapa banyak yang mampu Anda bayar. Pertimbangkan semua biaya termasuk uang muka, cicilan bulanan, pajak properti, dan biaya pemeliharaan.</p>
        <h3>2. Cari Lokasi Strategis</h3>
        <p>Lokasi adalah faktor penting dalam investasi properti. Pilih area yang dekat dengan fasilitas publik seperti sekolah, rumah sakit, dan pusat perbelanjaan.</p>
        <h3>3. Periksa Kondisi Rumah dengan Teliti</h3>
        <p>Jangan tergiur hanya dengan penampilan luar. Periksa struktur bangunan, sistem kelistrikan, dan plumbing untuk menghindari biaya perbaikan yang tidak terduga di kemudian hari.</p>',
        '/placeholder.svg?height=400&width=600', 
        'Tips & Advice', 
        'Ahmad Rizki'),
        
        ('Investasi Properti di Tengah Pandemi: Peluang atau Risiko?', 
        'Analisis mendalam tentang pasar properti saat ini dan apakah ini waktu yang tepat untuk berinvestasi.', 
        '<p>Pandemi COVID-19 telah mengubah banyak aspek kehidupan, termasuk pasar properti. Berikut analisis tentang investasi properti di masa pandemi:</p>
        <h3>Peluang di Tengah Pandemi</h3>
        <p>Meskipun pandemi telah menyebabkan ketidakpastian ekonomi, ada beberapa peluang yang muncul di pasar properti:</p>
        <ul>
        <li>Harga properti yang lebih terjangkau di beberapa area</li>
        <li>Suku bunga KPR yang rendah</li>
        <li>Insentif dari pengembang dan pemerintah</li>
        </ul>
        <h3>Risiko yang Perlu Dipertimbangkan</h3>
        <p>Namun, ada juga risiko yang perlu dipertimbangkan:</p>
        <ul>
        <li>Ketidakpastian ekonomi jangka panjang</li>
        <li>Perubahan preferensi konsumen terhadap jenis dan lokasi properti</li>
        <li>Potensi penurunan nilai properti di area tertentu</li>
        </ul>',
        '/placeholder.svg?height=400&width=600', 
        'Investment', 
        'Siti Nurhaliza'),
        
        ('Tren Desain Interior 2023 yang Perlu Anda Ketahui', 
        'Pelajari tren desain interior terbaru yang dapat meningkatkan nilai dan kenyamanan properti Anda.', 
        '<p>Desain interior terus berkembang setiap tahun. Berikut adalah beberapa tren desain interior terpopuler untuk tahun 2023:</p>
        <h3>1. Sustainable Design</h3>
        <p>Penggunaan material ramah lingkungan dan berkelanjutan semakin populer. Konsumen lebih memilih produk yang eco-friendly dan memiliki jejak karbon yang rendah.</p>
        <h3>2. Biophilic Design</h3>
        <p>Menggabungkan elemen alam ke dalam ruangan, seperti tanaman indoor, material alami, dan pencahayaan alami untuk menciptakan ruangan yang lebih sehat dan nyaman.</p>
        <h3>3. Multifunctional Spaces</h3>
        <p>Dengan semakin banyaknya orang yang bekerja dari rumah, ruang multifungsi menjadi sangat penting. Desain yang fleksibel dan furnitur yang dapat diubah fungsinya sangat diminati.</p>',
        '/placeholder.svg?height=400&width=600', 
        'Design', 
        'Budi Santoso')
      ON CONFLICT DO NOTHING
    `)

    // Menambahkan data contoh untuk testimonial
    await query(`
      INSERT INTO testimonial (nama, peran, pesan, rating, gambar_url, status) 
      VALUES 
        ('Budi Santoso', 'Pengusaha', 'Saya sangat puas dengan pelayanan Brick Property. Tim mereka sangat profesional dan membantu saya menemukan properti investasi yang tepat. Prosesnya cepat dan transparan.', 5.0, '/placeholder.svg?height=200&width=200', 'disetujui'),
        ('Siti Rahayu', 'Dokter', 'Brick Property membantu keluarga kami menemukan rumah impian. Konsultannya sangat memahami kebutuhan kami dan memberikan rekomendasi yang sesuai dengan budget kami. Proses pembelian juga sangat lancar.', 4.5, '/placeholder.svg?height=200&width=200', 'disetujui'),
        ('Ahmad Rizki', 'Karyawan Swasta', 'Pengalaman pertama membeli rumah bersama Brick Property sangat menyenangkan. Mereka membantu saya dari awal hingga akhir proses. Sangat direkomendasikan untuk pembeli rumah pertama.', 5.0, '/placeholder.svg?height=200&width=200', 'disetujui'),
        ('Maya Putri', 'Ibu Rumah Tangga', 'Pelayanan cukup baik, tapi saya harus menunggu cukup lama untuk mendapatkan respon dari tim sales.', 3.5, '/placeholder.svg?height=200&width=200', 'menunggu'),
        ('Deni Wijaya', 'Wiraswasta', 'Properti yang ditawarkan sangat berkualitas dan sesuai dengan deskripsi. Saya sangat senang dengan pilihan yang saya buat.', 4.0, '/placeholder.svg?height=200&width=200', 'menunggu')
      ON CONFLICT DO NOTHING
    `)

    // Tambahkan data contoh untuk statistik harian
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0]
    const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0]
    const fourDaysAgo = new Date(Date.now() - 86400000 * 4).toISOString().split("T")[0]
    const fiveDaysAgo = new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0]
    const sixDaysAgo = new Date(Date.now() - 86400000 * 6).toISOString().split("T")[0]

    await query(
      `
      INSERT INTO statistik_harian (tanggal, pengunjung_unik, total_kunjungan) 
      VALUES 
        ($1, 45, 78),
        ($2, 38, 65),
        ($3, 42, 70),
        ($4, 35, 58),
        ($5, 40, 67),
        ($6, 48, 82),
        ($7, 52, 95)
      ON CONFLICT (tanggal) 
      DO UPDATE SET 
        pengunjung_unik = EXCLUDED.pengunjung_unik,
        total_kunjungan = EXCLUDED.total_kunjungan,
        updated_at = CURRENT_TIMESTAMP
    `,
      [today, yesterday, twoDaysAgo, threeDaysAgo, fourDaysAgo, fiveDaysAgo, sixDaysAgo],
    )

    // Tambahkan data contoh untuk analitik pengunjung
    const pages = ["/", "/about", "/gallery", "/blog", "/testimonials", "/contact"]
    const sessionIds = ["session1", "session2", "session3", "session4", "session5"]

    for (let i = 0; i < 100; i++) {
      const randomPage = pages[Math.floor(Math.random() * pages.length)]
      const randomSession = sessionIds[Math.floor(Math.random() * sessionIds.length)]
      const randomHoursAgo = Math.floor(Math.random() * 24)
      const timestamp = new Date(Date.now() - randomHoursAgo * 3600000)

      await query(
        `
        INSERT INTO analitik_pengunjung (session_id, ip_address, user_agent, halaman, referrer, timestamp)
        VALUES ($1, '127.0.0.1', 'Mozilla/5.0 (Example)', $2, 'https://example.com', $3)
      `,
        [randomSession, randomPage, timestamp],
      )
    }

    console.log("Seeding database berhasil!")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()

