# PRD — [NAMA PROYEK]

> **Cara pakai template ini:**
> 1. Salin file ini ke folder proyek baru, ganti namanya jadi `PRD.md`.
> 2. Isi semua bagian bertanda `[...]`. Hapus baris petunjuk (yang diawali `>`) setelah diisi.
> 3. Bagian yang tidak relevan boleh ditulis "Tidak ada" — jangan dihapus, supaya AI/developer tahu itu memang sudah dipikirkan, bukan kelupaan.
> 4. Upload/berikan file ini ke Claude (atau developer) dengan perintah: *"Buatkan aplikasi web sesuai PRD ini."*

---

## 1. Ringkasan Proyek

| | |
|---|---|
| **Nama aplikasi** | [contoh: SI-BHP] |
| **Kepanjangan / arti nama** | [contoh: Sistem Informasi Bahan Habis Pakai] |
| **Pemilik / klien** | [nama orang atau instansi] |
| **Deskripsi 1 kalimat** | [aplikasi ini untuk apa, dipakai siapa] |
| **Masalah yang diselesaikan** | [apa yang sekarang repot/manual, dan bagaimana web ini membantunya] |
| **Bahasa UI** | [Indonesia / Inggris / dua-duanya] |

## 2. Pengguna & Hak Akses (Role)

> Sebutkan semua jenis pengguna. Minimal biasanya ada admin dan user biasa.

| Role | Siapa mereka | Boleh melakukan apa | TIDAK boleh apa |
|---|---|---|---|
| [admin] | [contoh: teknisi lab] | [kelola semua data, approve permohonan] | [—] |
| [user] | [contoh: mahasiswa/dosen] | [lihat data, buat permohonan] | [edit data master, lihat menu admin] |

**Cara login:** [username+password / email+password / tanpa login]
**Registrasi:** [user daftar sendiri / hanya admin yang membuatkan akun]
**Lupa password:** [reset via email / cocokkan data lalu reset langsung / hubungi admin]

## 3. Fitur

> Pisahkan berdasarkan prioritas supaya pengerjaan bertahap dan versi 1 cepat jadi.

### 3.1 WAJIB ada di versi 1 (tanpa ini aplikasi tidak berguna)
- [ ] [contoh: login & role]
- [ ] [contoh: CRUD data barang — tambah/lihat/edit/hapus]
- [ ] [contoh: dashboard ringkasan]
- [ ] [...]

### 3.2 PENTING tapi boleh menyusul (versi 1.1)
- [ ] [contoh: ekspor PDF/Excel]
- [ ] [contoh: notifikasi stok menipis]
- [ ] [...]

### 3.3 NANTI saja / ide (jangan dikerjakan dulu)
- [ ] [contoh: kirim email otomatis]
- [ ] [...]

## 4. Halaman & Alur

> Daftar semua halaman. Untuk alur penting (misal: proses persetujuan), tulis langkah-langkahnya.

### 4.1 Daftar halaman

| Halaman | Untuk role | Isi utama |
|---|---|---|
| Login | semua | form login + registrasi |
| Dashboard | semua | [statistik ringkas, grafik apa saja] |
| [nama halaman] | [role] | [isinya apa, tombol apa saja] |

### 4.2 Alur penting

**Alur [contoh: permohonan barang]:**
1. User mengisi form [apa saja field-nya]
2. Status awal: [pending]
3. Admin melihat daftar → [setujui / tolak + alasan]
4. Jika disetujui: [stok berkurang otomatis, tercatat di riwayat]
5. [dst...]

## 5. Data (apa saja yang disimpan)

> Sebutkan "tabel" datanya dalam bahasa sehari-hari. Tidak perlu teknis — cukup daftar kolomnya.

**[Contoh: Barang]**
- nama barang, spesifikasi, satuan (pcs/kg/liter), jumlah stok, stok minimum, [kategori/lab/lokasi]

**[Contoh: Pengguna]**
- nama lengkap, username, password, email, role, status aktif

**[Contoh: Permohonan]**
- siapa yang minta, barang apa, berapa, untuk kapan, status, catatan admin

**Aturan data penting:**
- [contoh: stok tidak boleh minus]
- [contoh: riwayat/audit tidak boleh bisa dihapus]
- [contoh: username tidak boleh kembar]

## 6. Tampilan & Desain

| | |
|---|---|
| **Warna utama** | [contoh: biru navy & teal / ikuti warna logo instansi] |
| **Logo** | [ada file-nya? sebutkan nama file. belum ada? tulis "pakai teks dulu"] |
| **Mode gelap (dark mode)** | [perlu / tidak] |
| **Wajib enak dipakai di HP?** | [ya — kebanyakan user pakai HP / tidak, mayoritas laptop] |
| **Referensi tampilan** | [link/nama aplikasi yang tampilannya kamu suka, boleh kosong] |

## 7. Teknologi (Stack)

> Kalau tidak paham bagian ini, tulis: **"Terserah developer/AI, pilihkan yang paling umum & mudah dirawat"** — itu jawaban yang benar.

