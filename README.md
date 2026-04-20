# KSP ERP Modern

Sistem manajemen koperasi simpan pinjaman berbasis web yang aman, modern, dan mudah digunakan. Dibangun khusus untuk kebutuhan KSP di Indonesia dengan fokus pada keamanan data keuangan.

---

## Mengapa Menggunakan Deno untuk Sistem Keuangan?

Untuk sistem yang mengelola data keuangan seperti KSP, keamanan adalah prioritas utama. Berikut alasan teknis mengapa Deno dipilih:

### 🔐 Keamanan Default (Security by Default)

| Fitur                 | Manfaat untuk KSP                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Permission System** | Aplikasi hanya bisa akses file/network yang diizinkan secara eksplisit via flag `--allow-read`, `--allow-net`. Mencegah akses tidak sah ke data sensitif. |
| **No node_modules**   | Tidak ada dependency tersembunyi yang bisa menjadi celah keamanan. Semua import transparan via URL.                                                       |
| **TypeScript Native** | Type safety mengurangi bug yang bisa menyebabkan kesalahan perhitungan keuangan.                                                                          |
| **Sandboxed Runtime** | Kode berjalan dalam environment terisolasi, meminimalkan risiko exploit.                                                                                  |
| **Built-in TLS**      | Semua koneksi network terenkripsi secara default.                                                                                                         |

### 📊 Relevansi untuk KSP/Finance

```
Data Anggota + Transaksi Keuangan + Laporan Keuangan
                    ↓
           Butuh Proteksi Ekstra
                    ↓
    Deno: Permission flags + Type Safety + No eval()
                    ↓
           Risiko Kebocoran Data ↓
```

### Perbandingan Singkat

```bash
# Node.js: Akses file/network bebas (perlu library tambahan untuk security)
# Deno:   Harus izin eksplisit: deno run --allow-read --allow-net app.ts
```

Untuk sistem keuangan, **"deny by default"** lebih aman daripada "allow by default".

---

## Alur Modul (Module Flow)

### 👥 Modul Anggota

```
Input Data Anggota
       ↓
Validasi (Zod: required fields, format phone/email)
       ↓
Simpan ke Database (Supabase PostgreSQL)
       ↓
Generate No. Anggota Otomatis: KSP-2026-XXX
       ↓
Auto-create Simpanan Pokok (Rp 100.000)
       ↓
Selesai → Anggota siap transaksi
```

**Fitur:**

- ✅ Tambah/edit/hapus data anggota
- ✅ Pencarian real-time (nama, no. anggota, telepon)
- ✅ Filter berdasarkan kota dan status (aktif/nonaktif)
- ✅ Nomor anggota otomatis dengan format `KSP-TAHUN-XXX`
- ✅ Validasi NIK unik untuk mencegah duplikasi

**Contoh Request:**

```json
POST /members
{
  "fullName": "Budi Santoso",
  "phone": "081234567890",
  "address": "Jl. Raya Magetan No. 10",
  "city": "Magetan",
  "idCard": "3520011234567890"
}
```

**Contoh Response:**

```json
{
  "success": true,
  "data": {
    "memberNumber": "KSP-2026-681",
    "fullName": "Budi Santoso",
    "status": "active"
  }
}
```

---

### 💾 Modul Simpanan

```
Pilih Anggota
       ↓
Pilih Jenis Simpanan (Pokok / Wajib / Sukarela)
       ↓
Input Jumlah Setoran
       ↓
Validasi (jumlah > 0, memberId valid)
       ↓
Simpan Transaksi + Update Total per Jenis
       ↓
Selesai → Saldo anggota terupdate
```

**Jenis Simpanan:**

| Jenis        | Deskripsi                      | Frekuensi                 | Contoh           |
| ------------ | ------------------------------ | ------------------------- | ---------------- |
| **Pokok**    | Setoran awal saat jadi anggota | Sekali saat registrasi    | Rp 100.000       |
| **Wajib**    | Setoran bulanan rutin anggota  | Setiap bulan              | Rp 50.000/bulan  |
| **Sukarela** | Setoran tambahan bebas         | Kapan saja, nominal bebas | Sesuai kemampuan |

