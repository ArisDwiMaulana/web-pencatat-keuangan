# Web Pencatat Keuangan

Aplikasi web sederhana untuk mencatat dan mengelola keuangan pribadi (pemasukan dan pengeluaran). Dibangun menggunakan **PocketBase** sebagai backend database & REST API, serta frontend dengan **HTML5**, **Tailwind CSS**, **daisyUI**, dan **Vanilla JavaScript**.

---

## Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Prasyarat Sistem](#-prasyarat-sistem)
- [Struktur Proyek](#-struktur-proyek)
- [Langkah Setup](#-langkah-setup)
- [Cara Menjalankan (Running)](#-cara-menjalankan-running)
  - [1. Menjalankan Backend (PocketBase)](#1-menjalankan-backend-pocketbase)
  - [2. Membuat Akun Superuser / Admin PocketBase](#2-membuat-akun-superuser--admin-pocketbase)
  - [3. Menjalankan Tailwind CSS (Opsional saat Development)](#3-menjalankan-tailwindcss-opsional-saat-development)
- [Cara Membuka di Browser](#-cara-membuka-di-browser)
- [Cara Menghentikan Aplikasi](#-cara-menghentikan-aplikasi)

---

## Fitur Utama

- **Catat Transaksi**: Input pemasukan atau pengeluaran lengkap dengan kategori, jenis transaksi (_Cash_ / _Cashless_), nominal, tanggal, dan catatan opsional.
- **Ringkasan Finansial Realtime**: Menampilkan total pemasukan, pengeluaran, serta sisa saldo.
- **Riwayat Transaksi**:
  - Filter berdasarkan periode (_Minggu Ini_, _Bulan Ini_, _Semua_).
  - Filter berdasarkan rentang tanggal kustom (_Dari tanggal_ & _Sampai tanggal_).
  - Filter berdasarkan tipe (_Pemasukan_ / _Pengeluaran_) dan jenis transaksi (_Cash_ / _Cashless_).
  - Pagination otomatis (10 data per halaman).
  - Hapus transaksi dengan dialog konfirmasi.
- **Ekspor CSV**: Unduh data riwayat transaksi yang terfilter ke dalam berkas CSV (mendukung format UTF-8 BOM untuk Microsoft Excel).

---

## Syarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terinstal:

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)
- `wget` (untuk mengunduh standalone binary Tailwind & daisyUI)
- Sistem Operasi berbasis Linux / macOS / WSL (Windows Subsystem for Linux)

---

## Struktur Proyek

```text
├── docker-compose.yml             # Konfigurasi container PocketBase
├── create-account-pb.sh           # Shell script pembuat akun superuser PocketBase
├── migrations/                    # File migrasi skema tabel PocketBase (transaksi)
├── data/                          # Volume data database SQLite PocketBase
└── public/                        # Web static & frontend assets
    ├── index.html                 # Halaman utama (Pencatatan & Ringkasan)
    ├── riwayat.html               # Halaman riwayat transaksi & filter
    ├── input.css                  # Sumber style Tailwind & daisyUI
    ├── output.css                 # Hasil kompilasi CSS Tailwind
    ├── js/
    │   ├── halaman_catat/         # Script logika halaman pencatatan
    │   └── halaman_riwayat/       # Script logika halaman riwayat
    └── shell_script/
        ├── setup.sh               # Unduh Tailwind CLI & daisyui.css
        ├── run-dev.sh             # Watch mode Tailwind saat development
        └── run-build.sh           # Build & minify output CSS
```

---

## Langkah Setup

Ikuti langkah-langkah berikut untuk menyiapkan environment proyek:

### 1. Clone Repositori

```bash
git clone https://github.com/ArisDwiMaulana/web-pencatat-keuangan.git
cd web-pencatat-keuangan
```

### 2. Berikan Izin Eksekusi pada Script

Berikan izin eksekusi (_executable_) untuk seluruh shell script:

```bash
chmod +x create-account-pb.sh
chmod +x public/shell_script/*.sh
```

### 3. Setup Tailwind CSS & daisyUI

Jalankan script `setup.sh` di dalam folder `public` untuk mengunduh Standalone Tailwind CLI dan berkas `daisyui.css` secara otomatis:

```bash
cd public
./shell_script/setup.sh
cd ..
```

---

## Cara Menjalankan (Running)

### 1. Menjalankan Backend (PocketBase)

Jalankan service PocketBase menggunakan Docker Compose:

```bash
docker compose up -d
```

Container `pocketbase_app` akan aktif di port `8090`. File migrasi tabel `transaksi` yang ada di folder `migrations/` akan otomatis diaplikasikan ke database.

Untuk memeriksa status container:

```bash
docker compose ps
```

### 2. Membuat Akun Superuser / Admin PocketBase

Gunakan script `create-account-pb.sh` untuk membuat akun administrator PocketBase secara instan:

```bash
./create-account-pb.sh <nama_container> <email_admin> <password>
```

**Contoh:**

```bash
./create-account-pb.sh pocketbase_app admin@keuangan.local password12345
```

> _Catatan: Panjang password minimal 10 karakter._

### 3. Menjalankan Tailwind CSS (Sekali saja)

Jika Anda ingin mengubah tampilan class styling atau HTML dan ingin Tailwind mengompilasi CSS secara otomatis:

- **Mode Watch / Development:**

  ```bash
  cd public
  ./shell_script/run-dev.sh
  ```

- **Mode Build Production (Minified):**
  ```bash
  cd public
  ./shell_script/run-build.sh
  ```

---

## Cara Membuka di Browser

Karena PocketBase secara bawaan menyajikan seluruh berkas statis dari folder `public/`, Anda dapat langsung mengakses aplikasi melalui URL berikut:

| Halaman               | URL Browser                                                                                                              | Keterangan                                                               |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| **Catat Transaksi**   | [http://localhost:8090](http://localhost:8090) atau [http://localhost:8090/index.html](http://localhost:8090/index.html) | Halaman utama untuk memasukkan transaksi dan melihat ringkasan bulan ini |
| **Riwayat Transaksi** | [http://localhost:8090/riwayat.html](http://localhost:8090/riwayat.html)                                                 | Halaman filter transaksi, daftar riwayat, pagination, dan ekspor CSV     |
| **Admin PocketBase**  | [http://localhost:8090/_/](http://localhost:8090/_/)                                                                     | Dashboard database untuk melihat/mengelola record tabel `transaksi`      |

---

## Cara Menghentikan Aplikasi

Untuk mematikan container PocketBase:

```bash
docker compose down
```

Data transaksi Anda akan tetap tersimpan aman di dalam direktori `data/`.
