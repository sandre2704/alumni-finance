# Business Requirements Document (BRD) & Implementation Plan
**Project Name:** Alumni Finance
**Document Status:** Final / Active
**Date:** 26 Juni 2026

---

## 1. Executive Summary
**Alumni Finance** adalah sebuah platform manajemen keuangan berbasis web yang dirancang khusus untuk memfasilitasi transparansi dan pengelolaan dana komunitas alumni. Aplikasi ini mengotomatiskan pencatatan kas (masuk/keluar), pelacakan target donasi (crowdfunding), serta integrasi pembayaran digital secara langsung guna memberikan pengalaman yang seamless bagi donatur maupun pengurus (bendahara).

## 2. Product Vision & Goals
**Visi:**
Membangun ekosistem keuangan komunitas alumni yang transparan, aman, dan mudah diakses, guna menumbuhkan rasa saling percaya dan partisipasi aktif dari setiap anggota alumni.

**Business Goals (Objectives):**
- **Transparansi:** Memberikan akses *real-time* kepada anggota alumni untuk melihat arus kas dan laporan keuangan.
- **Efisiensi:** Mengurangi beban kerja bendahara dalam pencatatan manual, rekapitulasi, dan pembuatan laporan akhir.
- **Aksesibilitas Donasi:** Memudahkan anggota untuk berdonasi melalui berbagai metode pembayaran digital dengan konfirmasi otomatis.

## 3. Target Audience & User Roles
Platform ini melayani dua jenis pengguna utama dengan otorisasi (Role-Based Access Control) yang berbeda:

1. **Admin (Pengurus/Bendahara):**
   - Memiliki akses penuh (CRUD) ke seluruh fitur aplikasi.
   - Bertanggung jawab mencatat pengeluaran, memverifikasi pemasukan manual, mengelola target donasi, mengatur kategori budget, serta mengelola data user dan *site settings*.
2. **Guest / Alumni Member:**
   - Dapat melihat *dashboard* transparansi, arus kas bulanan, dan laporan keuangan publik.
   - Dapat berdonasi melalui *payment gateway* (Midtrans) atau metode transfer manual.
   - Dapat melengkapi profil pribadi dan mengirimkan *feedback* kepada pengurus.

---

## 4. Key Business Requirements & Features

### 4.1. Authentication & Profile Management
- **Login/Register:** Dukungan otentikasi via Email/Password dan Single Sign-On (Google OAuth).
- **Profile Completion:** *Onboarding flow* wajib bagi pengguna baru untuk melengkapi username dan password.
- **Verification & Reset:** Sistem pengiriman email (via SMTP/Resend) untuk verifikasi akun dan reset password.

### 4.2. Financial Dashboard & Analytics
- **Summary Metrics:** Total Balance, Pemasukan Bulan Ini, Pengeluaran Bulan Ini, serta persentase tren (vs bulan lalu).
- **Cashflow Chart:** Visualisasi grafik arus kas bulanan (hingga 6 bulan terakhir).
- **Budget Tracking:** Persentase serapan anggaran per kategori pengeluaran bulan berjalan.

### 4.3. Transaction Management (Core Ledger)
- **Income & Expense Tracking:** Pencatatan setiap transaksi dengan parameter kategori, jumlah, tanggal, dan bukti kuitansi.
- **Transaction Filters:** Filter dan pagination berdasarkan tipe (income/expense), status (paid/processing), kategori, dan rentang tanggal.

### 4.4. Donation Targets (Crowdfunding)
- **Campaign Management:** Pembuatan *goal* spesifik (misal: "Sumbangan Reuni Akbar") dengan target dana dan rentang waktu.
- **Progress Tracking:** Progress bar otomatis yang bereaksi setiap kali transaksi donasi masuk dan statusnya *paid*.