**Fitur:**

- ✅ Rekap total simpanan per anggota (dipisah per jenis)
- ✅ Histori transaksi dengan tanggal dan deskripsi
- ✅ Export data untuk laporan bulanan/tahunan
- ✅ Validasi: tidak bisa setoran negatif, memberId harus valid

**Contoh Request:**

```json
POST /savings
{
  "memberId": "e821a277-339f-4a4c-839d-5750432e1ff9",
  "type": "wajib",
  "amount": "50000",
  "description": "Simpanan Wajib April 2026"
}
```

---

### 💰 Modul Pinjaman

```
1. Ajukan Pinjaman
   ↓
2. Validasi Input (memberId, principal, tenor)
   ↓
3. Hitung Bunga & Total (Flat Rate)
   ↓
4. Generate Jadwal Angsuran (12 bulan default)
   ↓
5. Status: "pending" → Menunggu approval
   ↓
6. Admin Approve → Status: "approved" + Aktifkan angsuran
   ↓
7. Anggota Bayar Angsuran → Update remaining balance
   ↓
8. Semua angsuran lunas → Status: "paid"
```

**Perhitungan Bunga (Flat Rate):**

```
Rumus:
Total = Pokok + (Pokok × Bunga% × Tenor/12)
Angsuran/Bulan = Total ÷ Tenor

Contoh:
Pokok: Rp 5.000.000
Bunga: 12% per tahun
Tenor: 12 bulan

Total Bunga = 5.000.000 × 12% × 12/12 = 600.000
Total Pinjaman = 5.000.000 + 600.000 = 5.600.000
Angsuran/Bulan = 5.600.000 ÷ 12 = 466.667
```

**Status Pinjaman:**

| Status     | Deskripsi                | Aksi yang Tersedia           |
| ---------- | ------------------------ | ---------------------------- |
| `pending`  | Menunggu approval admin  | Approve, Reject              |
| `approved` | Aktif, angsuran berjalan | Bayar angsuran, Lihat jadwal |
| `paid`     | Semua angsuran lunas     | Lihat histori, Ajukan baru   |

**Fitur:**

- ✅ Approval workflow dengan modal konfirmasi
- ✅ Jadwal angsuran otomatis digenerate saat approve
- ✅ Pembayaran per angsuran dengan update sisa pinjaman real-time
- ✅ Notifikasi WhatsApp untuk reminder jatuh tempo
- ✅ Validasi: tenor 1-60 bulan, bunga 0-100%, principal > 0

**Contoh Request:**

```json
POST /loans
{
  "memberId": "e821a277-339f-4a4c-839d-5750432e1ff9",
  "principal": "5000000",
  "interestRate": "12.00",
  "tenorMonths": 12
}
```

---

### 🔔 Modul Notifikasi WhatsApp

```
Trigger Event:
├─ Pinjaman Disetujui → Kirim template "approval"
├─ H-7 Jatuh Tempo → Kirim template "reminder_h7"
├─ H-3 Jatuh Tempo → Kirim template "reminder_h3"
├─ Hari-H Jatuh Tempo → Kirim template "reminder_h0"
└─ Overdue (telat bayar) → Kirim template "overdue"
       ↓
Pilih Template Pesan Sesuai Trigger
       ↓
Format No. HP: 08xx → 628xx (standar WhatsApp API)
       ↓
Kirim via Fonnte API
       ↓
Jika API gagal → Fallback ke wa.me (buka WhatsApp Web)
       ↓
Log pengiriman untuk tracking
```

**Template Pesan:**

| Trigger      | Contoh Pesan                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Approval** | `🎉 Pinjaman Disetujui! Halo Budi, pinjaman PJM-2026-820 senilai Rp 5.600.000 telah disetujui. Angsuran: Rp 466.667/bulan. Cek jadwal di aplikasi.` |
| **H-7**      | `🔔 Pengingat: Angsuran Anda jatuh tempo dalam 7 hari (20 Mei 2026). Jumlah: Rp 466.667. Silakan siapkan pembayaran.`                               |
| **H-3**      | `⏰ Segera Bayar: Angsuran jatuh tempo dalam 3 hari. Hindari denda keterlambatan. Hubungi admin jika ada kendala.`                                  |
| **Overdue**  | `⚠️ PERINGATAN: Angsuran Anda terlambat 3 hari. Segera bayar Rp 466.667 untuk hindari denda. Hubungi: (0351) 123456.`                               |

