# 🗺️ Peta Arsitektur Sistem & Pembagian Tanggung Jawab (NEXORA)

Dokumen ini adalah panduan resmi pembagian kode untuk project **NEXORA (HikeRent)** agar Anda dan tim pengembang tidak bingung mengenai batasan antara **Frontend**, **Backend Lokal**, dan **Backend Kampus**.

---

## 1. Tiga Pilar Sistem: Siapa Pemilik Apa?

```
┌───────────────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND NEXORA (Browser Pengguna)                                     │
│    Pemilik: Sisi Peminjam & Admin NEXORA                                  │
│    Folder: `components/` & `app/(pages)` & `lib/`                         │
│    Fungsi: Antarmuka visual, interaksi form, kalkulasi tarif lokal.       │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ memanggil Server Actions / API lokal
┌─────────────────────────────────────▼─────────────────────────────────────┐
│ 2. BACKEND LOKAL NEXORA (Next.js Server-Side / BFF)                       │
│    Pemilik: Server Aplikasi NEXORA Anda Sendiri                           │
│    Folder: `app/actions/` & `app/api/` & `services/gateway/`              │
│    Fungsi: Mengamankan session cookie, menginjeksi X-API-Key rahasia,     │
│            memvalidasi data sebelum dikirim ke gateway luar.              │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ HTTP Request (X-API-Key + JWT)
┌─────────────────────────────────────▼─────────────────────────────────────┐
│ 3. BACKEND KAMPUS HMIF UNRAM (External API Gateway v2)                    │
│    Pemilik: Laboratorium / Server Kampus (hmif.if.unram.ac.id)            │
│    URL Base: `https://hmif.if.unram.ac.id/api/v2/hikerent`               │
│    Fungsi: Memiliki Database fisik MySQL/PostgreSQL utama yang menyimpan  │
│            akun asli, stok barang kampus, transaksi, dan riwayat audit.   │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Struktur Folder Proyek yang Baru & Rapi

Setiap folder kini memiliki **satu tanggung jawab spesifik (*Single Responsibility*)**:

```
hike-rent/
│
├── 📁 app/                           <-- HANYA BERISI HALAMAN RUTE (ROUTING)
│   ├── page.js                       # Beranda utama
│   ├── katalog/                      # Halaman katalog publik
│   ├── login/ & register/            # Halaman autentikasi
│   ├── user/                         # Halaman dashboard & alur peminjam
│   │   ├── dashboard/                # Ringkasan akun
│   │   ├── dashboard/profil/         # Profil & ubah biodata
│   │   ├── katalog/                  # Katalog peminjam
│   │   ├── kalkulator/               # Simulasi estimasi biaya
│   │   ├── checkout/                 # Form pengajuan sewa
│   │   ├── riwayat/                  # Status & histori sewa peminjam
│   │   └── rekomendasi/              # Paket bundling & rekomendasi cerdas
│   ├── admin/                        # Halaman operasional administrator
│   │   ├── dashboard/                # Ringkasan metrik rental
│   │   ├── katalog/                  # Kelola inventaris alat live
│   │   ├── packages/                 # Kelola paket bundling & item
│   │   ├── approval/                 # Persetujuan pengajuan sewa
│   │   ├── accounts/                 # Manajemen akun pengguna
│   │   ├── reports/                  # Laporan operasional
│   │   ├── pendapatan/               # Rekapitulasi penghasilan
│   │   └── history/                  # Audit histori peminjaman
│   ├── api/                          # [Backend Lokal: REST API] 36 Route Handlers
│   └── actions/                      # [Backend Lokal: Server Actions] Server Actions
│
├── 📁 components/                    <-- HANYA BERISI KOMPONEN VISUAL (UI)
│   ├── admin/                        # AdminSidebar, dll.
│   ├── user/                         # DashboardSidebar, dll.
│   └── shared/                       # NavBar, Hero, Footer, CatalogView, RequireAuth, CTA, dll.
│
├── 📁 services/                      <-- JEMBATAN PENGHUBUNG KE BACKEND KAMPUS
│   └── gateway/                      # Klien resmi HMIF UNRAM API Gateway v2:
│       ├── client.js                 # HTTP Fetcher otomatis X-API-Key + JWT Token
│       ├── auth.js                   # Modul 1: Autentikasi & Akses Key
│       ├── categories.js             # Modul 2: Kategori Peralatan
│       ├── gear.js                   # Modul 3: Peralatan (Gear Items)
│       ├── rentals.js                # Modul 4: Transaksi Sewa
│       ├── rentalItems.js            # Modul 5: Rincian Item Transaksi
│       ├── packages.js               # Modul 6: Paket Pendakian
│       ├── packageItems.js           # Modul 7: Item Komposisi Paket
│       ├── wishlist.js               # Modul 8: Wishlist Peminjam
│       └── rentalStatusLogs.js       # Modul 9: Status Audit Logs
│
├── 📁 lib/                           <-- LOGIKA BISNIS & CACHE SISI BROWSER (CLIENT)
│   ├── catalogStore.js               # Sinkronisasi katalog live + cache localStorage
│   ├── useRole.js                    # Reaktivitas status login & role pengguna
│   ├── hitungBiaya.js                # Rumus matematika hitung durasi hari & biaya sewa
│   ├── rekomendasi.js                # Algoritma penentu paket alat per rombongan
│   ├── gear.js                       # Data inventaris cadangan jika server offline
│   └── admin/                        # Data cadangan akun & transaksi offline
│
└── 📁 docs/                          <-- LAPORAN TEKNIS LENGKAP 9 MODUL
```

---

## 3. Alur Komunikasi Data (Bagaimana Frontend Berbicara ke Backend)

Contoh alur ketika Pengguna melihat atau menyewa alat:

1. **Pengguna mengklik tombol di layar** (misal tombol *Ajukan Sewa* atau *Tambah Alat*).
2. **Frontend** memanggil fungsi Server Action di `app/actions/gear.js` atau REST API di `app/api/gear`.
3. **Backend Lokal NEXORA** membaca cookie sesi pengguna, menyisipkan header rahasia:
   - `X-API-Key: pk_hikerent_da4b2b680ab481f4`
   - `Authorization: Bearer <session_token>`
4. **Backend Lokal** meneruskan data melalui modul di `services/gateway/gear.js` ke **Backend Kampus** (`https://hmif.if.unram.ac.id/api/v2/hikerent/gear`).
5. **Backend Kampus** menyimpan ke basis data MySQL/PostgreSQL sebenarnya dan mengembalikan status sukses.
6. **Frontend** menerima respons dan memperbarui tampilan pengguna seketika.