### 4.5. Digital Payments (Payment Gateway)
- **Midtrans Integration:** User dapat berdonasi (termasuk sebagai donatur anonim) menggunakan virtual account, e-wallet, atau kartu kredit.
- **Webhook Automation:** Sistem secara otomatis mendeteksi konfirmasi pembayaran dari Midtrans (via `order_id`) dan mengubah status transaksi di database, memperbarui *ledger* dan *donation target*.

### 4.6. Reports & Exporting
- **Monthly/Daily Comparisons:** Fitur perbandingan finansial yang komprehensif.
- **Export to PDF & Excel:** Otomatisasi pembentukan laporan fisik/digital yang valid menggunakan `PDFKit` dan `ExcelJS`.

### 4.7. Feedback & Site Settings
- **Public Feedback:** Sistem penampung opini/saran publik dengan status tracking (pending/approved/rejected).
- **Site Settings:** Admin dapat secara dinamis merubah instruksi transfer manual, nomor WhatsApp kontak, dan upload QR Code statis tanpa perlu *hard-code* aplikasi.

---

## 5. Technical Architecture & Stack

Sistem dibangun menggunakan arsitektur **Monorepo (Turborepo)** untuk mempermudah *code-sharing* dan deployment.

- **Frontend (Web):** React 18, Vite, React Router 7, TailwindCSS, React Query.
- **Backend (API):** Express.js (Node.js), TypeScript.
- **Database:** PostgreSQL 16 dengan **Drizzle ORM** untuk validasi skema berbasis *typesafe*.
- **Authentication:** Better Auth (Mendukung auth table generation dan integrasi OAuth).
- **Infrastructure:**
  - **Storage:** Cloudinary (untuk upload gambar/kuitansi).
  - **Email:** Resend / Nodemailer.
  - **Payment:** Midtrans Core API & Snap.
  - **Deployment Target:** Vercel (Frontend), Railway/Docker/Vercel (Backend API).

---

## 6. Implementation Roadmap

### Phase 1: MVP (Minimum Viable Product) & Core Foundation
*Fokus: Struktur data, autentikasi, dan pencatatan manual dasar.*
- Setup Monorepo, Database Schema (Drizzle), dan Better Auth.
- Pembuatan API dan UI CRUD untuk Kategori dan Transaksi manual.
- Pembuatan UI Dashboard statistik dasar.
- Setup Environment variables dan deployment test (Docker/Vercel).

### Phase 2: Payment Gateway & Automation
*Fokus: Memudahkan donasi dan mengurangi intervensi manual bendahara.*
- Integrasi Midtrans Snap untuk flow *checkout* donasi di Frontend.
- Implementasi Midtrans Webhook di Backend untuk deteksi pembayaran otomatis (berdasarkan `orderId`).
- Pembuatan modul Donation Targets beserta sinkronisasi nominal dengan transaksi *income*.

### Phase 3: Reports, Security, & Refinement
*Fokus: Laporan keuangan komprehensif, keamanan, dan DX.*
- Implementasi API Export (Excel/PDF).
- Penyempurnaan CORS policies, middleware validasi input (Zod), dan error handling (API Response Standardization).
- Implementasi sistem Email (Strategy pattern: Resend -> SMTP) untuk verifikasi akun.
- Penyelesaian fitur Feedback dan modul profil.

---

## 7. Success Metrics (KPIs)
Setelah sistem diluncurkan, metrik berikut digunakan untuk mengukur kesuksesan implementasi:
1. **Adoption Rate:** Setidaknya 50% dari grup alumni aktif memiliki akun (terverifikasi) dalam 3 bulan pertama.
2. **Transaction Automation Rate:** >70% donasi masuk diproses secara otomatis via Midtrans tanpa input manual bendahara.
3. **Engagement:** Peningkatan rata-rata donasi/iuran per bulan setelah transparansi arus kas diterapkan.
4. **Zero Downtime Database Migrations:** Seluruh pembaharuan skema Drizzle tereksekusi tanpa mengganggu pelayanan *live*.

---
*Document prepared automatically by AI Product Manager.*
