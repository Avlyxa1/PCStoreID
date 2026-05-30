-- ============================================================
-- PC BUILDER DATABASE SCHEMA & SEED DATA
-- Database: db_pcstore (Updated Version)
-- ============================================================

-- Disable foreign key checks untuk smooth drop
SET FOREIGN_KEY_CHECKS=0;

-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS db_pcstore;
USE db_pcstore;

-- ============================================================
-- 1. TABEL KATEGORI PART
-- ============================================================
DROP TABLE IF EXISTS kategori_part;
CREATE TABLE kategori_part (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(50) NOT NULL UNIQUE,
  urutan_builder INT UNIQUE COMMENT 'Urutan dalam wizard builder (1=CPU, 2=Mobo, dst)',
  deskripsi VARCHAR(255)
);

-- ============================================================
-- 2. TABEL PRODUK (Diperkaya dengan atribut kompatibilitas)
-- ============================================================
DROP TABLE IF EXISTS produk;
CREATE TABLE produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_produk VARCHAR(100) NOT NULL,
  kategori_id INT NOT NULL,
  harga INT NOT NULL,
  spesifikasi VARCHAR(500),
  stok INT NOT NULL DEFAULT 0,
  
  -- Atribut Kompatibilitas
  socket_type VARCHAR(50) COMMENT 'LGA1700, AM5, AM4, dll (CPU/Mobo/Cooler)',
  ram_type VARCHAR(50) COMMENT 'DDR5, DDR4 (RAM/Mobo)',
  form_factor VARCHAR(50) COMMENT 'ATX, Micro-ATX, Mini-ITX (Mobo/Case/PSU)',
  tdp_watt INT COMMENT 'TDP dalam Watt (CPU/GPU/Cooler)',
  support_socket VARCHAR(500) COMMENT 'Socket yang didukung (Cooler), comma-separated',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategori_part(id),
  INDEX idx_kategori (kategori_id),
  INDEX idx_socket (socket_type),
  INDEX idx_ram_type (ram_type),
  INDEX idx_form_factor (form_factor)
);

-- ============================================================
-- 3. TABEL KOMPATIBILITAS (Relasi Eksplisit)
-- ============================================================
DROP TABLE IF EXISTS kompatibilitas;
CREATE TABLE kompatibilitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produk_id_1 INT NOT NULL,
  produk_id_2 INT NOT NULL,
  kategori_1 VARCHAR(50) COMMENT 'Kategori produk 1',
  kategori_2 VARCHAR(50) COMMENT 'Kategori produk 2',
  tipe_kompatibilitas VARCHAR(50) COMMENT 'socket, ram_type, form_factor, power, dll',
  is_compatible BOOLEAN DEFAULT TRUE,
  notes VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (produk_id_1) REFERENCES produk(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id_2) REFERENCES produk(id) ON DELETE CASCADE,
  UNIQUE KEY unique_compat (produk_id_1, produk_id_2),
  INDEX idx_kategori_pair (kategori_1, kategori_2)
);

-- ============================================================
-- 4. TABEL PEMBAYARAN (TRANSAKSI RAKITAN)
-- ============================================================
DROP TABLE IF EXISTS pembayaran;
CREATE TABLE pembayaran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_pembeli VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  no_telepon VARCHAR(20),
  
  -- Untuk transaksi tunggal atau rakitan
  tipe_pembelian ENUM('single', 'rakitan') DEFAULT 'single',
  total_harga INT NOT NULL,
  total_watt INT COMMENT 'Total estimasi watt untuk PC rakitan',
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- ============================================================
-- 5. TABEL PEMBAYARAN_DETAIL (Detail Komponen Rakitan)
-- ============================================================
DROP TABLE IF EXISTS pembayaran_detail;
CREATE TABLE pembayaran_detail (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pembayaran_id INT NOT NULL,
  produk_id INT NOT NULL,
  nama_produk VARCHAR(100) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  harga_per_unit INT NOT NULL,
  jumlah INT DEFAULT 1,
  subtotal INT NOT NULL,
  
  FOREIGN KEY (pembayaran_id) REFERENCES pembayaran(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id) REFERENCES produk(id),
  INDEX idx_pembayaran (pembayaran_id)
);

-- ============================================================
-- INSERT: KATEGORI PART
-- ============================================================
INSERT INTO kategori_part (nama_kategori, urutan_builder, deskripsi) VALUES
('CPU', 1, 'Processor/Prosesor'),
('Motherboard', 2, 'Papan Induk'),
('RAM', 3, 'Memory/Memori'),
('Storage', 4, 'SSD/HDD Penyimpanan'),
('GPU', 5, 'Kartu Grafis'),
('PSU', 6, 'Power Supply Unit'),
('Case', 7, 'Casing CPU'),
('Cooler', 8, 'Pendingin Prosesor');

-- ============================================================
-- INSERT: PRODUK (INTEL BUILD SET)
-- ============================================================

