Rancangan DATABASE

bantu saya impelemntasi rancangan berikut dengan db mysql sha-256 dengan erp mvp dan dokumentasi laravel 10 dengan standar erp, berkut .env nya "DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ksp_erp_db
DB_USERNAME=ksp_user
DB_PASSWORD=ksp123456" dan berikut rancangan sistem yang saya buat, saya sudah membuat project tersebut dengan nama ksp-erp : # ERP Design untuk Koperasi Simpan Pinjam (KSP) Skala Micro/Medium dengan Laravel 10 & PostgreSQL

## Pendahuluan

Sistem ERP untuk Koperasi Simpan Pinjam (KSP) skala mikro/menengah perlu fokus pada proses inti yang kritis: manajemen anggota, simpan pinjam, dan pelaporan keuangan. Berdasarkan studi sistem informasi KSP berbasis web, desain ini memprioritaskan fitur esensial untuk MVP dengan teknologi Laravel 10 dan PostgreSQL yang dikenal andal untuk proyek ERP. PostgreSQL dipilih karena arsitektur terbukti, integritas data, dan fitur yang robust untuk kebutuhan sistem keuangan.

## Modul Utama dan Submenu

### 1. Manajemen Anggota

- **Daftar Anggota** (CRUD, filter status, pencarian)
- **Detail Anggota** (informasi pribadi, riwayat simpanan & pinjaman)
- **Verifikasi Anggota** (validasi data, aktif/non-aktif)
- **Laporan Anggota** (statistik jumlah anggota, aktivitas)

### 2. Manajemen Simpanan

- **Setor Simpanan** (transaksi deposit)
- **Tarik Simpanan** (transaksi penarikan)
- **Rekening Simpanan** (riwayat transaksi, saldo)
- **Perhitungan Bunga** (otomatis per bulan)
- **Laporan Simpanan** (per anggota, per periode)

### 3. Manajemen Pinjaman

- **Ajukan Pinjaman** (form aplikasi)
- **Verifikasi Pinjaman** (review oleh admin)
- **Pencairan Pinjaman** (konfirmasi pencairan)
- **Jadwal Angsuran** (rencana pembayaran)
- **Pencatatan Angsuran** (pembayaran cicilan)
- **Laporan Pinjaman** (portofolio, tunggakan)

### 4. Laporan Keuangan

- **Laporan Harian** (transaksi simpanan/pinjaman)
- **Neraca Saldo** (asets, liabilities, ekuitas)
- **Laporan Piutang** (pinjaman aktif & tunggakan)
- **Laporan Laba Rugi** (sederhana untuk MVP)

### 5. Manajemen Sistem

- **Pengaturan Pengguna** (role admin/staff)
- **Pengaturan Sistem** (suku bunga, aturan pinjaman)
- **Backup Database** (otomatis harian)

## Rancangan Database PostgreSQL

### Tabel Utama dan Relasi

