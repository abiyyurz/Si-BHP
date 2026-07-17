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

- **Marker teks halaman**: Dashboard = "Selamat datang kembali"; Stok =
  "Master Data Bahan Habis Pakai"; Lab = "Master Data Laboratorium".
  Jangan pakai "Dashboard" (itu teks sidebar, hilang di mobile).
- **Tes expiry sesi (Ingat saya)**: JANGAN ubah `lastSeen` saat app terbuka —
  heartbeat (interval 30 dtk + beforeunload) menimpanya. Rakit sesi buatan
  dari halaman login (heartbeat belum aktif): set
  `sibap_auth_session = {id, remember:false, lastSeen: Date.now()-6*60*1000}`
  lalu reload → harus tetap di login & storage terhapus.
- **Dialog confirm()** (hapus akun/permohonan): override `window.confirm = () => true`.
- **Data uji**: buat user `ujicoba-verif`, lalu nonaktifkan → hapus permanen
  (bersih sendiri). Jangan buat permohonan uji — audit log immutable, DB = produksi.
- Tombol hamburger mobile: `button[aria-label="Buka menu utama"]`, viewport 390px.
