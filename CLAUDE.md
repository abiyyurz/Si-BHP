# CLAUDE.md — Memory Proyek SI-BHP

> ⚠️ **INSTRUKSI UNTUK CLAUDE:** File ini adalah memory proyek. Setiap kali kamu selesai
> membuat perubahan signifikan (fitur baru, perbaikan bug, perubahan format surat, dll),
> **WAJIB memperbarui bagian "Status Terkini" dan "Riwayat Update" di file ini** dalam
> respons yang sama — tanpa diminta. Tulis singkat, satu baris per perubahan.

## Tentang Proyek

**SI-BHP** — Sistem Informasi Inventaris Bahan Habis Pakai, Jurusan Teknik Mesin,
Politeknik Negeri Bengkalis. Pemilik: Abiyyu (pemula di web development — jelaskan
konsep teknis dengan bahasa sederhana, Bahasa Indonesia).

- Repo: https://github.com/Mozardrz/SI-BHP (branch `main`)
- Stack: React 18 + Vite, Tailwind CSS, Recharts, jsPDF, xlsx, **Supabase** (@supabase/supabase-js)
- Data: **Supabase Postgres** (project `dhfntzywjpevvbtkafew`, kunci di `.env` — gitignored).
  Semua akses data lewat `src/utils/storage.js` (async). Skema & seed: `supabase-setup.sql`.
- Jalankan: `npm run dev` → login `admin` / `admin123`. CATATAN: restart dev server jika `.env` berubah.

## Arsitektur Penting

- `src/utils/storage.js` — SEMUA CRUD data (labs, courses, materials, requests, transactions, users). Kalau migrasi ke backend, cukup ganti file ini.
- `src/utils/letter.js` — generator surat permohonan (HTML preview + `window.print()`). Format mengikuti `surat.docx` di root (sumber kebenaran format surat — selalu baca ulang docx ini jika user bilang formatnya berubah).
- `src/data/initialSeedData.js` — seed 13 lab + kepala lab + NIP.
- `src/data/kopLogo.js` — logo KOP surat (base64, dari KOP POLBENG.docx).
- `src/context/AuthContext.jsx` — login, sesi, profil, dark mode.
- Role: `admin` (teknisi) & `user`; tipe user (`user_type`): mahasiswa / dosen / admin.
- Aset: `src/assets/` (logo1.jpeg = logo aktif, gedung1.jpg = foto login — versi terkompres dari gedung1.png di root; gedung.jpeg = foto login lama).

## Konvensi

- Seluruh UI Bahasa Indonesia. Istilah: **BHP** (bukan BAP), **Dosen/Tendik** (bukan Dosen) di semua pilihan UI — kecuali TTD surat tetap "Dosen" (sesuai docx).
- Prodi (pilihan tetap): D3-Teknik Elektronika, D3-Teknik Mesin, D4-Teknik Mesin Produksi dan Perawatan.
- Riwayat Audit bersifat **immutable** — jangan pernah tambahkan fitur hapus di sana; koreksi lewat entri penyesuaian.
- Permohonan: hapus hanya untuk pending/ditolak; yang disetujui pakai "Batalkan" (stok dikembalikan). Keduanya wajib alasan + tercatat di audit.
- **KEPUTUSAN AUTH (final, 17 Jul 2026):** login custom berbasis tabel `users` (password hash SHA-256+salt), lupa-password = cocokkan username+email → langsung reset, TANPA kirim email/Supabase Auth. User sudah paham trade-off-nya dan menilai CUKUP untuk pemakaian internal jurusan — jangan tawarkan upgrade Supabase Auth lagi kecuali user sendiri yang minta.

## Status Terkini (per 17 Juli 2026)

**LIVE di https://si-bhp.netlify.app** (auto-deploy dari GitHub `main`).

Fitur selesai: dashboard, master BHP (+spesifikasi, +lab), 13 lab ter-seed, mata kuliah,
permohonan + approve/tolak/batalkan/hapus (dengan audit), cetak surat mahasiswa & dosen
(preview + print, KOP Polbeng, TTD kepala lab sesuai lab terpilih), stok kritis, riwayat
audit, kelola pengguna (username/password/tipe), profil (nama/foto kamera-file/password),
login page dengan foto gedung + logo1, ekspor PDF/Excel.

Format surat terkini: judul bertingkat 2 baris tanpa nomor; alamat "Kepada / Kepala
<nama lab> / Di Tempat"; identitas mahasiswa Nama-NIM-Prodi/Kelas-Laboratorium, dosen
Nama-Laboratorium; TTD kiri Pemohon (Mahasiswa+NIM / Dosen tanpa NIP), TTD kanan
"Mengetahui, Kepala <nama lab>" + nama & NIP kepala lab.

## Rencana Berikutnya (belum dikerjakan)

