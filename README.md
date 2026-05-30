# PcStoreID

## Anggota Kelompok

- Nama : Rafly Enggar Tiarso
- NIM : 2410501067

- Nama : Muhammad Kevin
- NIM : 2410501040

- Nama : Bagas Bani Aryasatya
- NIM : 2410501055

## Deskripsi Aplikasi

PcStoreID adalah aplikasi web e-commerce untuk penjualan komponen PC. Pengguna dapat membeli produk per item melalui Browse Store beserta keranjang belanja, atau merakit PC lewat wizard PC Builder berisi 8 langkah dengan pengecekan kompatibilitas.

Aplikasi ini dibangun dengan React di sisi frontend, Express di sisi backend, serta kombinasi MySQL dan MongoDB untuk penyimpanan data.

## Fitur Utama

### API (Backend REST)

- **Manajemen produk**: `GET /api/produk` mengambil daftar komponen dari MySQL, dengan filter opsional `kategori_id`.
- **PC Builder**: `GET /api/builder/kategori` mengembalikan urutan langkah perakitan; `GET /api/builder/produk` mengembalikan produk per kategori dengan filter kompatibilitas (`socket_type`, `ram_type`, `form_factor`).
- **Validasi kompatibilitas**: `POST /api/builder/validate-compatibility` memeriksa dua produk; `POST /api/builder/calculate-tdp` menghitung total daya dan rekomendasi PSU; `POST /api/builder/validate-build` memastikan rakitan memenuhi komponen wajib.
- **Checkout**: `POST /api/bayar/rakitan` memproses pembayaran banyak item dalam satu transaksi MySQL (insert pembayaran, detail, dan update stok). `POST /api/bayar` tetap tersedia untuk pembelian produk tunggal (legacy).
- **Riwayat transaksi**: `GET /api/pembayaran/:pembayaran_id` menampilkan detail pembayaran.
- **Log aktivitas**: `GET /api/logs` membaca catatan dari MongoDB.
- **Health check**: `GET /api/health` memeriksa status server.

### Frontend dan Backend

- Frontend React (`App.jsx`) memanggil API melalui Axios ke server Express di `http://localhost:5000`.
- **Browse Store**: filter kategori, grid produk, keranjang belanja (jumlah item, ubah qty, hapus item), dan checkout lewat modal formulir.
- **PC Builder**: wizard 8 langkah (CPU, Motherboard, RAM, Storage, GPU, PSU, Case, Cooler), panel ringkasan rakitan, perhitungan TDP di UI, serta checkout setelah validasi komponen wajib terpenuhi.
- Backend memakai pola MVC (`controllers/`, `helpers/`) dengan middleware CORS dan `express.json()` untuk request body JSON.
- Alur checkout: frontend mengirim payload (data pembeli + daftar produk) ke backend; backend menjalankan transaksi database lalu mengembalikan respons sukses atau error ke frontend.

### Multi Database

- **MySQL**: menyimpan data utama—produk, kategori, aturan kompatibilitas, pembayaran, detail pembayaran, dan stok. Transaksi checkout memakai `START TRANSACTION` / `COMMIT` / `ROLLBACK` agar data tetap konsisten.
- **MongoDB**: menyimpan log aktivitas transaksi (misalnya pembelian berhasil) menggunakan Mongoose. Jika penulisan log gagal, transaksi di MySQL tetap dianggap sukses.
- Pembagian peran: MySQL untuk data bisnis yang harus akurat; MongoDB untuk audit trail dan monitoring yang tidak mengganggu alur pembayaran.

## Cara Menjalankan

### 1. Clone repository

```bash
git clone https://github.com/Avlyxa1/PCStoreID.git
cd PcStoreID
```

### 2. Setup database MySQL

1. Buat database bernama `db_pcstore`.
2. Jalankan skema dan data awal dari file `backend/db_schema.sql` (phpMyAdmin atau klien MySQL lain).
3. Sesuaikan koneksi di `backend/mysql.js` (host, user, password).

### 3. Setup backend

```bash
cd backend
npm install
npm start
```

Server berjalan di `http://localhost:5000`.

Pastikan MongoDB aktif jika ingin fitur log berfungsi. Sesuaikan connection string di `backend/mongo.js` bila diperlukan.

### 4. Setup frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm start
```

Aplikasi terbuka di `http://localhost:3000`. Pastikan backend sudah berjalan agar data produk dan checkout dapat dimuat.


## Tech Stack

| Lapisan    | Teknologi                          |
| ---------- | ---------------------------------- |
| Frontend   | React 19, Axios, CSS               |
| Backend    | Express 5, Node.js                 |
| Database   | MySQL (mysql2), MongoDB (Mongoose) |
