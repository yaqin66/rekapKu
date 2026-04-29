# RekapKu - Aplikasi Manajemen Keuangan Pribadi 💰

RekapKu adalah aplikasi berbasis web yang dirancang untuk membantu Anda melacak, mengelola, dan menganalisis keuangan pribadi dengan mudah. Dilengkapi dengan antarmuka pengguna (UI) modern bergaya *Glassmorphism* dan berbagai fitur canggih untuk mengontrol pengeluaran dan pemasukan Anda.

## ✨ Fitur Utama
* **Dashboard Interaktif**: Ringkasan total saldo, statistik pemasukan/pengeluaran bulanan, dan grafik *cash flow*.
* **Manajemen Dompet (Wallets)**: Buat banyak dompet (BCA, OVO, Tunai, dll) dan transfer saldo antar dompet.
* **Tujuan Keuangan (Goals)**: Tetapkan target tabungan (seperti "Beli Laptop" atau "Liburan") dan lacak progresnya.
* **Tagihan Rutin (Bills)**: Catat tagihan bulanan agar tidak pernah terlewat (Listrik, Internet, dll).
* **Utang & Piutang (Debts)**: Lacak siapa yang meminjam uang Anda dan kepada siapa Anda berutang.
* **Sistem Keamanan PIN**: Fitur pengunci aplikasi (4 digit PIN) untuk menjaga privasi data keuangan Anda.
* **Ekspor ke Excel**: Unduh riwayat laporan keuangan Anda dalam format `.csv`.
* **Dark Mode & Light Mode**: Tema yang menyesuaikan preferensi kenyamanan mata Anda.

## 🛠️ Tech Stack
* **Frontend:** React.js (Vite), Tailwind CSS v4, Lucide-React, Recharts.
* **Backend:** Node.js, Express.js.
* **Database:** SQLite (`better-sqlite3`).

---

## 🚀 Cara Instalasi dan Penggunaan

Bagi Anda yang mengunduh atau melakukan *clone* repositori ini, ikuti langkah-langkah di bawah ini untuk menjalankannya di komputer Anda.

### 📋 Prasyarat
Pastikan Anda sudah menginstal **Node.js** (direkomendasikan versi 18 atau 20 LTS) di komputer Anda. Anda bisa mengunduhnya di [nodejs.org](https://nodejs.org/).

### 1. Persiapan
Clone repositori ini dan masuk ke dalam folder proyek:
```bash
[git clone https://github.com/yaqin66/rekapKu.git]
cd rekapku
```
*(Ganti URL di atas dengan URL repositori GitHub Anda)*

### 2. Install Dependencies
Jalankan perintah ini untuk mengunduh semua pustaka yang dibutuhkan (Frontend & Backend):
```bash
npm install
```

### 3. Menjalankan Mode Development (Pengembangan)
Untuk menjalankan aplikasi secara lokal dengan fitur *hot-reload* (baik server backend maupun vite frontend akan berjalan bersaamaan):
```bash
npm run dev
```
Setelah itu, buka browser Anda dan akses: **`http://localhost:5173`**

### 4. Menjalankan Mode Production (Produksi)
Jika Anda ingin mencoba menjalankan aplikasi ini seolah-olah sedang berada di server asli (VPS), ikuti dua perintah ini:

**Langkah 1: Build Frontend**
```bash
npm run build
```
*(Perintah ini akan membuat folder `dist` yang berisi file statis)*

**Langkah 2: Jalankan Server**
```bash
npm run server
```
Akses aplikasi melalui: **`http://localhost:5173`**

---

## 📁 Struktur Database
Proyek ini menggunakan SQLite. Saat pertama kali Anda menjalankan aplikasi (baik via `npm run dev` atau `npm run server`), file database bernama **`rekapku.db`** akan otomatis dibuat di folder utama.
Semua data keuangan Anda akan tersimpan secara lokal di dalam file tersebut.

## 🤝 Berkontribusi
Jika Anda ingin menambahkan fitur atau memperbaiki *bug*, jangan ragu untuk melakukan *Fork* pada repositori ini dan kirimkan *Pull Request*. Saran dan perbaikan sangat dihargai!

## 📄 Lisensi
Proyek ini bersifat *Open-Source* dan tersedia di bawah Lisensi MIT. Bebas untuk dimodifikasi dan digunakan untuk keperluan pribadi maupun pembelajaran.
