# PRD — Sistem Informasi Inventaris Bahan Habis Pakai (BAP) Lab Kerja Bangku

**Politeknik Negeri Bengkalis**

| Field | Isi |
|---|---|
| Nama Produk | SI-BAP (Sistem Inventaris Bahan Habis Pakai) |
| Versi Dokumen | 1.0 |
| Tanggal | 15 Juli 2026 |
| Pemilik Produk | Abiyyu RZ |
| Unit | Lab Kerja Bangku, Politeknik Negeri Bengkalis |
| Status | Draft untuk implementasi (siap import ke Claude Code) |

---

## 1. Ringkasan Eksekutif

SI-BAP adalah aplikasi web untuk mencatat, mengelola, dan memantau inventaris bahan habis pakai (BAP) serta peralatan di Lab Kerja Bangku Politeknik Negeri Bengkalis. Saat ini pencatatan bahan dan peralatan masih manual sehingga sulit mengetahui sisa stok, riwayat pemakaian per praktek, dan kapan bahan harus dibeli ulang. Aplikasi ini menyediakan pencatatan terpusat, pelacakan stok masuk dan keluar, peringatan stok menipis, riwayat pemakaian per semester, serta dashboard ringkasan. Aplikasi memiliki dua peran pengguna, yaitu admin dan user, dengan halaman login sebagai gerbang akses.

## 2. Latar Belakang dan Masalah

Lab Kerja Bangku menggunakan bahan habis pakai seperti mata bor, amplas, elektroda, dan sejenisnya yang jumlahnya berkurang setiap kali dipakai praktek. Tanpa sistem pencatatan digital, muncul beberapa masalah. Pengelola tidak tahu sisa stok secara akurat sehingga bahan sering habis mendadak saat praktek berlangsung. Tidak ada riwayat yang menghubungkan pemakaian bahan dengan semester, peralatan, dan jam praktek tertentu. Laporan pemakaian untuk keperluan pengajuan pengadaan sulit dibuat karena data tersebar. SI-BAP dirancang untuk menyelesaikan masalah tersebut dengan basis data tunggal yang bisa diakses admin dan user sesuai hak aksesnya.

## 3. Tujuan dan Metrik Keberhasilan

Tujuan utama produk ini adalah menyediakan pencatatan inventaris BAP yang akurat dan dapat diaudit, mempercepat proses pengajuan pemakaian bahan oleh user, serta memberikan peringatan dini saat stok menipis. Keberhasilan diukur dari beberapa indikator berikut. Seluruh bahan dan peralatan lab tercatat dalam sistem dengan sisa stok yang terbarui secara otomatis setiap ada transaksi. Waktu pembuatan laporan pemakaian per semester turun dari hitungan jam menjadi hitungan menit melalui fitur export. Tidak ada lagi kejadian bahan habis tanpa terdeteksi karena adanya peringatan stok minimum. Setiap pemakaian bahan tercatat lengkap dengan pemakai, tanggal, semester, peralatan terkait, dan jam praktek.

## 4. Ruang Lingkup

### 4.1 Termasuk dalam Ruang Lingkup

Aplikasi mencakup autentikasi login untuk dua peran, manajemen data master bahan habis pakai dan peralatan, pelacakan stok masuk dan keluar dengan perhitungan sisa otomatis, pengajuan pemakaian bahan oleh user dengan alur persetujuan admin, peringatan stok menipis, riwayat pemakaian per praktek dan per semester, dashboard ringkasan, serta export laporan ke format PDF dan Excel.

### 4.2 Di Luar Ruang Lingkup (untuk versi 1.0)

Aplikasi versi pertama tidak mencakup integrasi dengan sistem akademik kampus, pembelian atau pengadaan otomatis ke vendor, aplikasi mobile native, pemindaian barcode atau QR fisik, serta notifikasi melalui email atau WhatsApp. Fitur tersebut dicatat sebagai kandidat pengembangan lanjutan pada bagian roadmap.

## 5. Peran Pengguna dan Hak Akses

Sistem memiliki dua peran. Admin adalah pengelola lab atau teknisi yang bertanggung jawab penuh atas data. Admin dapat menambah, mengubah, dan menghapus data bahan serta peralatan, mencatat stok masuk, menyetujui atau menolak pengajuan pemakaian dari user, mengatur batas minimum stok, mengelola akun user, melihat seluruh riwayat, mengakses dashboard, dan melakukan export laporan.

User adalah mahasiswa, dosen, atau asisten praktek yang menggunakan bahan. User dapat melihat dan mencari seluruh data inventaris, mengajukan permintaan pemakaian bahan yang kemudian menunggu persetujuan admin, melihat status dan riwayat pengajuannya sendiri, serta melakukan export laporan. User tidak dapat mengubah data master maupun menyetujui pengajuan.