1. Uji coba (pilot) di 1 lab → rilis se-jurusan.
3. Ide tertunda: permohonan multi-bahan (template surat mendukung 5 baris), nomor surat otomatis (di-skip atas permintaan user), hapus file mati `src/pages/Equipment.jsx`.

## Riwayat Update

- 2026-07-18 (fitur tutup-siklus): Laporan Pengadaan dapat tombol **"Tandai Dibeli"** per baris (hanya jika Perlu Dibeli > 0) → modal konfirmasi jumlah (default = kekurangan) + catatan → `recordIncomingStock` (tambah stok + audit 'in') → stok naik, kebutuhan otomatis mengecil. Menutup alur: lihat kebutuhan → beli → 1 klik update stok. Build + smoke test ulang lulus (0 error).

- 2026-07-18 (verifikasi): E2E smoke test (raw CDP, `127.0.0.1:3001`) LULUS — login admin + 7 halaman (Stok, Lab, Permohonan, Stok Kritis, Laporan Pengadaan, Riwayat, Kelola Pengguna) + popup filter, **0 console error/exception**. Build lulus. Perbaikan kecil: kartu dashboard "Item Master" → "Jenis Item". Catatan: DB live sedang KOSONG (0 bahan); path tambah/edit BHP belum diuji E2E (mutasi DB produksi + butuh migrasi `target_stock`) — diverifikasi via review statik + build.

- 2026-07-18 (lanjutan sesi): **LAPORAN PENGADAAN + banyak revisi UI.** (a) Fitur baru **Laporan Pengadaan** (menu sidebar admin-only `procurement`, `src/pages/Procurement.jsx`): daftar semua BHP dgn Kebutuhan Beli = `target_stock − stock`, kolom Terpakai (total stok keluar dari transactions), filter Lab + toggle "hanya perlu dibeli", ekspor PDF/Excel (`exportProcurementPDF/Excel` + logo). **BUTUH kolom DB baru `materials.target_stock`** → jalankan `supabase-migration-target-stock.sql` di Supabase SEKALI (kalau belum, simpan BHP akan error). Field "Stok Ideal (Target Penuh)" ditambah di form Materials; `saveMaterial` default target_stock = stock bila kosong. (b) Jam Practical DIHAPUS dari Stok Bahan (form+tabel+ekspor); jam tetap di Permohonan. (c) Filter pola **tombol Filter → popup → chip** diterapkan di Materials, History (typeFilter), UsageRequests (statusFilter baru: pending/approved/rejected/cancelled). (d) Login: toggle show/hide password (ikon mata) di 3 form. (e) Filter Lab/Bengkel di Materials + semester filter 1–8. (f) Sidebar footer "Si-BHP 2026"; footer bawah kiri "© ARZ Project" (tanpa tahun); banner dashboard dikasih min-height biar foto welcome lebih terlihat. SEMUA lokal, build lulus, BELUM di-push.

- 2026-07-18: **REBRAND & REVISI UI (10 item, lokal, build lulus).** (1) Semua tulisan `SI-BHP` → `Si-BHP`. (2) Logo diganti ke `logo_polbeng.png` (dikompres 1024px/751KB → 256px/79KB di `src/assets/`, dipakai Navbar+Login). (3) Logo Polbeng ditambahkan di header PDF ekspor audit (base64 220px di `src/data/polbengLogo.js`, `doc.addImage` di `exportHistoryPDF`). (4) Semua simbol dash `—`/`-` di teks UI & ekspor dihilangkan. (5) Footer: teks mentok kiri-kanan (buang `max-w-7xl`), kiri "© 2026 ARZ Project ...", kanan "Jurusan Teknik Mesin • Lab/Bengkel". (6) Menu & judul "Laboratorium" → "Lab/Bengkel". (7) Kata "Master" dihapus di halaman BHP & Lab. (8) **Mata kuliah: dropdown dihapus dari form Tambah Stok BHP; jadi input teks manual di form Permohonan** (disimpan di `requests.course_id` sbg teks bebas; kolom Mata Kuliah di tabel Materials dihapus; `materials.course_id` di-set null). Menu + halaman "Mata Kuliah Terkait" DIHAPUS dari sidebar & routing (file `src/pages/Courses.jsx` jadi mati, blm dihapus). (9) Semester 1–6 → 1–8 di form Materials & Permohonan. Banner dashboard "Halo, <nama>" (dari revisi sebelumnya). CATATAN: perubahan ini BELUM di-push (nunggu user cek `npm run dev`).

- 2026-07-17: Banner selamat datang Dashboard kini pakai foto `welcome.jpeg` sebagai background (di-copy ke `src/assets/`, di-import), dengan overlay gradient navy→blue agar teks tetap terbaca. Bug input angka form permohonan diperbaiki: menghapus isi kolom Jumlah/Durasi tak lagi "nyangkut" di 0 — onChange kini membolehkan string kosong (`'' `) alih-alih memaksa `Number('')=0`; `required`+`min=1` tetap mencegah submit kosong.