-- Intel CPU
INSERT INTO produk (nama_produk, kategori_id, harga, spesifikasi, stok, socket_type, tdp_watt) VALUES
('Intel Core i7-13700K', 1, 4500000, '16 Core 24T, 3.4GHz Base', 5, 'LGA1700', 125),
('Intel Core i5-13600K', 1, 3200000, '14 Core 20T, 3.5GHz Base', 8, 'LGA1700', 125);

-- Intel Motherboard (LGA1700 + DDR5)
INSERT INTO produk (nama_produk, kategori_id, harga, spesifikasi, stok, socket_type, ram_type, form_factor) VALUES
('ASUS ROG STRIX Z790-E', 2, 5000000, 'LGA1700, DDR5, ATX, PCIe 5.0', 3, 'LGA1700', 'DDR5', 'ATX'),
('MSI MPG B760M Edge', 2, 2500000, 'LGA1700, DDR5, Micro-ATX', 6, 'LGA1700', 'DDR5', 'Micro-ATX');

-- RAM DDR5
INSERT INTO produk (nama_produk, kategori_id, harga, spesifikasi, stok, ram_type) VALUES
('Kingston Fury Beast 16GB DDR5-5600', 3, 900000, 'DDR5, 16GB, 5600MHz', 10, 'DDR5'),
('Corsair Vengeance 32GB DDR5-5600', 3, 1600000, 'DDR5, 32GB, 5600MHz Dual Channel', 7, 'DDR5');

-- Storage
INSERT INTO produk (nama_produk, kategori_id, harga, spesifikasi, stok, form_factor) VALUES
('Samsung 990 Pro 1TB', 4, 1200000, 'NVMe M.2 PCIe 4.0', 8, 'M.2'),
('WD Black SN850X 1TB', 4, 1000000, 'NVMe M.2 PCIe 4.0', 10, 'M.2'),
('Seagate Barracuda 4TB', 4, 1200000, 'HDD 3.5 SATA', 12, '3.5');

-- GPU
INSERT INTO produk (nama_produk, kategori_id, harga, spesifikasi, stok, form_factor, tdp_watt) VALUES
('RTX 4080 Super', 5, 15000000, 'NVIDIA, 16GB GDDR6X, Dual Slot', 2, 'ATX', 320),
('RTX 4070 Ti', 5, 10000000, 'NVIDIA, 12GB GDDR6X', 3, 'ATX', 285),
('RTX 4060', 5, 3500000, 'NVIDIA, 8GB GDDR6', 6, 'ATX', 130);

-- PSU
INSERT INTO produk (nama_produk, kategori_id, harga, spesifikasi, stok, form_factor) VALUES
('Corsair RM1000e 1000W', 6, 2500000, '1000W, 80+ Gold, Modular', 5, 'ATX'),
('Seasonic Focus GX 750W', 6, 1800000, '750W, 80+ Gold, Modular', 8, 'ATX');

-- Case
INSERT INTO produk (nama_produk, kategori_id, harga, spesifikasi, stok, form_factor) VALUES
('NZXT H7 Flow RGB', 7, 2000000, 'Mid-Tower ATX, Tempered Glass', 6, 'ATX'),
('Fractal Design Core 1000', 7, 800000, 'Mid-Tower ATX, Simple Design', 10, 'ATX');

-- Cooler
INSERT INTO produk (nama_produk, kategori_id, harga, spesifikasi, stok, socket_type, support_socket, tdp_watt) VALUES
('Noctua NH-D15 Chromax', 8, 1500000, 'Air Cooler, Dual Tower', 6, 'LGA1700', 'LGA1700,AM5,AM4', 250),
('Corsair H150i Elite Capellix', 8, 2500000, 'Liquid Cooler 360mm AIO', 4, 'LGA1700', 'LGA1700,AM5', 280);

-- ============================================================
-- INSERT: PRODUK (AMD BUILD SET)
-- ============================================================

-- AMD CPU
INSERT INTO produk (nama_produk, kategori_id, harga, spesifikasi, stok, socket_type, tdp_watt) VALUES
('AMD Ryzen 7 5800X3D', 1, 3800000, '8 Core 16T, 3.4GHz Base', 4, 'AM5', 105),
('AMD Ryzen 5 5600X', 1, 2200000, '6 Core 12T, 3.7GHz Base', 9, 'AM5', 65);

-- AMD Motherboard (AM5 + DDR5)
INSERT INTO produk (nama_produk, kategori_id, harga, spesifikasi, stok, socket_type, ram_type, form_factor) VALUES
('MSI MPG B650E Edge', 2, 3500000, 'AM5, DDR5, ATX, PCIe 5.0', 4, 'AM5', 'DDR5', 'ATX'),
('ASUS ROG STRIX B650-I', 2, 4000000, 'AM5, DDR5, Mini-ITX', 5, 'AM5', 'DDR5', 'Mini-ITX');

-- ============================================================
-- INSERT: KOMPATIBILITAS (Definisi Rule Kompatibilitas)
-- ============================================================