| | Pilihan | Catatan |
|---|---|---|
| Frontend | [React + Vite / Next.js / terserah] | [React+Vite: SPA sederhana, cocok untuk app internal] |
| Styling | [Tailwind CSS / terserah] | |
| Database | [Supabase / tanpa database (localStorage) / terserah] | [Supabase gratis & cukup untuk app internal] |
| Hosting | [Netlify / Vercel / terserah] | [gratis untuk proyek kecil] |
| Library tambahan | [contoh: Recharts (grafik), jsPDF (cetak PDF), xlsx (Excel)] | |

## 8. Struktur File Proyek

> Struktur standar yang terbukti rapi (React + Vite). Biarkan saja kecuali punya preferensi lain.

```
nama-proyek/
├── PRD.md                     ← file ini
├── CLAUDE.md                  ← memory proyek untuk AI (dibuat otomatis oleh Claude)
├── .env                       ← kunci rahasia (Supabase dll) — JANGAN masuk GitHub
├── .gitignore                 ← wajib berisi: node_modules, dist, .env
├── netlify.toml               ← konfigurasi deploy
├── package.json
├── index.html
├── vite.config.js
├── tailwind.config.js
└── src/
    ├── main.jsx               ← titik masuk aplikasi
    ├── App.jsx                ← kerangka halaman + navigasi antar page
    ├── index.css
    ├── assets/                ← gambar, logo (kompres dulu! maks ±300 KB per foto)
    ├── components/
    │   ├── common/            ← komponen dipakai berulang: Button, Modal, Toast, Table
    │   └── layout/            ← Navbar, Sidebar, Footer
    ├── context/
    │   └── AuthContext.jsx    ← login, sesi, dark mode
    ├── pages/                 ← satu file per halaman (Login, Dashboard, dst)
    ├── utils/
    │   ├── storage.js         ← SEMUA baca/tulis data lewat sini (gampang ganti backend)
    │   ├── formatters.js      ← format tanggal, angka, rupiah
    │   └── supabase.js        ← koneksi database
    └── data/
        └── seedData.js        ← data awal (contoh/master)
```

**Prinsip penting untuk AI/developer:**
- Semua akses data HANYA lewat `src/utils/storage.js` — kalau ganti database, cukup ubah 1 file.
- Komponen UI berulang (tombol, modal, tabel) dibuat sekali di `components/common/`, jangan copy-paste.
- Kunci API di `.env`, tidak pernah ditulis langsung di kode.

## 9. Keamanan & Aturan Wajib

- [ ] Password disimpan ter-hash (bukan teks polos), minimal 8 karakter
- [ ] Kredensial default TIDAK ditampilkan di halaman login
- [ ] Halaman admin tidak bisa diakses role user (dicek di kode, bukan cuma disembunyikan)
- [ ] Validasi input di semua form (angka tidak boleh minus, field wajib, dll)
- [ ] `.env` masuk `.gitignore`
- [ ] [aturan khusus proyek ini: ...]

## 10. Deployment

| | |
|---|---|
| **Repo GitHub** | [nama repo, private/public] |
| **Hosting** | [Netlify — import dari GitHub, auto-deploy tiap push] |
| **Env var yang harus diisi di hosting** | [contoh: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY] |
| **Domain** | [pakai subdomain gratis dulu (namaproyek.netlify.app) / punya domain sendiri: ...] |

## 11. Tahapan Pengerjaan (Milestone)

> Urutan yang terbukti enak: fungsi dulu, data sungguhan belakangan, deploy paling akhir.

1. **Tahap 1 — Kerangka & fitur inti:** login + role, halaman utama, CRUD data pakai data dummy/localStorage dulu. *Selesai jika: semua fitur WAJIB (3.1) jalan di laptop.*
2. **Tahap 2 — Database sungguhan:** migrasi ke Supabase (cukup ganti `storage.js`), perkuat auth. *Selesai jika: data tersimpan permanen & bisa diakses 2 perangkat.*
3. **Tahap 3 — Deploy:** GitHub → Netlify + env var. *Selesai jika: bisa dibuka dari HP siapa pun.*
4. **Tahap 4 — Uji coba (pilot):** dipakai [siapa] selama [berapa lama], kumpulkan masukan, perbaiki.
5. **Tahap 5 — Rilis:** [ganti password admin!], serahkan ke pengguna.

## 12. Kriteria "Selesai"

> Aplikasi dianggap jadi kalau semua ini terpenuhi:

- [ ] Semua fitur WAJIB (bagian 3.1) berfungsi dan sudah dites end-to-end
- [ ] Bisa dipakai di HP dan laptop
- [ ] Tidak ada error di console browser
- [ ] Sudah live di internet dan bisa login dari perangkat lain
- [ ] [kriteria khusus: ...]

---

## Lampiran: Catatan untuk AI (Claude)

> Biarkan bagian ini — instruksi standar supaya hasil AI konsisten.

- Buat `CLAUDE.md` sebagai memory proyek dan perbarui setiap ada perubahan signifikan.
- Kerjakan sesuai urutan milestone; jangan lompat ke fitur "NANTI".
- Jelaskan konsep teknis dengan bahasa sederhana (pemilik proyek bukan programmer).
- Setiap selesai fitur besar: jalankan build, tes alurnya sungguhan, baru commit + push.
- Foto/gambar dikompres sebelum dipakai (target < 300 KB).
- Jangan menambah library baru kalau bisa diselesaikan dengan yang sudah ada.
