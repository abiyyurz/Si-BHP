# Verify SI-BHP

Cara verifikasi runtime aplikasi ini (dipakai sesi Claude berikutnya).

## Jalankan

- Dev server: `npm run dev` (background) → **http://localhost:3000** (bukan 5173).
- Produksi: https://si-bhp.netlify.app (DB Supabase sama dengan dev!).
- Login admin: `admin` / `admin123`.

## Drive (browser automation)

- `playwright`/`puppeteer` TIDAK terpasang; registry npm sering ETIMEDOUT (IPv6).
- Solusi yang terbukti jalan: **raw CDP tanpa dependency** — Chrome di
  `C:\Program Files\Google\Chrome\Application\chrome.exe` dengan
  `--remote-debugging-port --headless=new --user-data-dir=<temp>`, lalu
  WebSocket bawaan Node 22 ke `/json/list`. Driver contoh pernah dibuat di
  scratchpad (`cdp.js` + `verify.js`) — pola: `Runtime.evaluate` untuk
  klik/isi form (React input butuh native value setter + dispatch `input`),
  `Page.captureScreenshot` untuk bukti.

## Gotcha penting

- **Marker teks halaman** (diperbarui 2026-07-18): Dashboard = "Halo,"; Stok =
  "Data Bahan Habis Pakai (BHP)"; Lab = "Data Lab/Bengkel"; Permohonan =
  "Permohonan & Pemakaian"; Laporan Pengadaan = "Laporan Pengadaan BHP".
  Jangan pakai marker terlalu generik spt "Stok"/"Dashboard" (muncul di banyak
  halaman/sidebar). Login submit button = "Masuk Aplikasi Si-BHP".
- **Port dev**: `npm run dev` → 3000, tapi kalau 3000 dipakai Vite pindah 3001 dst
  (cek log). CDP/HTTP ke Chrome & app WAJIB pakai `127.0.0.1` bukan `localhost`
  (localhost → IPv6 ::1 → ETIMEDOUT). Driver CDP: pakai browser-WS dari
  `/json/version` lalu `Target.createTarget`+`attachToTarget` (flatten sessionId);
  memilih target dari `/json` list tidak andal. Driver kerja tersimpan di scratchpad `verify.js`.
- **Tes expiry sesi (Ingat saya)**: JANGAN ubah `lastSeen` saat app terbuka —
  heartbeat (interval 30 dtk + beforeunload) menimpanya. Rakit sesi buatan
  dari halaman login (heartbeat belum aktif): set
  `sibap_auth_session = {id, remember:false, lastSeen: Date.now()-6*60*1000}`
  lalu reload → harus tetap di login & storage terhapus.
- **Dialog confirm()** (hapus akun/permohonan): override `window.confirm = () => true`.
- **Data uji**: buat user `ujicoba-verif`, lalu nonaktifkan → hapus permanen
  (bersih sendiri). Jangan buat permohonan uji — audit log immutable, DB = produksi.
- Tombol hamburger mobile: `button[aria-label="Buka menu utama"]`, viewport 390px.
