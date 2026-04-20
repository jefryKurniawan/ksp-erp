## 📦 1. Push ke GitHub (Step-by-Step)

Jalankan ini di terminal:

```bash
# 1. Masuk ke folder project
cd ~/Documents/Koperasi/ksp/ksp-erp-modern

# 2. Init git (jika belum)
git init

# 3. Buat .gitignore biar gak upload node_modules/cache
echo "node_modules/
.denopkg/
.env
*.env
.DS_Store" > .gitignore

# 4. Stage & Commit
git add .
git commit -m "feat: init KSP ERP Modern (Deno + Hono + Fresh + Tailwind + Supabase) 🚀"

# 5. Buat repo di GitHub dulu (manual via web), lalu connect:
git remote add origin https://github.com/USERNAME_KAMU/ksp-erp-modern.git

# 6. Push ke main branch
git branch -M main
git push -u origin main
```

✅ **Repo GitHub siap!** Sekarang tinggal taruh README di bawah ke file `README.md` di root project.

---

## 📝 2. `README.md` (Copy-Paste Ready)

```markdown
# 🏦 KSP ERP Modern

> _Sistem Manajemen Koperasi Simpan Pinjaman yang kekinian, fast af, dan scalable!_ 🚀✨  
> Dibuat dengan ❤️ buat anak magetan & seluruh KSP se-Indonesia.

---

## 🤖 Tech Stack

| Layer                | Tech                  | Kenapa dipake?                                              |
| -------------------- | --------------------- | ----------------------------------------------------------- |
| 🟦 **Runtime**       | Deno 2.x              | No Node.js, secure by default, TypeScript native, fast boot |
| 🔥 **Backend**       | Hono.js               | Lightweight, blazing routing, Zod validation built-in       |
| 🍋 **Frontend**      | Fresh + Preact        | Islands architecture, SSR + CSR hybrid, zero build step     |
| 🎨 **Styling**       | Tailwind CSS v3       | Utility-first, dark mode ready, responsive af               |
| 🗄️ **Database**      | Supabase (PostgreSQL) | Managed, free tier, real-time ready                         |
| **ORM**              | Drizzle ORM           | Type-safe, lightweight, query builder yang intuitif         |
| 📱 **Notifications** | Fonnte WhatsApp API   | Gratis 100 msg/hari, auto-reminder H-7/H-3/Overdue          |
| ✅ **Validation**    | Zod                   | Runtime type safety, error message yang readable            |

> 💡 _Note: Awalnya niat pake SvelteKit, tapi karena Deno + Vite compatibility masih "beta vibes", kita switch ke Fresh (Preact) yang 100% Deno-native & production-ready. Same vibe, better performance._ 🧠

---

## ✨ Features (MVP)

- 👥 **Manajemen Anggota** → CRUD, search real-time, filter kota/status, pagination
- 💾 **Simpanan** → Pokok, Wajib, Sukarela (auto-calc total)
- 💰 **Pinjaman** → Ajukan → Approve → Jadwal Angsuran → Bayar → Lunas
- 📊 **Laporan Real-time** → Dashboard stats, export CSV, filter dinamis
- 🔔 **Notifikasi WhatsApp** → Auto-reminder H-7, H-3, H-0, & Overdue (contextual template)
- 🌓 **Dark/Light Mode** → Seamless switch, localStorage persistent, no flash
- 📱 **Responsive Layout** → Collapsible sidebar, dynamic width, mobile-first
- 🔐 **Role-Based Access** → Karyawan vs Owner (UI conditional rendering)

---

## 🗂️ Project Structure
```

ksp-erp-modern/
├── backend/ # 🟦 Deno + Hono + Drizzle
│ ├── src/
│ │ ├── main.ts # API routes & validation
│ │ └── schema.ts # Database schema & relations
│ ├── .env # Supabase URL + Fonnte Token
│ └── deno.json
├── frontend/ # 🍋 Fresh + Preact + Tailwind
│ ├── islands/ # ⚡ Interactive components (useState/useEffect)
│ ├── routes/ # 📄 Pages (SSR/static)
│ ├── components/ # 🧩 Reusable UI (Layout, Navbar, etc)
│ └── deno.json
├── .gitignore
└── README.md # 📖 You're here!

````

---

