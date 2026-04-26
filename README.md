# 🎓 WeStud LMS - Modern Learning Management System

WeStud adalah platform Learning Management System (LMS) modern yang dirancang untuk memberikan pengalaman belajar yang interaktif dan seamless. Dibangun dengan teknologi terkini untuk performa maksimal dan user experience yang luar biasa.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)

## 🚀 Fitur Utama

- **Dashboard Interaktif**: Manajemen kursus, tugas, dan jadwal dalam satu tempat.
- **Sistem Mentor**: Terhubung langsung dengan mentor ahli di bidangnya.
- **Course Management**: Alur belajar yang terstruktur mulai dari pendaftaran hingga sertifikasi.
- **Visual 3D & Animasi**: Pengalaman visual memukau menggunakan Three.js dan Framer Motion.
- **Responsive Design**: Akses lancar dari perangkat mobile maupun desktop.
- **Role-based Access**: Dashboard khusus untuk siswa dan pengelola.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [TanStack Router](https://tanstack.com/router) (Type-safe routing)
- **State Management & Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (Auth, Database, Storage)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/), & [Three.js](https://threejs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)

## 📦 Instalasi

1. **Clone Repository**
   ```bash
   git clone https://github.com/Crown-us/lms-westud.git
   cd lms-westud
   ```

2. **Install Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Salin `.env.example` menjadi `.env` dan isi kredensial Supabase Anda:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Jalankan Mode Development**
   ```bash
   npm run dev
   ```

## 🏗️ Struktur Folder

```text
src/
├── components/     # Reusable UI components (Shadcn)
├── lib/            # Utility functions & Supabase client
├── routes/         # File-based routing (TanStack Router)
├── assets/         # Images, icons, and 3D models
└── main.tsx        # Entry point
```

## 🚀 Deployment

Proyek ini siap untuk di-deploy ke **Vercel**. Pastikan untuk menambahkan environment variables (`VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`) di dashboard Vercel Anda.

---

Made with ❤️ by [Crown-us](https://github.com/Crown-us)