```sql
-- Tabel Anggota
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    status VARCHAR(10) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Rekening Simpanan (1:1 dengan anggota)
CREATE TABLE savings_accounts (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) UNIQUE,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Transaksi Simpanan
CREATE TABLE savings_transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES savings_accounts(id),
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('deposit', 'withdrawal', 'interest')),
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pinjaman
CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    term_months SMALLINT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'disbursed', 'repaid')) DEFAULT 'pending',
    approved_date DATE,
    disbursement_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Angsuran Pinjaman
CREATE TABLE loan_repayments (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER REFERENCES loans(id),
    due_date DATE NOT NULL,
    amount_due DECIMAL(15,2) NOT NULL,
    amount_paid DECIMAL(15,2) DEFAULT 0.00,
    paid_date DATE,
    status VARCHAR(10) CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pengguna Sistem
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Hubungan Relasi

- **Satu anggota memiliki satu rekening simpanan** (one-to-one)
- **Satu anggota memiliki banyak pinjaman** (one-to-many)
- **Satu rekening simpanan memiliki banyak transaksi** (one-to-many)
- **Satu pinjaman memiliki banyak angsuran** (one-to-many)

## Fungsi Penting pada Setiap Submenu

### Manajemen Anggota

- **Validasi Data Baru**: Pastikan email/phone unik sebelum menyimpan data anggota baru.
- **Status Aktivasi**: Implementasi logika "deaktivasi sementara" dengan update status dan pencatatan alasan.
- **Riwayat Transaksi**: Menampilkan semua transaksi simpanan/pinjaman terkait anggota dalam satu tampilan.

### Manajemen Simpanan

- **Setor Simpanan**:
  - Validasi saldo minimal (jika ada aturan)
  - Update `balance` di `savings_accounts`
  - Catat transaksi dengan tipe "deposit" di `savings_transactions`
- **Tarik Simpanan**:
  - Validasi saldo cukup sebelum penarikan
  - Update balance dan catat transaksi tipe "withdrawal"
- **Perhitungan Bunga Otomatis**:
  - Setiap akhir bulan, hitung bunga = `balance * interest_rate / 12`
  - Catat sebagai transaksi "interest"

### Manajemen Pinjaman

- **Ajukan Pinjaman**:
  - Validasi status anggota aktif dan riwayat pinjaman sebelumnya
  - Hitung kemampuan membayar berdasarkan simpanan (jika ada aturan)
- **Verifikasi Pinjaman**:
  - Hitung angsuran bulanan menggunakan formula amortisasi:
    ```
    monthly_payment = (principal * monthly_rate * (1+monthly_rate)^term) / ((1+monthly_rate)^term - 1)
    ```
  - Buat entri di `loan_repayments` untuk setiap bulan
- **Pencairan Pinjaman**:
  - Update status menjadi "disbursed"
  - Catat tanggal pencairan di `disbursement_date`
- **Pencatatan Angsuran**:
  - Validasi jumlah pembayaran sesuai jadwal
  - Update `amount_paid` dan status di `loan_repayments`
  - Hitung sisa tunggakan otomatis

### Laporan Keuangan

- **Laporan Harian**:
  - Agregasi semua transaksi simpanan/pinjaman hari ini
  - Tampilkan total deposit, penarikan, pencairan, dan pembayaran
- **Neraca Saldo**:
  - Aset = Total simpanan + Total pinjaman aktif
  - Liabilitas = Total simpanan (karena koperasi harus mengembalikan ke anggota)
  - Ekuitas = Aset - Liabilitas
- **Laporan Piutang**:
  - Tampilkan pinjaman aktif, total tunggakan, dan anggota yang menunggak

## Teknologi Implementasi

### Laravel 10 dengan REST API

- Gunakan **Laravel Sanctum** untuk autentikasi API dengan role-based access control
- Setiap modul memiliki controller tersendiri (e.g., `MemberController`, `LoanController`)
- Contoh endpoint:
  ```php
  // Deposit simpanan
  POST /api/savings/deposit
  {
    "member_id": 1,
    "amount": 500000,
    "description": "Setoran bulanan"
  }
  ```

### Docker Setup

File `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ksp
      POSTGRES_USER: ksp_user
      POSTGRES_PASSWORD: ksp_pass
    volumes:
      - postgres_/var/lib/postgresql/data
    ports:
      - '5432:5432'

  web:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - .:/var/www/html
    ports:
      - '8000:8000'
    depends_on:
      - db
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_DATABASE: ksp
      DB_USERNAME: ksp_user
      DB_PASSWORD: ksp_pass

volumes: postgres_
```

File `Dockerfile`:

```dockerfile
FROM php:8.2-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif bcmath

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy dependencies
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader

# Copy application code
COPY . .

# Generate autoloader
RUN composer dump-autoload

# Expose port
EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0"]
```

## Keunggulan Desain Ini

1. **MVP Fokus**: Hanya fitur inti yang diperlukan untuk operasional harian KSP
2. **Skalabilitas**: PostgreSQL mendukung pertumbuhan data hingga skala menengah tanpa masalah kinerja
3. **Keandalan**: Laravel dengan PostgreSQL memastikan integritas data transaksi keuangan yang kritis
4. **Portabilitas**: Docker memungkinkan deployment mudah di berbagai lingkungan
5. **Modular**: Setiap modul terpisah sehingga mudah dikembangkan ke fitur tambahan nanti (seperti manajemen saham)

Sistem ini memenuhi kebutuhan dasar KSP mikro/menengah dan dapat dikembangkan lebih lanjut sesuai kebutuhan spesifik koperasi.
