-- =====================================================================
-- SI-BHP — MIGRASI: tambah kolom "target_stock" (Stok Ideal / Target Penuh)
-- =====================================================================
-- Dipakai untuk Laporan Pengadaan: Kebutuhan Beli = target_stock - stock.
--
-- Cara pakai: Supabase -> SQL Editor -> New query -> paste -> Run.
-- Aman dijalankan berulang (pakai IF NOT EXISTS).
-- =====================================================================

alter table materials
  add column if not exists target_stock int not null default 0 check (target_stock >= 0);

-- Untuk data yang sudah ada: samakan Stok Ideal dengan stok saat ini
-- (anggap stok sekarang = kondisi penuh). Boleh diedit nanti per BHP.
update materials set target_stock = stock where target_stock = 0;
