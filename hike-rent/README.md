# 🏔️ NEXORA (HikeRent) — Platform Rental Peralatan Pendakian & Camping

**NEXORA** adalah sistem informasi manajemen dan penyewaan alat pendakian gunung modern berbasis web yang dibangun dengan arsitektur **Next.js (App Router)** terintegrasi dengan **HMIF UNRAM API Gateway**.

---

## 🏛️ Arsitektur 3 Pilar Sistem

```
┌───────────────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND NEXORA (Browser Pengguna)                                     │
│    • UI Responsif Peminjam (`app/user/*`) & Admin (`app/admin/*`)         │
│    • Client Store & Local Cache (`lib/stores/*`)                          │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Server Actions / Route Handlers
┌─────────────────────────────────────▼─────────────────────────────────────┐
│ 2. BACKEND LOKAL NEXORA (Next.js Server-Side / BFF)                       │
│    • Validasi Payload & Server Actions (`app/actions/*`)                  │
│    • Pengamanan Cookie HttpOnly Session (`lib/server/session.js`)         │
│    • Jembatan Gateway HTTP Layer 1 & 2 (`services/gateway/*`)             │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ HTTPS (X-API-Key + JWT Bearer)
┌─────────────────────────────────────▼─────────────────────────────────────┐
│ 3. BACKEND API KAMPUS (HMIF UNRAM API Gateway v3)                         │
│    • Base URL: `https://hmif.if.unram.ac.id/api/v3/hikerent`              │
│    • Database MySQL/PostgreSQL utama (9 Modul Data)                       │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Peta Struktur Folder & Tanggung Jawab

| Folder | Tanggung Jawab (*Single Responsibility*) |
| :--- | :--- |
| **`app/`** | **Routing & Halaman Next.js**: Halaman publik (`/katalog`, `/login`), area peminjam (`/user/*`), area pengelola (`/admin/*`), Server Actions (`app/actions/*`), dan Route Handlers (`app/api/*`). |
| **`components/`** | **Komponen Antarmuka Visual (UI)**: Komponen global (`components/shared/*`), sidebar khusus (`components/user/*`, `components/admin/*`), dan sub-komponen modular per fitur (`components/features/*`). |
| **`constants/`** | **Kamus Konstanta Terpusat**: Enum status sewa (`rentalStatus.js`), role pengguna (`roles.js`), dan konfigurasi tanpa *magic string*. |
| **`services/gateway/`** | **Klien HTTP API Gateway**: Menghubungkan 9 modul backend HMIF UNRAM (`auth`, `gear`, `rentals`, `packages`, `wishlist`, `logs`, dll.). |
| **`lib/`** | **Logika Bisnis & Helper**: Terbagi rapi ke dalam: <br>• `lib/stores/` (Client Reactive Store `useSyncExternalStore`)<br>• `lib/server/` (Server-only helper & session cookie)<br>• `lib/hooks/` (Custom React Hooks seperti `useRole`)<br>• `lib/utils/` (Kalkulasi biaya, format Rupiah, crypto)<br>• `lib/domain/` (Smart Recommendation Engine) |
| **`docs/`** | **Dokumentasi Teknis 9 Modul**: Spesifikasi skema database, tabel endpoint, dan audit log lengkap. |

---

## ⚡ Panduan Onboarding Developer (*Developer Conventions*)

Bagi developer yang baru berkontribusi, ikuti pedoman alur komunikasi data berikut:

1. **Membuat Form / Mengirim Data dari UI ke Server**:
   - Gunakan **Server Actions** di `app/actions/*`.
   - Hindari *fetch* langsung ke backend luar dari komponen peramban (*client component*) demi keamanan token & API Key.
2. **Status Transaksi Peminjaman**:
   - Selalu rujuk ke `constants/rentalStatus.js` (`RENTAL_STATUS.PENDING`, `RENTAL_STATUS.ACTIVE`, dsb.) untuk mencegah error validasi database (400 Bad Request).
3. **Membaca State Reaktif di Sisi Browser**:
   - Gunakan hook dari `lib/stores/` (misal: `useCatalogSync()`, `useRentalsSync()`, `useWishlist()`).
4. **Halaman Panjang (>250 Baris)**:
   - Pecah menjadi sub-komponen terisolasi di dalam `components/features/[nama-fitur]/`.

---

## 🚀 Memulai Proyek Secara Lokal

### 1. Prasyarat
- Node.js versi 18.17+ atau 20+
- npm / yarn / pnpm

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (`.env.local`)
Pastikan berkas `.env.local` memiliki konfigurasi API Gateway yang valid:
```env
NEXT_PUBLIC_API_BASE_URL=https://hmif.if.unram.ac.id/api/v3
NEXT_PUBLIC_PROJECT_ID=hikerent
NEXT_PUBLIC_API_KEY=pk_hikerent_da4b2b680ab481f4
NEXT_PUBLIC_DEV_TOKEN=eyJzdWIi...
SESSION_SECRET=nexora_sec_...
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada [http://localhost:3000](http://localhost:3000).

---

## 👤 Akun Uji Coba Demo

| Peran (Role) | Email | Password | Akses Halaman |
| :--- | :--- | :--- | :--- |
| **Peminjam (User)** | `user@hikerent.com` | `password` | `/user/dashboard`, `/user/katalog`, `/user/checkout`, `/user/payment`, `/user/riwayat` |
| **Admin Pengelola** | `admin@hikerent.com` | `password` | `/admin/dashboard`, `/admin/approval`, `/admin/katalog`, `/admin/packages`, `/admin/reports` |

---

## 📚 Dokumentasi Teknis Lanjutan
Untuk rincian integrasi 9 modul backend database, silakan pelajari dokumen di folder [`docs/`](./docs):
- [Peta Arsitektur Sistem (`docs/STRUKTUR_ARSITEKTUR_SISTEM.md`)](./docs/STRUKTUR_ARSITEKTUR_SISTEM.md)
- [Modul Autentikasi (`docs/AUTENTIKASI_DAN_AKSES_KEY.md`)](./docs/AUTENTIKASI_DAN_AKSES_KEY.md)
- [Modul Kategori & Gear (`docs/KATEGORI_DAN_GEAR_ITEMS.md`)](./docs/KATEGORI_DAN_GEAR_ITEMS.md)
- [Modul Transaksi Rental (`docs/TRANSAKSI_RENTAL_DAN_RENTAL_ITEMS.md`)](./docs/TRANSAKSI_RENTAL_DAN_RENTAL_ITEMS.md)
- [Modul Paket Pendakian (`docs/PAKET_PENDAKIAN_DAN_ITEM_PAKET.md`)](./docs/PAKET_PENDAKIAN_DAN_ITEM_PAKET.md)
- [Modul Wishlist & Audit Logs (`docs/WISHLIST_DAN_RENTAL_STATUS_LOGS.md`)](./docs/WISHLIST_DAN_RENTAL_STATUS_LOGS.md)