-- Intel CPU (ID 1-2) + Intel Mobo (ID 3-4) - Socket Match
INSERT INTO kompatibilitas (produk_id_1, produk_id_2, kategori_1, kategori_2, tipe_kompatibilitas, is_compatible, notes) VALUES
(1, 3, 'CPU', 'Motherboard', 'socket', TRUE, 'i7-13700K LGA1700 cocok dengan ASUS ROG Z790-E'),
(1, 4, 'CPU', 'Motherboard', 'socket', TRUE, 'i7-13700K LGA1700 cocok dengan MSI B760M'),
(2, 3, 'CPU', 'Motherboard', 'socket', TRUE, 'i5-13600K LGA1700 cocok dengan ASUS ROG Z790-E'),
(2, 4, 'CPU', 'Motherboard', 'socket', TRUE, 'i5-13600K LGA1700 cocok dengan MSI B760M');

-- RAM (ID 5-6) + Mobo (ID 3-4) - RAM Type Match
INSERT INTO kompatibilitas (produk_id_1, produk_id_2, kategori_1, kategori_2, tipe_kompatibilitas, is_compatible, notes) VALUES
(5, 3, 'RAM', 'Motherboard', 'ram_type', TRUE, 'Kingston DDR5 cocok dengan ASUS ROG Z790-E (DDR5)'),
(5, 4, 'RAM', 'Motherboard', 'ram_type', TRUE, 'Kingston DDR5 cocok dengan MSI B760M (DDR5)'),
(6, 3, 'RAM', 'Motherboard', 'ram_type', TRUE, 'Corsair DDR5 cocok dengan ASUS ROG Z790-E'),
(6, 4, 'RAM', 'Motherboard', 'ram_type', TRUE, 'Corsair DDR5 cocok dengan MSI B760M');

-- GPU (ID 10-12) + PSU (ID 13-14) - Power Check
INSERT INTO kompatibilitas (produk_id_1, produk_id_2, kategori_1, kategori_2, tipe_kompatibilitas, is_compatible, notes) VALUES
(10, 13, 'GPU', 'PSU', 'power', TRUE, 'RTX 4080 Super (320W) cocok dengan PSU 1000W'),
(10, 14, 'GPU', 'PSU', 'power', FALSE, 'RTX 4080 Super (320W) TIDAK cocok dengan PSU 750W (kurang)'),
(11, 13, 'GPU', 'PSU', 'power', TRUE, 'RTX 4070 Ti (285W) cocok dengan PSU 1000W'),
(11, 14, 'GPU', 'PSU', 'power', TRUE, 'RTX 4070 Ti (285W) cocok dengan PSU 750W'),
(12, 13, 'GPU', 'PSU', 'power', TRUE, 'RTX 4060 (130W) cocok dengan PSU 1000W'),
(12, 14, 'GPU', 'PSU', 'power', TRUE, 'RTX 4060 (130W) cocok dengan PSU 750W');

-- Cooler (ID 17-18) + CPU (ID 1-2) - Socket Support
INSERT INTO kompatibilitas (produk_id_1, produk_id_2, kategori_1, kategori_2, tipe_kompatibilitas, is_compatible, notes) VALUES
(17, 1, 'Cooler', 'CPU', 'socket', TRUE, 'Noctua NH-D15 support LGA1700 (i7-13700K)'),
(17, 2, 'Cooler', 'CPU', 'socket', TRUE, 'Noctua NH-D15 support LGA1700 (i5-13600K)'),
(18, 1, 'Cooler', 'CPU', 'socket', TRUE, 'Corsair H150i support LGA1700'),
(18, 2, 'Cooler', 'CPU', 'socket', TRUE, 'Corsair H150i support LGA1700');

-- AMD CPU (ID 19-20) + AMD Mobo (ID 21-22) - Socket Match
INSERT INTO kompatibilitas (produk_id_1, produk_id_2, kategori_1, kategori_2, tipe_kompatibilitas, is_compatible, notes) VALUES
(19, 21, 'CPU', 'Motherboard', 'socket', TRUE, 'Ryzen 7 5800X3D AM5 cocok dengan MSI MPG B650E'),
(19, 22, 'CPU', 'Motherboard', 'socket', TRUE, 'Ryzen 7 5800X3D AM5 cocok dengan ASUS B650-I'),
(20, 21, 'CPU', 'Motherboard', 'socket', TRUE, 'Ryzen 5 5600X AM5 cocok dengan MSI MPG B650E'),
(20, 22, 'CPU', 'Motherboard', 'socket', TRUE, 'Ryzen 5 5600X AM5 cocok dengan ASUS B650-I');

-- ============================================================
-- TESTING: Query kompatibilitas sederhana
-- ============================================================
-- SELECT * FROM kompatibilitas WHERE tipe_kompatibilitas='socket' LIMIT 5;
-- SELECT nama_produk, socket_type FROM produk WHERE kategori_id=1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;