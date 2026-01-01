# Penilaian 360 Derajat - UKPBJ Kemnaker

Website aplikasi penilaian kinerja pegawai berbasis 360 derajat untuk UKPBJ Kementerian Ketenagakerjaan. Aplikasi ini dirancang dengan antarmuka modern ("Linear-style aesthetics"), interaktif, dan mudah digunakan untuk memfasilitasi evaluasi kinerja berdasarkan nilai-nilai **BerAKHLAK**.

## 🚀 Fitur Utama

### 👥 Staff Dashboard (Pegawai)
- **Login Secure**: Autentikasi aman menggunakan Supabase Auth.
- **Daftar Rekan Kerja**: Melihat daftar rekan kerja yang perlu dinilai dalam satu unit.
- **Status Penilaian**: Indikator visual (Badge) untuk status penilaian (Belum/Sudah Dinilai).
- **Form Penilaian Interaktif**:
    - Penilaian 7 Aspek BerAKHLAK (Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif).
    - Rating Bintang (1-5) dengan konversi nilai otomatis (20-100).
    - Kolom komentar/masukan untuk setiap aspek.

### 🛡️ Admin Dashboard
- **Overview Statistik**:
    - Total Pegawai & Progress Partisipasi.
    - Rata-rata Nilai Keseluruhan.
    - Penilai Teraktif.
    - **Chart Rata-rata Nilai BerAKHLAK** (Bar Chart).
- **Laporan Individu**:
    - Filter/Pencarian Pegawai.
    - **Radar Chart**: Visualisasi kompetensi pegawai.
    - **Detail Nilai Per Aspek**: Bar chart dengan label nilai numerik.
    - **Masukan & Saran Anonim**: Melihat feedback kualitatif dari rekan kerja.
- **Manajemen Data**:
    - Proteksi rute (Role-based Access Control).
    - Reset Penilaian (Fitur dihapus/dinonaktifkan sesuai permintaan).

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database & Auth**: [Supabase](https://supabase.com/)

## 📂 Struktur Project

```
d:/App Project/Penilaian360
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Authentication routes (login)
│   ├── (marketing)/      # Landing page & informational pages
│   └── dashboard/        # Protected application routes (admin/staff)
├── components/           # Reusable UI components
│   ├── ui/               # ShadCN primitive components
│   ├── dashboard/        # Dashboard-specific components (Charts, Cards)
│   └── marketing/        # Landing page components (Hero, Contact)
├── lib/                  # Utilities & helper functions
│   └── supabase/         # Supabase client configuration
└── public/               # Static assets
```

## ⚙️ Cara Instalasi & Menjalankan

### Persyaratan
- Node.js 18+
- Akun Supabase (untuk database)

### 1. Clone Repository
```bash
git clone https://github.com/username/penilaian360.git
cd penilaian360
```

### 2. Install Dependencies
```bash
npm install
# atau
yarn install
```

### 3. Konfigurasi Environment Variables
Buat file `.env.local` di root folder dan tambahkan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Setup Database (Supabase)
Jalankan query SQL berikut di SQL Editor Supabase dashboard untuk membuat tabel yang diperlukan (`profiles`, `assessments`, `assessment_scores`).
*(Lihat file `supabase_schema.sql` untuk detail skema lengkap)*.

### 5. Menjalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📝 Lisensi
Internal UKPBJ Kementerian Ketenagakerjaan.