- 2026-07-17: **VERIFIKASI E2E MENYELURUH LULUS** (24 cek, 0 gagal, 0 console error) — login/error/expiry sesi/ingat-saya, semua halaman utama, kelola pengguna (buat-duplikat-nonaktif-hapus), mobile hamburger, + smoke test situs live. Resep verifikasi disimpan di `.claude/skills/verify/SKILL.md` (raw CDP tanpa dependency, npm registry sering timeout). Siap dipakai klien; catatan: password admin masih admin123 — disarankan user menggantinya.

- 2026-07-17: Foto login diganti ke gedung1 (foto udara Jurusan TM) — dikompres dari PNG 11 MB ke JPG 306 KB (1600px, q72) demi kecepatan loading.

- 2026-07-17: Kotak info "Akun Master Admin Awal" (admin/admin123) di halaman login dihapus — kredensial tidak lagi terpampang publik.

- 2026-07-17: **INGAT SAYA (LOGIN)** — checkbox "Ingat saya" di form login. Dicentang: sesi permanen (seperti sebelumnya). Tidak dicentang: sesi hangus jika web ditinggalkan >5 menit (`IDLE_LIMIT_MS` di AuthContext; stempel `lastSeen` di-refresh tiap 30 dtk selama web terbuka + saat beforeunload/visibilitychange).

- 2026-07-17: **HAPUS AKUN NONAKTIF** — Kelola Pengguna: tombol hapus permanen (ikon tempat sampah) muncul hanya pada akun berstatus Nonaktif; ditolak jika akun punya riwayat permohonan/transaksi (jejak audit harus utuh) — akun seperti itu dibiarkan nonaktif. `deleteUser` di storage.js + konfirmasi sebelum hapus.

- 2026-07-17: **MENU MOBILE (HAMBURGER)** — sidebar tersembunyi di HP kini bisa dibuka lewat tombol garis-tiga di Navbar (drawer dari kiri + backdrop, menutup otomatis saat pilih menu / klik luar). File: App.jsx (state `sidebarOpen`), Navbar.jsx (tombol `md:hidden`), Sidebar.jsx (drawer `fixed` saat mobileOpen).

- 2026-07-17: **DEPLOY NETLIFY SUKSES** — live di **https://si-bhp.netlify.app** (auto-deploy dari GitHub `main`, env var Supabase terpasang di Netlify). Persiapan: hapus folder `.netlify` sisa percobaan gagal, buat `netlify.toml` (build `npm run build`, publish `dist`, SPA redirect). Alur update selanjutnya: cukup git push → Netlify build otomatis. Belum diverifikasi login di URL live.

- 2026-07-17: **AUTH DIPERKUAT** — password di-hash (SHA-256+salt, `src/utils/password.js`; akun lama plaintext auto-upgrade saat login), registrasi wajib email, fitur **Lupa Password** (username+email cocok → set password baru, tanpa kirim email — keputusan user), password minimal 8 karakter di semua form (+notif merah), Kelola Pengguna email wajib. Tes auth lulus. Commit "Migrate data layer to Supabase" + auth di-push ke GitHub.

- 2026-07-16 (larut): **MIGRASI SUPABASE SELESAI** — storage.js full async ke Supabase (semua CRUD + approval engine + audit), AuthContext login via DB (role select di login dihapus, cukup username+password), semua halaman & Navbar/Sidebar di-async-kan, widget "Mode Demo/Reset" dihapus, E2E test lulus (approve/batal/restock/hapus + audit). RLS masih allow-all (grant anon perlu dijalankan terpisah di SQL Editor — pernah gagal karena user me-rerun skrip lama yang error di create policy).

- 2026-07-16 (malam): Mulai Tahap 1 Supabase — install @supabase/supabase-js, buat `.env` (gitignored) + `src/utils/supabase.js` + `supabase-setup.sql` (6 tabel, RLS sementara allow-all, seed 13 lab + admin). Revisi UI: logo1.jpeg, overlay login SI-BHP/Jurusan TM, label Dosen/Tendik, prodi di form cetak, surat tanpa nomor + "Kepada/Kepala <lab>/Di Tempat" + TTD "Kepala <lab>". CLAUDE.md dibuat.

- 2026-07-16: Rebrand BAP→BHP; fitur lab (13 seed); surat permohonan (mhs/dosen) + revisi format (judul bertingkat, tanpa nomor, Kepada/Di Tempat, Prodi/Kelas, TTD "Kepala <lab>"); profil + foto kamera; kelola pengguna username/password/tipe; hapus/batalkan permohonan + audit; login page foto gedung + logo1; label Dosen/Tendik; ekspor PDF master tanpa TTD; commit awal ke GitHub.
