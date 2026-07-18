-- =====================================================================
-- SI-BHP — RESET DATA TEST
-- =====================================================================
-- Cara pakai:
--   1. Buka supabase.com -> login -> pilih project SI-BHP
--   2. Menu kiri: SQL Editor -> New query
--   3. Copy-paste SALAH SATU blok di bawah, lalu klik "Run"
--
-- PERINGATAN: perintah ini menghapus data secara PERMANEN (tidak bisa
-- di-undo). Pastikan hanya dijalankan saat memang mau membersihkan
-- data uji coba, bukan data asli.
-- =====================================================================


-- ---------------------------------------------------------------------
-- OPSI A (umum) — Kosongkan data operasional, SISAKAN 13 lab + semua akun
-- ---------------------------------------------------------------------
-- Hasil: stok bahan, permohonan, transaksi, riwayat audit, dan mata
-- kuliah jadi kosong. Lab dan akun pengguna TIDAK dihapus.
truncate transactions, requests, materials, courses restart identity cascade;


-- ---------------------------------------------------------------------
-- OPSI B (bersih total) — Seperti Opsi A + hapus semua user KECUALI admin
-- ---------------------------------------------------------------------
-- Jalankan DUA baris ini bila ingin akun test ikut terhapus, sisakan
-- hanya akun 'admin'.
-- truncate transactions, requests, materials, courses restart identity cascade;
-- delete from users where username <> 'admin';
