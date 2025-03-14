-- Buat tabel users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel galeri
CREATE TABLE IF NOT EXISTS galeri (
  id SERIAL PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  lokasi VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  gambar_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel blog
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
);

-- Buat tabel testimonial
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
);

-- Buat tabel analitik pengunjung
CREATE TABLE IF NOT EXISTS analitik_pengunjung (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  halaman VARCHAR(255) NOT NULL,
  referrer VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel untuk menyimpan statistik harian
CREATE TABLE IF NOT EXISTS statistik_harian (
  id SERIAL PRIMARY KEY,
  tanggal DATE NOT NULL UNIQUE,
  pengunjung_unik INT DEFAULT 0,
  total_kunjungan INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buat indeks untuk meningkatkan performa query
CREATE INDEX IF NOT EXISTS idx_analitik_session_id ON analitik_pengunjung(session_id);
CREATE INDEX IF NOT EXISTS idx_analitik_timestamp ON analitik_pengunjung(timestamp);
CREATE INDEX IF NOT EXISTS idx_analitik_halaman ON analitik_pengunjung(halaman);

-- Tambahkan user admin default (password: admin123)
-- Password sudah di-hash dengan bcrypt
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@brickproperty.com', '$2a$10$zH7.4s2AbH8Kc.0KI8Yw5uBGZcjlV5MuTvL61Tnl.bqTIjbLzEKGa', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Menambahkan data contoh untuk galeri
INSERT INTO galeri (judul, lokasi, deskripsi, gambar_url) 
VALUES 
  ('Modern Villa', 'Jakarta Selatan', 'Villa modern dengan 5 kamar tidur dan kolam renang pribadi', '/placeholder.svg?height=600&width=800'),
  ('Luxury Apartment', 'Jakarta Pusat', 'Apartemen mewah dengan pemandangan kota yang spektakuler', '/placeholder.svg?height=600&width=800'),
  ('Family House', 'Bandung', 'Rumah keluarga yang nyaman dengan taman luas', '/placeholder.svg?height=600&width=800'),
  ('Beachfront Villa', 'Bali', 'Villa tepi pantai dengan akses langsung ke pantai pribadi', '/placeholder.svg?height=600&width=800'),
  ('City Apartment', 'Surabaya', 'Apartemen modern di pusat kota dengan akses mudah ke fasilitas publik', '/placeholder.svg?height=600&width=800'),
  ('Mountain Retreat', 'Bogor', 'Rumah peristirahatan dengan pemandangan gunung yang menakjubkan', '/placeholder.svg?height=600&width=800')
ON CONFLICT DO NOTHING;

-- Menambahkan data contoh untuk blog
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
ON CONFLICT DO NOTHING;

-- Menambahkan data contoh untuk testimonial
INSERT INTO testimonial (nama, peran, pesan, rating, gambar_url, status) 
VALUES 
  ('Budi Santoso', 'Pengusaha', 'Saya sangat puas dengan pelayanan Brick Property. Tim mereka sangat profesional dan membantu saya menemukan properti investasi yang tepat. Prosesnya cepat dan transparan.', 5.0, '/placeholder.svg?height=200&width=200', 'disetujui'),
  ('Siti Rahayu', 'Dokter', 'Brick Property membantu keluarga kami menemukan rumah impian. Konsultannya sangat memahami kebutuhan kami dan memberikan rekomendasi yang sesuai dengan budget kami. Proses pembelian juga sangat lancar.', 4.5, '/placeholder.svg?height=200&width=200', 'disetujui'),
  ('Ahmad Rizki', 'Karyawan Swasta', 'Pengalaman pertama membeli rumah bersama Brick Property sangat menyenangkan. Mereka membantu saya dari awal hingga akhir proses. Sangat direkomendasikan untuk pembeli rumah pertama.', 5.0, '/placeholder.svg?height=200&width=200', 'disetujui'),
  ('Maya Putri', 'Ibu Rumah Tangga', 'Pelayanan cukup baik, tapi saya harus menunggu cukup lama untuk mendapatkan respon dari tim sales.', 3.5, '/placeholder.svg?height=200&width=200', 'menunggu'),
  ('Deni Wijaya', 'Wiraswasta', 'Properti yang ditawarkan sangat berkualitas dan sesuai dengan deskripsi. Saya sangat senang dengan pilihan yang saya buat.', 4.0, '/placeholder.svg?height=200&width=200', 'menunggu')
ON CONFLICT DO NOTHING;

-- Tambahkan data contoh untuk statistik harian (7 hari terakhir)
INSERT INTO statistik_harian (tanggal, pengunjung_unik, total_kunjungan) 
VALUES 
  (CURRENT_DATE, 45, 78),
  (CURRENT_DATE - INTERVAL '1 day', 38, 65),
  (CURRENT_DATE - INTERVAL '2 day', 42, 70),
  (CURRENT_DATE - INTERVAL '3 day', 35, 58),
  (CURRENT_DATE - INTERVAL '4 day', 40, 67),
  (CURRENT_DATE - INTERVAL '5 day', 48, 82),
  (CURRENT_DATE - INTERVAL '6 day', 52, 95)
ON CONFLICT (tanggal) 
DO UPDATE SET 
  pengunjung_unik = EXCLUDED.pengunjung_unik,
  total_kunjungan = EXCLUDED.total_kunjungan,
  updated_at = CURRENT_TIMESTAMP;

-- Tambahkan data contoh untuk analitik pengunjung
-- Halaman beranda
INSERT INTO analitik_pengunjung (session_id, ip_address, user_agent, halaman, referrer, timestamp)
SELECT 
  'session' || (random() * 5 + 1)::int,
  '127.0.0.1',
  'Mozilla/5.0 (Example)',
  '/',
  'https://example.com',
  CURRENT_TIMESTAMP - (random() * 24 * 60 * 60 * interval '1 second')
FROM generate_series(1, 30);

-- Halaman about
INSERT INTO analitik_pengunjung (session_id, ip_address, user_agent, halaman, referrer, timestamp)
SELECT 
  'session' || (random() * 5 + 1)::int,
  '127.0.0.1',
  'Mozilla/5.0 (Example)',
  '/about',
  'https://example.com',
  CURRENT_TIMESTAMP - (random() * 24 * 60 * 60 * interval '1 second')
FROM generate_series(1, 20);

-- Halaman gallery
INSERT INTO analitik_pengunjung (session_id, ip_address, user_agent, halaman, referrer, timestamp)
SELECT 
  'session' || (random() * 5 + 1)::int,
  '127.0.0.1',
  'Mozilla/5.0 (Example)',
  '/gallery',
  'https://example.com',
  CURRENT_TIMESTAMP - (random() * 24 * 60 * 60 * interval '1 second')
FROM generate_series(1, 25);

-- Halaman blog
INSERT INTO analitik_pengunjung (session_id, ip_address, user_agent, halaman, referrer, timestamp)
SELECT 
  'session' || (random() * 5 + 1)::int,
  '127.0.0.1',
  'Mozilla/5.0 (Example)',
  '/blog',
  'https://example.com',
  CURRENT_TIMESTAMP - (random() * 24 * 60 * 60 * interval '1 second')
FROM generate_series(1, 15);

-- Halaman testimonials
INSERT INTO analitik_pengunjung (session_id, ip_address, user_agent, halaman, referrer, timestamp)
SELECT 
  'session' || (random() * 5 + 1)::int,
  '127.0.0.1',
  'Mozilla/5.0 (Example)',
  '/testimonials',
  'https://example.com',
  CURRENT_TIMESTAMP - (random() * 24 * 60 * 60 * interval '1 second')
FROM generate_series(1, 10);

-- Halaman contact
INSERT INTO analitik_pengunjung (session_id, ip_address, user_agent, halaman, referrer, timestamp)
SELECT 
  'session' || (random() * 5 + 1)::int,
  '127.0.0.1',
  'Mozilla/5.0 (Example)',
  '/contact',
  'https://example.com',
  CURRENT_TIMESTAMP - (random() * 24 * 60 * 60 * interval '1 second')
FROM generate_series(1, 12);


-- jika ingin menghasilkan IP random
INSERT INTO analitik_pengunjung (session_id, ip_address, user_agent, halaman, referrer, timestamp)
SELECT 
  'session' || (random() * 5 + 1)::int,
  (trunc(random() * 255)::int || '.' ||
   trunc(random() * 255)::int || '.' ||
   trunc(random() * 255)::int || '.' ||
   trunc(random() * 255)::int)::text,
  'Mozilla/5.0 (Example)',
  '/',
  'https://example.com',
  CURRENT_TIMESTAMP - (random() * 24 * 60 * 60 * interval '1 second')
FROM generate_series(1, 30);