Matriks hak akses berikut merangkum kewenangan tiap peran.

| Fitur | User | Admin |
|---|---|---|
| Login dan logout | Ya | Ya |
| Lihat dan cari data inventaris | Ya | Ya |
| Tambah / ubah / hapus data bahan dan peralatan | Tidak | Ya |
| Catat stok masuk | Tidak | Ya |
| Ajukan pemakaian bahan (stok keluar) | Ya (perlu persetujuan) | Ya (langsung) |
| Setujui / tolak pengajuan pemakaian | Tidak | Ya |
| Atur batas minimum stok | Tidak | Ya |
| Lihat peringatan stok menipis | Ya (lihat saja) | Ya |
| Lihat riwayat pemakaian | Riwayat sendiri | Seluruhnya |
| Dashboard ringkasan | Ya (versi ringkas) | Ya (penuh) |
| Kelola akun pengguna | Tidak | Ya |
| Export laporan PDF / Excel | Ya | Ya |

## 6. Kebutuhan Fungsional

### 6.1 Autentikasi dan Manajemen Akun

Aplikasi menyediakan halaman login dengan email dan kata sandi. Setelah login berhasil, sistem mengarahkan pengguna ke halaman sesuai perannya. Admin dapat membuat akun user baru, mengubah peran, mereset kata sandi, dan menonaktifkan akun. Sesi login harus aman dan otomatis berakhir setelah periode tidak aktif tertentu. Rute halaman admin harus terlindungi sehingga user biasa tidak dapat mengaksesnya walau mengetahui URL-nya.

### 6.2 Manajemen Data Master

Admin mengelola dua entitas master, yaitu bahan habis pakai dan peralatan. Setiap data bahan memuat nomor urut, nama bahan habis pakai, peralatan terkait, semester, jam praktek, kualitas, satuan, stok saat ini, dan batas minimum stok. Data dapat ditambah melalui formulir, diubah, dan dihapus. Sistem melakukan validasi agar kolom wajib tidak kosong dan nilai numerik tidak negatif.

### 6.3 Pelacakan Stok Masuk dan Keluar

Setiap transaksi mengubah sisa stok secara otomatis. Stok masuk dicatat admin saat ada penambahan bahan, misalnya pembelian baru, dengan mencatat jumlah dan tanggal. Stok keluar terjadi saat pemakaian bahan disetujui, dan sisa stok berkurang sesuai jumlah pemakaian. Sistem menyimpan setiap transaksi sebagai catatan riwayat yang tidak dapat diubah, hanya dapat dikoreksi lewat transaksi penyesuaian, sehingga jejak audit tetap utuh.

### 6.4 Pengajuan Pemakaian oleh User

User mengisi formulir pengajuan pemakaian yang memuat bahan yang dipakai, jumlah, peralatan, semester, jam praktek, dan tanggal praktek. Pengajuan berstatus menunggu, disetujui, atau ditolak. Admin melihat daftar pengajuan yang menunggu, lalu menyetujui atau menolak dengan catatan opsional. Saat disetujui, stok bahan otomatis berkurang dan transaksi tercatat di riwayat. Jika stok tidak mencukupi, sistem mencegah persetujuan dan memberi peringatan.

### 6.5 Peringatan Stok Menipis

Admin menetapkan batas minimum untuk tiap bahan. Ketika sisa stok mencapai atau turun di bawah batas tersebut, bahan ditandai sebagai stok kritis. Sistem menampilkan peringatan visual pada dashboard dan pada daftar inventaris, serta menyediakan daftar khusus bahan yang perlu segera dibeli ulang.

### 6.6 Riwayat Pemakaian per Praktek

Sistem menyimpan log lengkap setiap pemakaian yang memuat siapa memakai, bahan apa, jumlah, peralatan, semester, jam praktek, dan tanggal. Riwayat dapat difilter berdasarkan rentang tanggal, semester, bahan, atau pengguna. Riwayat ini menjadi dasar laporan pemakaian dan analisis kebutuhan bahan per semester.

### 6.7 Dashboard Ringkasan

Dashboard menampilkan indikator utama secara sekilas, meliputi total jenis bahan, jumlah bahan berstatus stok kritis, total pemakaian pada periode berjalan, dan jumlah pengajuan yang menunggu persetujuan. Dashboard juga menyajikan grafik pemakaian bahan per semester dan daftar bahan yang paling sering dipakai. Versi user menampilkan ringkasan yang relevan tanpa data pengelolaan sensitif.

### 6.8 Pencarian, Filter, dan Export

Seluruh daftar mendukung pencarian teks dan filter berdasarkan kolom penting seperti semester, kualitas, dan status stok. Data inventaris maupun laporan pemakaian dapat diekspor ke PDF untuk pengarsipan dan ke Excel untuk pengolahan lanjutan.

