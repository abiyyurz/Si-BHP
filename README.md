# SI-BHP — Sistem Informasi Inventaris Bahan Habis Pakai

Sistem informasi untuk mengelola stok **Bahan Habis Pakai (BHP)** laboratorium & bengkel
**Jurusan Teknik Mesin, Politeknik Negeri Bengkalis**: mulai dari master data bahan,
permohonan pemakaian oleh mahasiswa/dosen, persetujuan admin/teknisi lab, sampai
pencetakan surat permohonan resmi ber-KOP Polbeng.

## Fitur

- **Dashboard** — ringkasan stok, permohonan pending, stok kritis, dan grafik pemakaian per semester.
- **Master Data BHP** — nama bahan, spesifikasi, satuan, stok, batas minimum, kualitas, mata kuliah terkait, dan laboratorium. Ekspor **PDF** & **Excel**.
- **Laboratorium** — 13 bengkel/laboratorium Teknik Mesin lengkap dengan **nama Kepala Lab & NIP** (dipakai untuk tanda tangan surat).
- **Mata Kuliah Terkait** — jadwal praktikum (hari & jam) yang terhubung ke bahan.
- **Permohonan & Pemakaian** — mahasiswa/dosen mengajukan bahan, admin melakukan **Approve/Tolak** (stok terpotong otomatis saat disetujui).
  - **Batalkan** permohonan yang terlanjur disetujui → stok dikembalikan otomatis.
  - **Hapus** permohonan pending/ditolak → wajib alasan, tercatat di audit.
- **Cetak Surat Permohonan** — preview surat resmi ber-KOP Politeknik Negeri Bengkalis lalu cetak lewat dialog print browser. Dua format otomatis:
  - **Mahasiswa** (Nama, NIM, Kelas, Laboratorium)
  - **Dosen** (Nama, Laboratorium)
  - Tanda tangan **Kepala Laboratorium menyesuaikan lab yang dipilih**.
- **Peringatan Stok Kritis** — daftar bahan di bawah threshold + restock cepat.
- **Riwayat & Audit Log** — ledger transaksi stok yang *immutable* (tidak bisa dihapus); pembatalan/penghapusan permohonan ikut tercatat. Ekspor PDF/Excel.
- **Manajemen Pengguna** — akun Mahasiswa / Dosen / Admin-Teknisi (username + password).
- **Profil** — ubah nama, foto profil (ambil dari **kamera** atau file), dan reset password.
- Mode gelap/terang.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Grafik | Recharts |
| Ekspor | jsPDF + jspdf-autotable, SheetJS (xlsx) |
| Penyimpanan | `localStorage` (demo — data per-browser) |

> **Catatan:** karena data tersimpan di `localStorage`, tiap browser/perangkat punya
> datanya sendiri. Untuk pemakaian multi-user sungguhan, lapisan data di
> `src/utils/storage.js` perlu dimigrasikan ke backend (mis. Supabase).

## Menjalankan

```bash
npm install
npm run dev
```

Buka alamat yang muncul (mis. `http://localhost:3000`).

**Akun awal:** username `admin` — password `admin123` (role Admin).

Build produksi:

```bash
npm run build     # hasil di dist/
npm run preview   # cek hasil build
```

## Struktur Singkat

```
src/
├── assets/          # logo Polbeng & foto gedung
├── components/      # layout (Navbar, Sidebar) & komponen umum (Modal, Button, ...)
├── context/         # AuthContext (login, sesi, profil, dark mode)
├── data/            # seed awal (13 lab + kepala lab) & logo KOP surat
├── pages/           # Dashboard, Materials, Labs, Courses, UsageRequests, dll.
└── utils/
    ├── storage.js   # seluruh akses data (CRUD + approval + audit)
    ├── letter.js    # generator surat permohonan (preview + print)
    └── exportUtils.js # ekspor PDF/Excel
```

---

© Politeknik Negeri Bengkalis — Jurusan Teknik Mesin.