## ⚡ Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/USERNAME_KAMU/ksp-erp-modern.git
cd ksp-erp-modern
````

### 2. Backend 🟦

```bash
cd backend
cp .env.example .env  # Copy template
# Edit .env → isi DATABASE_URL & FONNTE_TOKEN
deno run --allow-net --allow-env --allow-read --env-file=.env src/main.ts
```

🔥 Backend running di `http://localhost:3000`

### 3. Frontend 🍋

```bash
cd frontend
deno install          # Install dependencies
deno task start       # Dev server with hot reload
```

🌐 Frontend running di `http://localhost:8000`

---

## 🌍 Environment Variables

Buat file `.env` di folder `backend/`:

```env
# Supabase PostgreSQL Connection
DATABASE_URL=postgresql://postgres.xxxxx:your_password@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# WhatsApp Gateway (Fonnte)
FONNTE_TOKEN=your_fonnte_api_token_here
```

> 🔒 Jangan commit `.env` ke GitHub! Udah di-handle `.gitignore`.

---

## 📡 API Endpoints

| Method  | Endpoint                   | Deskripsi                                            |
| ------- | -------------------------- | ---------------------------------------------------- |
| `GET`   | `/members`                 | List semua anggota + relasi simpanan & pinjaman      |
| `POST`  | `/members`                 | Tambah anggota baru (auto-generate `KSP-2026-XXX`)   |
| `GET`   | `/savings/:memberId`       | Rekap simpanan per anggota                           |
| `POST`  | `/savings`                 | Catat setoran simpanan                               |
| `GET`   | `/loans`                   | List pinjaman + anggota + angsuran                   |
| `POST`  | `/loans`                   | Ajukan pinjaman baru (auto-calc bunga & jadwal)      |
| `PATCH` | `/loans/:id/approve`       | Approve pinjaman → aktifkan angsuran                 |
| `PATCH` | `/installments/:id/pay`    | Tandai angsuran lunas → update sisa pinjaman         |
| `GET`   | `/reports/dashboard`       | Stats: anggota aktif, total simpanan, pinjaman, sisa |
| `GET`   | `/reports/savings-summary` | Rekap simpanan per anggota                           |
| `GET`   | `/reports/loans-active`    | Pinjaman aktif + progress angsuran                   |
| `POST`  | `/api/send-whatsapp`       | Kirim notifikasi WA (Fonnte / fallback wa.me)        |

---

## Deployment Guide

### Backend (Deno)

```bash
# Option 1: Deno Deploy (Gratis & Global CDN)
deno deploy backend/src/main.ts --project ksp-erp-api

# Option 2: VPS / Ubuntu
sudo apt install deno
nohup deno run --allow-net --allow-env --allow-read --env-file=.env backend/src/main.ts &
```

### Frontend (Fresh)

```bash
# Deno Deploy (Auto-build)
deno deploy frontend/ --project ksp-erp-ui

# Netlify / Vercel
# Upload folder frontend/ → auto-detect Fresh framework
```

### Database

Supabase udah managed, tinggal copy `DATABASE_URL` ke production env. Backup otomatis tiap hari. ✅

---

## 🧪 Testing & QA Notes

- ✅ Validasi input pakai Zod (backend + frontend sync)
- ✅ Error handling global + toast/alert user-friendly
- ✅ Dark mode konsisten di semua island & route
- ✅ Sidebar state persistent via localStorage
- ✅ WhatsApp fallback ke `wa.me` kalau API limit/error
- 📝 Test flow: Login → Dashboard → Anggota → Pinjaman → Approve → Bayar → Laporan

---

## 🤝 Contributing

Mau kolab? Pull request welcome! Ikut vibe:

- 🧹 Clean code + TypeScript strict
- 🎨 UI konsisten Tailwind utility
- 📝 Commit message conventional (`feat:`, `fix:`, `chore:`)
- 💬 Diskusi dulu di Issues kalau mau tambah fitur besar

---

## 📜 License

MIT License. Bebas dipake buat belajar, proyek kampus, atau produksi KSP beneran. Jangan lupa kasih credit & star repo ya! 🙏✨

---

> Dibuat dengan ☕, , & sedikit ☀️ pagi oleh **Jefry Kurniawan** • 2026  
> _Code is poetry, but ERP is survival._ 💼📈

```

---
```