## 7. Model Data

Struktur data mengikuti field yang diminta dan diperluas seperlunya agar pelacakan stok berjalan. Berikut skema tabel utama.

### 7.1 Tabel `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| nama | text | Nama lengkap |
| email | text | Unik, untuk login |
| role | enum | `admin` atau `user` |
| is_active | boolean | Status aktif akun |
| created_at | timestamp | Waktu dibuat |

### 7.2 Tabel `peralatan`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| nama_peralatan | text | Nama peralatan |
| keterangan | text | Deskripsi opsional |
| created_at | timestamp | Waktu dibuat |

### 7.3 Tabel `bahan` (bahan habis pakai)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| no | serial | Nomor urut tampil |
| nama_bahan | text | Nama bahan habis pakai |
| peralatan_id | uuid | Relasi ke tabel `peralatan` |
| semester | integer | Semester penggunaan |
| jam_praktek | numeric | Jam praktek terkait |
| kualitas | enum | Contoh: `baik`, `cukup`, `kurang` |
| satuan | text | Contoh: buah, lembar, meter, kg |
| stok | numeric | Sisa stok saat ini |
| stok_minimum | numeric | Batas peringatan stok menipis |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu diperbarui |

### 7.4 Tabel `transaksi_stok`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| bahan_id | uuid | Relasi ke tabel `bahan` |
| tipe | enum | `masuk`, `keluar`, `penyesuaian` |
| jumlah | numeric | Jumlah pergerakan stok |
| tanggal | date | Tanggal transaksi |
| dicatat_oleh | uuid | Relasi ke `users` |
| catatan | text | Keterangan opsional |
| created_at | timestamp | Waktu dibuat |

### 7.5 Tabel `pengajuan_pemakaian`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| bahan_id | uuid | Relasi ke tabel `bahan` |
| peralatan_id | uuid | Relasi ke tabel `peralatan` |
| user_id | uuid | Pengaju (relasi ke `users`) |
| jumlah | numeric | Jumlah bahan diminta |
| semester | integer | Semester praktek |
| jam_praktek | numeric | Jam praktek |
| tanggal_praktek | date | Tanggal praktek |
| status | enum | `menunggu`, `disetujui`, `ditolak` |
| catatan_admin | text | Alasan atau catatan admin |
| diproses_oleh | uuid | Admin yang memproses |
| created_at | timestamp | Waktu pengajuan |

Relasi antar tabel adalah sebagai berikut. Satu peralatan berelasi ke banyak bahan. Satu bahan berelasi ke banyak transaksi stok dan banyak pengajuan pemakaian. Satu user berelasi ke banyak pengajuan dan banyak transaksi. Sisa stok pada tabel `bahan` diperbarui otomatis dari akumulasi transaksi stok.

## 8. Alur Pengguna Utama

Alur login dimulai dari pengguna membuka aplikasi, memasukkan email dan kata sandi, lalu sistem memverifikasi dan mengarahkan ke dashboard sesuai peran. Alur admin menambah bahan dimulai dari menu data master, mengisi formulir bahan, menyimpan, dan bahan muncul di daftar dengan stok awal. Alur user mengajukan pemakaian dimulai dari mencari bahan, membuka formulir pengajuan, mengisi jumlah dan detail praktek, dan mengirim pengajuan berstatus menunggu. Alur admin memproses pengajuan dimulai dari daftar pengajuan menunggu, memeriksa ketersediaan stok, menyetujui atau menolak, dan bila disetujui stok berkurang serta riwayat tercatat. Alur export dimulai dari halaman daftar atau laporan, memilih filter, menekan tombol export, dan sistem menghasilkan berkas PDF atau Excel.

## 9. Kebutuhan Non-Fungsional

Aplikasi harus responsif dan dapat diakses melalui browser desktop maupun ponsel karena praktek berlangsung di lab. Waktu muat halaman utama sebaiknya di bawah tiga detik pada koneksi kampus. Data harus aman dengan kata sandi terenkripsi dan pembatasan akses berbasis peran di sisi server, bukan hanya di antarmuka. Antarmuka menggunakan bahasa Indonesia yang jelas dan konsisten. Sistem harus menjaga integritas stok sehingga tidak mungkin muncul stok negatif akibat transaksi bersamaan. Basis data perlu dicadangkan secara berkala.

## 10. Rekomendasi Arsitektur dan Teknologi

Karena Anda memilih hosting cloud gratis dan meminta rekomendasi stack, dokumen ini merekomendasikan kombinasi berikut yang cepat dikembangkan, gratis untuk skala lab, dan cocok dikerjakan bersama Claude Code.

