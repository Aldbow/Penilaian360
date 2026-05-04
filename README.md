<div align="center">
  <h1>🌟 Penilaian 360 Derajat</h1>
  <p><b>UKPBJ Kementerian Ketenagakerjaan Republik Indonesia</b></p>
  <p>Aplikasi penilaian kinerja pegawai berbasis 360 derajat yang dirancang dengan antarmuka modern, interaktif, dan mudah digunakan untuk memfasilitasi evaluasi kinerja berdasarkan nilai-nilai <b>BerAKHLAK</b>.</p>

  <div>
    <img src="https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </div>
</div>

---

## 🚀 Fitur Utama

### 👥 Staff Dashboard (Pegawai)
- **🔐 Login Secure**: Autentikasi aman terintegrasi menggunakan Supabase Auth.
- **📋 Daftar Rekan Kerja**: Melihat daftar rekan kerja yang perlu dinilai dalam satu unit secara interaktif.
- **✅ Status Penilaian**: Indikator visual (Badge) untuk melacak status penilaian (Belum / Sudah Dinilai).
- **📝 Form Penilaian Cerdas**:
    - Penilaian 7 Aspek **BerAKHLAK** (Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif).
    - Panduan Indikator Penilaian dinamis yang dapat di-*expand*.
    - Rating Bintang (1-5) dengan konversi nilai numerik otomatis (20-100).
    - Kolom masukan dan komentar kualitatif opsional untuk setiap aspek.

### 🛡️ Admin Dashboard
- **📊 Overview Statistik Global**:
    - Total Pegawai & Progress Partisipasi keseluruhan.
    - Rata-rata Nilai Keseluruhan Unit.
    - Top Penilai Teraktif.
    - **Bar Chart**: Rata-rata Nilai BerAKHLAK secara keseluruhan.
- **📈 Laporan Kinerja Individu**:
    - Pencarian & Filter Pegawai yang responsif.
    - **Radar Chart**: Visualisasi pemetaan kompetensi pegawai secara detail.
    - **Bar Chart Aspek**: Detail nilai per aspek dengan label metrik yang akurat.
    - **Masukan & Saran Anonim**: Menampilkan feedback kualitatif dari rekan kerja secara terstruktur.
- **⚙️ Manajemen Sistem**:
    - Proteksi rute berbasis peran (*Role-based Access Control*).

### 🤖 Fitur Automasi
- **🔄 Supabase Keep-Alive**: Terintegrasi otomatis dengan **Vercel Cron Jobs** untuk mencegah *pause* database pada *free-tier* secara otomatis tanpa intervensi manual.

---

## 🛠️ Teknologi yang Digunakan

| Kategori | Teknologi | Deskripsi |
| --- | --- | --- |
| **Framework** | [Next.js 14+](https://nextjs.org/) | App Router & React Server Components |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| **UI/UX** | [ShadCN UI](https://ui.shadcn.com/) & [Framer Motion](https://www.framer.com/motion/) | Komponen modern & Animasi transisi |
| **Icons** | [Lucide React](https://lucide.dev/) | Ikon minimalis dan konsisten |
| **Visualisasi** | [Recharts](https://recharts.org/) | Library pembuatan grafik analitik (Radar, Bar) |
| **Database & Auth**| [Supabase](https://supabase.com/) | PostgreSQL & Authentication Service |
| **Hosting & Cron** | [Vercel](https://vercel.com/) | Deployment platform & edge network |

---

## 📂 Struktur Repositori

```text
├── app/                  # Route Next.js App Router
│   ├── (auth)/           # Route autentikasi (login, sign-up)
│   ├── (marketing)/      # Halaman utama (landing page)
│   ├── api/              # API Routes (contoh: endpoint keep-alive)
│   └── dashboard/        # Halaman Dashboard (Admin & Staff)
├── components/           # Komponen UI Reusable
│   ├── ui/               # Primitive components dari ShadCN
│   ├── dashboard/        # Chart, Cards, & Table untuk dashboard
│   └── marketing/        # Komponen Landing page
├── lib/                  # Fungsi Helper & Utilitas
│   └── supabase/         # Klien Supabase (Browser & Server)
├── public/               # Aset statis (Gambar, dll)
├── vercel.json           # Konfigurasi Vercel (termasuk Cron Job)
└── middleware.ts         # Middleware proteksi autentikasi & role
```

---

## ⚙️ Panduan Instalasi & Pengembangan

### 📋 Persyaratan Sistem
- Node.js versi 18.17 atau lebih baru
- Akun Supabase aktif
- Git terinstall di sistem operasi

### 1️⃣ Clone Repositori
```bash
git clone https://github.com/Aldbow/Penilaian360.git
cd Penilaian360
```

### 2️⃣ Install Dependensi
```bash
npm install
# atau
yarn install
```

### 3️⃣ Konfigurasi *Environment Variables*
Buat salinan dari `.env.example` menjadi `.env.local` di *root folder* proyek Anda:
```bash
cp .env.example .env.local
```
Lengkapi data di dalam file `.env.local` dengan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4️⃣ Jalankan Server Development
```bash
npm run dev
```
Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000).

---

## 📜 Lisensi & Penggunaan
Aplikasi ini ditujukan khusus untuk keperluan internal **UKPBJ Kementerian Ketenagakerjaan Republik Indonesia**. Segala bentuk pendistribusian atau penggunaan komersial harus dengan izin terkait.