**Fitur:**

- ✅ 4 template pesan berbeda sesuai urgensi
- ✅ Format phone otomatis (08xx → 628xx)
- ✅ Fallback ke `wa.me` jika API limit/error
- ✅ Button contextual di UI: 🔴 WA Overdue / 🟠 WA Urgent / 🟢 WA Regular
- ✅ Log pengiriman untuk audit trail

---

### 📊 Modul Laporan

```
Pilih Jenis Laporan
       ↓
Apply Filter (opsional: tanggal, status, anggota)
       ↓
Query Database dengan Aggregation
       ↓
Format Response untuk Frontend
       ↓
Tampilkan di UI / Export ke CSV
```

**Jenis Laporan:**

1. **Dashboard Stats** (`GET /reports/dashboard`)
   - Total anggota aktif
   - Total simpanan seluruh anggota
   - Total pinjaman yang telah disalurkan
   - Sisa pinjaman yang belum lunas
   - Jumlah pinjaman lunas

2. **Rekap Simpanan** (`GET /reports/savings-summary`)
   - List semua anggota dengan total simpanan per jenis
   - Grand total simpanan seluruh koperasi
   - Filter by kota untuk laporan cabang

3. **Pinjaman Aktif** (`GET /reports/loans-active`)
   - List pinjaman dengan status approved/pending
   - Progress angsuran per pinjaman
   - Total pokok dan sisa tagihan

**Fitur:**

- ✅ Filter dinamis (tanggal, status, kota, anggota)
- ✅ Export ke CSV (compatible dengan Excel, UTF-8 BOM)
- ✅ Tampilan responsive untuk mobile/desktop
- ✅ Real-time data (auto-refresh 30 detik di dashboard)

**Contoh Response Dashboard:**

```json
{
  "success": true,
  "data": {
    "totalAnggotaAktif": 1,
    "totalSimpanan": 450000,
    "totalPinjamanDistribusi": 5600000,
    "totalSisaPinjaman": 5133333.33,
    "totalPinjamanLunas": 0
  }
}
```

---

## Tech Stack

| Komponen       | Teknologi             | Alasan Pemilihan                                                             |
| -------------- | --------------------- | ---------------------------------------------------------------------------- |
| **Runtime**    | Deno 2.x              | Security-first, TypeScript native, no node_modules, permission-based access  |
| **Backend**    | Hono.js               | Lightweight (<14KB), fast routing, built-in Zod validation, Deno-native      |
| **Frontend**   | Fresh + Preact        | Server-side rendering, islands architecture, zero build step, SEO-friendly   |
| **Styling**    | Tailwind CSS v3       | Utility-first, dark mode support, responsive design, small bundle size       |
| **Database**   | Supabase (PostgreSQL) | Managed service, free tier, real-time capabilities, auto-backup              |
| **ORM**        | Drizzle ORM           | Type-safe queries, lightweight, intuitive syntax, no runtime overhead        |
| **Validation** | Zod                   | Runtime type checking, clear error messages, schema sharing backend-frontend |

---

## Quick Start

### Prerequisites

- Deno 2.x: `curl -fsSL https://deno.land/install.sh | sh`
- Supabase account (free tier): https://supabase.com
- Git

### 1. Clone Repository

```bash
git clone https://github.com/jefryKurniawan/ksp-erp.git
cd ksp-erp
```

### 2. Setup Backend

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env: isi DATABASE_URL dari Supabase dashboard
# DATABASE_URL=postgresql://postgres.xxxxx:password@host:6543/postgres?pgbouncer=true

# Jalankan server dengan permission flags
deno run --allow-net --allow-env --allow-read --env-file=.env src/main.ts
```

✅ Backend berjalan di `http://localhost:3000`

### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies (first time only)
deno install

# Jalankan development server dengan hot reload
deno task start
```

✅ Frontend berjalan di `http://localhost:8000`

### 4. Akses Aplikasi

Buka browser: `http://localhost:8000`

**Demo Credentials:**
| Role | Email | Password | Akses |
|------|-------|----------|-------|
| Karyawan | `karyawan@ksp.id` | `karyawan123` | CRUD anggota, input transaksi, lihat laporan |
| Owner | `owner@ksp.id` | `owner123` | Semua akses + approval pinjaman + setting sistem |

---

## Environment Variables

File: `backend/.env`

```env
# Koneksi ke Supabase PostgreSQL
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# WhatsApp API (opsional, untuk notifikasi)
FONNTE_TOKEN=your_fonnte_token_here
```

> ⚠️ **Penting**: File `.env` tidak boleh di-commit ke repository. Sudah dikecualikan di `.gitignore`.

---

## API Reference

### 👥 Members

| Method | Endpoint   | Deskripsi                   | Request Body                                  | Response                                                    |
| ------ | ---------- | --------------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| GET    | `/members` | List semua anggota + relasi | -                                             | `{ success: true, data: [...] }`                            |
| POST   | `/members` | Tambah anggota baru         | `{ fullName, phone, address, city, idCard? }` | `{ success: true, data: { memberNumber: "KSP-2026-XXX" } }` |

### 💾 Savings

| Method | Endpoint             | Deskripsi              | Request Body                               | Response                                                                    |
| ------ | -------------------- | ---------------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| GET    | `/savings/:memberId` | Rekap simpanan anggota | -                                          | `{ success: true, data: [...], totals: { pokok, wajib, sukarela, total } }` |
| POST   | `/savings`           | Catat setoran simpanan | `{ memberId, type, amount, description? }` | `{ success: true, data: {...} }`                                            |

### 💰 Loans

| Method | Endpoint                | Deskripsi                          | Request Body                                         | Response                                                  |
| ------ | ----------------------- | ---------------------------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| GET    | `/loans`                | List pinjaman + anggota + angsuran | -                                                    | `{ success: true, data: [...] }`                          |
| POST   | `/loans`                | Ajukan pinjaman baru               | `{ memberId, principal, interestRate, tenorMonths }` | `{ success: true, data: { loanNumber: "PJM-2026-XXX" } }` |
| PATCH  | `/loans/:id/approve`    | Approve pinjaman                   | -                                                    | `{ success: true, data: {...} }`                          |
| PATCH  | `/installments/:id/pay` | Tandai angsuran lunas              | `{ paidDate: "2026-04-20" }`                         | `{ success: true }`                                       |

### 📊 Reports

| Method | Endpoint                   | Deskripsi                  | Response                                                                                               |
| ------ | -------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| GET    | `/reports/dashboard`       | Stats overview             | `{ totalAnggotaAktif, totalSimpanan, totalPinjamanDistribusi, totalSisaPinjaman, totalPinjamanLunas }` |
| GET    | `/reports/savings-summary` | Rekap simpanan per anggota | `{ data: [...], summary: { grandTotal, totalAnggota } }`                                               |
| GET    | `/reports/loans-active`    | Pinjaman aktif + progress  | `{ data: [...], summary: { totalPokokPinjaman, totalSisaPinjaman } }`                                  |

### 🔔 WhatsApp (Opsional)

| Method | Endpoint             | Deskripsi           | Request Body                          |
| ------ | -------------------- | ------------------- | ------------------------------------- |
| POST   | `/api/send-whatsapp` | Kirim notifikasi WA | `{ phone: "628xxx", message: "..." }` |

---

## Deployment

### Backend (Deno)

**Option 1: Deno Deploy (Recommended)**

```bash
deno deploy backend/src/main.ts --project ksp-erp-api
```

- ✅ Gratis, global CDN, auto-HTTPS
- ✅ Environment variables via Deno Deploy dashboard
- ✅ Auto-scaling, no server management

**Option 2: VPS / Self-hosted**