Frontend dan backend dibangun dengan Next.js versi 14 menggunakan App Router dan TypeScript, sehingga satu proyek menangani halaman dan API sekaligus. Antarmuka memakai Tailwind CSS dengan komponen shadcn/ui agar tampilan rapi dan konsisten tanpa banyak kode gaya. Basis data, autentikasi, dan aturan keamanan menggunakan Supabase yang menyediakan Postgres, Auth, dan Row Level Security dalam satu layanan gratis. Export PDF memakai pustaka seperti jsPDF atau react-pdf, sedangkan export Excel memakai SheetJS. Grafik dashboard memakai Recharts. Deployment dilakukan ke Vercel untuk aplikasi Next.js, dengan Supabase sebagai basis data terkelola, keduanya memiliki paket gratis yang memadai untuk kebutuhan lab.

Alasan pemilihan ini adalah kemudahan deploy sekali klik ke Vercel, keamanan berbasis peran yang sudah tersedia lewat Supabase Row Level Security, ekosistem yang matang sehingga Claude Code mudah menghasilkan kode yang benar, serta biaya nol untuk skala pemakaian lab. Jika di kemudian hari kampus mewajibkan hosting sendiri berbasis PHP, arsitektur dapat dialihkan ke Laravel dan MySQL tanpa mengubah model data pada bagian 7.

## 11. Struktur Halaman

Aplikasi terdiri atas halaman-halaman berikut. Halaman login sebagai gerbang masuk. Dashboard sebagai halaman utama setelah login. Halaman daftar bahan habis pakai dengan pencarian, filter, dan tombol export. Halaman detail dan formulir bahan untuk admin. Halaman daftar peralatan beserta formulirnya untuk admin. Halaman pengajuan pemakaian untuk user membuat dan memantau pengajuan. Halaman persetujuan pengajuan untuk admin. Halaman riwayat pemakaian dengan filter dan export. Halaman peringatan stok kritis. Halaman manajemen pengguna untuk admin. Halaman profil untuk mengubah data akun dan kata sandi.

## 12. Aturan Bisnis Penting

Sistem menegakkan sejumlah aturan agar data tetap konsisten. Stok tidak boleh bernilai negatif, sehingga pengajuan yang melebihi stok tersedia tidak dapat disetujui. Hanya admin yang dapat mengubah data master dan menyetujui pengajuan. Setiap perubahan stok harus melalui transaksi yang tercatat, tidak boleh mengubah angka stok secara langsung. Pengajuan yang sudah disetujui atau ditolak tidak dapat diubah lagi, hanya dapat dibatalkan lewat transaksi penyesuaian oleh admin. Nomor urut bahan bersifat unik dan berkelanjutan.

## 13. Kriteria Penerimaan

Produk dianggap selesai untuk versi 1.0 apabila pengguna dapat login dan diarahkan sesuai peran, admin dapat mengelola data bahan dan peralatan sepenuhnya, stok berkurang otomatis saat pengajuan disetujui dan bertambah saat stok masuk dicatat, bahan dengan stok di bawah minimum tampil sebagai peringatan, user dapat mengajukan pemakaian dan memantau statusnya, riwayat pemakaian tersimpan dan dapat difilter, dashboard menampilkan indikator dan grafik yang benar, serta laporan dapat diekspor ke PDF dan Excel. Seluruh rute admin harus tidak dapat diakses oleh user biasa.

## 14. Roadmap Pengembangan Lanjutan

Setelah versi 1.0 stabil, pengembangan berikutnya dapat mencakup pemindaian QR atau barcode untuk mempercepat input, notifikasi email atau WhatsApp saat stok kritis, integrasi dengan jadwal praktek akademik, modul pengadaan yang menghubungkan stok kritis dengan proses pembelian, serta aplikasi mobile untuk pencatatan langsung di lantai lab.

## 15. Instruksi untuk Claude Code

Bangun aplikasi sesuai dokumen ini menggunakan Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, dan Supabase. Mulai dengan menyiapkan skema basis data Supabase sesuai bagian 7, lengkap dengan kebijakan Row Level Security yang membedakan admin dan user sesuai matriks pada bagian 5. Lanjutkan dengan autentikasi, lalu bangun fitur secara berurutan mengikuti bagian 6, yaitu data master, pelacakan stok, pengajuan pemakaian, peringatan stok, riwayat, dashboard, dan export. Gunakan bahasa Indonesia untuk seluruh antarmuka. Pastikan setiap perubahan stok melewati transaksi tercatat dan stok tidak pernah negatif. Sertakan data contoh untuk pengujian, minimal beberapa peralatan, sepuluh bahan, dan beberapa transaksi. Buat satu akun admin dan satu akun user untuk uji coba awal.