```bash
# Install Deno di server Ubuntu
curl -fsSL https://deno.land/install.sh | sh

# Jalankan dengan PM2 untuk auto-restart & monitoring
pm2 start "deno run --allow-net --allow-env --allow-read --env-file=.env backend/src/main.ts" --name "ksp-api"
```

### Frontend (Fresh)

**Option 1: Deno Deploy**

```bash
deno deploy frontend/ --project ksp-erp-ui
```

**Option 2: Netlify / Vercel**

- Upload folder `frontend/`
- Build command: `deno task build` (jika perlu)
- Output directory: `_site` (auto-generated by Fresh)

### Database

Supabase sudah managed:

- ✅ Backup otomatis harian
- ✅ Scaling otomatis sesuai traffic
- ✅ Dashboard untuk monitoring query & usage

Cukup copy `DATABASE_URL` ke environment variable di platform deployment.

---

## Testing & Quality Assurance

### Validasi Input

- ✅ Semua endpoint backend menggunakan Zod untuk validasi request
- ✅ Error message jelas dan user-friendly (bukan stack trace)
- ✅ Type safety dari TypeScript mencegah bug tipe data

### Error Handling

- ✅ Global error handler di backend dengan logging terstruktur
- ✅ Frontend menampilkan alert/notifikasi yang informatif
- ✅ Fallback mechanism untuk WhatsApp (wa.me jika API gagal)

### Dark Mode & Responsiveness

- ✅ Theme preference disimpan di localStorage
- ✅ Transisi smooth tanpa flash of unstyled content
- ✅ Layout responsive: mobile (<640px), tablet (640-1024px), desktop (>1024px)

### Data Persistence

- ✅ Sidebar state tersimpan agar konsisten antar halaman
- ✅ Session login via localStorage (untuk MVP)
- ✅ Refresh token mechanism bisa ditambahkan untuk production

### Test Flow Manual

```
1. Login sebagai karyawan/owner
2. Tambah anggota baru → verifikasi muncul di list + auto simpanan pokok
3. Ajukan pinjaman untuk anggota → approve → verifikasi jadwal angsuran terbentuk
4. Bayar 1 angsuran → verifikasi sisa pinjaman berkurang
5. Buka reports → verifikasi data sesuai dengan transaksi
6. Kirim notifikasi WhatsApp → verifikasi terkirim / fallback ke wa.me
```

---

## Contributing

Silakan kirim pull request untuk perbaikan atau fitur baru. Guidelines:

1. **Code Quality**
   - Gunakan TypeScript strict mode (`"strict": true` di deno.json)
   - Ikuti konvensi penamaan: camelCase untuk variable/function, PascalCase untuk component/class
   - Tambahkan komentar untuk logic kompleks, terutama perhitungan keuangan

2. **UI/UX**
   - Gunakan utility Tailwind yang sudah ada (jangan custom CSS kecuali perlu)
   - Pastikan dark mode konsisten di semua component
   - Test responsive di mobile (320px) dan desktop (1440px)

3. **Commit Message** (Conventional Commits)

   ```
   feat: tambah fitur export PDF laporan
   fix: perbaiki perhitungan bunga untuk tenor < 12 bulan
   docs: update dokumentasi API endpoint loans
   chore: update dependency drizzle-orm ke versi 0.31
   ```

4. **Diskusi**
   - Untuk perubahan besar, buat issue dulu untuk diskusi use case & impact
   - Sertakan screenshot/mockup untuk perubahan UI
   - Jelaskan testing yang sudah dilakukan

---

## License

MIT License. Silakan digunakan untuk:

- ✅ Proyek belajar/pribadi
- ✅ Implementasi di KSP nyata (komersial/non-profit)
- ✅ Modifikasi dan distribusi

Syarat:

- 📝 Tetap cantumkan credit ke original author di file yang dimodifikasi
- ⭐ Star repository jika project ini membantu pekerjaan Anda

---

> Dibuat oleh **Jefry Kurniawan** • 2026  
> Untuk Koperasi Simpan Pinjaman di Indonesia
>
> _"Sistem yang aman untuk mengelola keuangan bersama."_ 💼🔐
