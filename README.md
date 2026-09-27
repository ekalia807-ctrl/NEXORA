<div align="center">
  <img src="./IMAGE/HikeRent.jpg" alt="HikeRent Logo" width="220" />
  <h1>🏔️ HikeRent</h1>
  <p><strong>Platform Peminjaman Alat Pendakian Modern & Smart Hiking Gear Rental</strong></p>
  <p>
    <a href="#deskripsi-project">Deskripsi</a> •
    <a href="#fitur-utama">Fitur</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#struktur-peran-role">Struktur Peran</a> •
    <a href="#cara-instalasi">Instalasi</a> •
    <a href="#anggota-kelompok">Anggota Kelompok</a>
  </p>
</div>

---

## 📝 Deskripsi Project

**Tema:** Peminjaman Peralatan Pendakian & Camping Outdoor

**HikeRent** adalah platform peminjaman alat pendakian yang menghubungkan peminjam dengan pemberi pinjaman (penyedia alat) secara online. Aplikasi ini dirancang untuk memudahkan proses pengajuan, pengecekan ketersediaan alat secara otomatis, hingga proses *approval* peminjaman.

Dengan integrasi **Smart Recommendation** dan kalkulasi biaya otomatis, pengguna dapat merencanakan kebutuhan pendakian mereka dengan lebih cepat, aman, dan efisien. Komunikasi antara peminjam dan admin/pemberi pinjaman juga didukung langsung melalui integrasi WhatsApp Click-to-Chat.

## 🌲 2. Pohon Direktori Lengkap Proyek (`hike-rent/`)

```text
hike-rent/
├── app/                                # Next.js 15 App Router Directory
│   ├── actions/                        # Next.js Server Actions (BFF)
│   │   ├── auth.js                     # Login, register, logout, session cookie
│   │   ├── categories.js               # CRUD kategori peralatan
│   │   ├── gear.js                     # CRUD alat pendakian & upload gambar
│   │   ├── packages.js                 # CRUD paket bundling pendakian
│   │   ├── rentals.js                  # CRUD transaksi sewa & rental_items
│   │   └── rentalStatusLogs.js         # Audit trail status history logs
│   ├── admin/                          # Panel Khusus Administrator
│   │   ├── accounts/page.js            # Manajemen akun pengguna
│   │   ├── approval/                   # Verifikasi & approval pengajuan sewa
│   │   │   ├── components/
│   │   │   │   ├── ApprovalFilterBar.js    # Filter tab & search live
│   │   │   │   ├── ApprovalHeader.js       # Header panel & tombol sync DB
│   │   │   │   ├── PaymentProofModal.js    # Lightbox preview bukti bayar
│   │   │   │   ├── RentalApprovalCard.js   # Kartu transaksi sewa peminjam
│   │   │   │   ├── RentalCardActions.js    # Tombol aksi status bertingkat
│   │   │   │   └── RentalCardAuditTrail.js # Linimasa audit jejak status
│   │   │   └── page.js                 # Orkestrator halaman approval
│   │   ├── dashboard/page.js           # Statistik ringkasan toko & metrik
│   │   ├── history/page.js             # Riwayat arsip sewa selesai
│   │   ├── katalog/                    # Manajemen katalog inventaris alat
│   │   │   ├── components/
│   │   │   │   ├── GearFilterHeader.js     # Filter kategori & search bar
│   │   │   │   ├── GearFormModal.js        # Formulir modal tambah/ubah alat
│   │   │   │   ├── GearImageField.js       # Uploader gambar lokal & URL
│   │   │   │   └── GearTable.js            # Tabel alat, stok & aksi
│   │   │   ├── constants/
│   │   │   │   └── catalogConstants.js     # Enum status stok & kategori default
│   │   │   ├── hooks/
│   │   │   │   └── useAdminCatalog.js      # Custom hook state & sinkronisasi
│   │   │   ├── utils/
│   │   │   │   └── catalogMutations.js     # Mutasi data ke backend & store
│   │   │   └── page.js                 # Orkestrator halaman admin katalog
│   │   ├── packages/                   # Manajemen paket bundling rombongan
│   │   │   ├── components/
│   │   │   │   ├── CreatePackageForm.js    # Form buat paket bundling baru
│   │   │   │   └── PackageCardItem.js      # Kartu paket & kelola komposisi alat
│   │   │   └── page.js                 # Orkestrator paket bundling
│   │   ├── pendapatan/page.js          # Rekap penghasilan & metrik omset
│   │   └── reports/page.js             # Laporan operasional & inventaris
│   ├── api/                            # Internal Next.js Route Handlers
│   │   ├── categories/route.js & [id]/ # REST proxy kategori
│   │   ├── gear/route.js & [id]/       # REST proxy inventaris alat
│   │   ├── packages/route.js & [id]/   # REST proxy paket bundling
│   │   ├── package_items/route.js & [id]/ # REST proxy item dalam paket
│   │   ├── rentals/route.js & [id]/    # REST proxy transaksi rental
│   │   ├── rental_items/route.js & [id]/ # REST proxy rincian item rental
│   │   ├── rental_status_logs/route.js & [id]/ # REST proxy log audit
│   │   └── wishlist/route.js & [id]/   # REST proxy wishlist peminjam
│   ├── api-test/                       # Test Bench Pengujian Interaktif API
│   │   ├── components/
│   │   │   └── EndpointSection.js      # Kartu modul endpoint interaktif
│   │   ├── constants/
│   │   │   └── endpointDefinitions.js  # Definisi 9 grup endpoint API
│   │   ├── utils/
│   │   │   └── apiTestPayloads.js      # Generator payload uji coba
│   │   └── page.js                     # Orkestrator test bench API
│   ├── user/                           # Halaman Khusus Peminjam / Pelanggan
│   │   ├── checkout/                   # Alur pengajuan peminjaman alat
│   │   │   ├── components/
│   │   │   │   ├── CheckoutOrderSummary.js # Rincian kalkulasi tagihan
│   │   │   │   ├── CheckoutSuccessModal.js # Popup konfirmasi sukses order
│   │   │   │   ├── CustomerInfoFields.js   # Input tanggal, nama, & WhatsApp
│   │   │   │   └── KtpUploader.js          # Dropzone foto identitas KTP
│   │   │   ├── hooks/
│   │   │   │   ├── useCheckoutForm.js      # Hook orchestrator checkout
│   │   │   │   ├── useCheckoutInputHandlers.js # Hook sanitasi & event handler
│   │   │   │   └── useCheckoutItems.js     # Hook kalkulasi item & durasi
│   │   │   ├── utils/
│   │   │   │   └── checkoutSubmission.js   # Validasi & submit order rental
│   │   │   └── page.js                 # Orkestrator halaman checkout
│   │   ├── kalkulator/                 # Simulasi hitung biaya sewa mandiri
│   │   │   ├── components/
│   │   │   │   ├── CalculatorCostSummary.js# Rincian biaya, cetak PDF, salin
│   │   │   │   └── CalculatorDateInputs.js # Form tanggal mulai & selesai
│   │   │   └── page.js                 # Orkestrator kalkulator biaya
│   │   ├── katalog/page.js             # Katalog alat khusus peminjam
│   │   ├── payment/                    # Konfirmasi & pembayaran simulasi
│   │   │   └── page.js                 # Orkestrator halaman pembayaran
│   │   ├── profil/page.js              # Biodata peminjam & nomor darurat
│   │   ├── rekomendasi/                # Paket rombongan & wizard perlengkapan
│   │   │   ├── components/
│   │   │   │   ├── CustomCalculatorView.js # Kalkulator perlengkapan cerdas
│   │   │   │   └── OfficialPackagesView.js # Kartu paket hemat dari database
│   │   │   └── page.js                 # Orkestrator rekomendasi
│   │   ├── riwayat/page.js             # Tracking status rental peminjam
│   │   └── wishlist/page.js            # Daftar favorit alat yang disimpan
│   ├── katalog/page.js                 # Katalog alat publik (Guest mode)
│   ├── login/page.js                   # Formulir login admin & peminjam
│   ├── register/                       # Formulir registrasi akun baru
│   │   ├── components/
│   │   │   └── RegisterFields.js       # Input form nama, email, password
│   │   ├── utils/
│   │   │   └── registerValidation.js   # Validasi regex form & helper icon
│   │   └── page.js                     # Orkestrator halaman registrasi
│   ├── layout.js                       # Root Layout Next.js (Font & Body)
│   └── page.js                         # Beranda Utama (Landing Page)
├── components/                         # Komponen Reusable Lintas Modul
│   ├── catalog/                        # Komponen Katalog Pengguna
│   │   ├── GearCard.js                 # Kartu alat individual dengan stok
│   │   ├── GearDetailModal.js          # Modal pratinjau spesifikasi alat
│   │   └── GearFilterBar.js            # Filter kategori & pencarian alat
│   ├── features/payment/               # Komponen Fitur Pembayaran
│   │   ├── BillingSummary.js           # Rincian tagihan sewa
│   │   ├── BrivaView.js                # Tampilan instruksi BRI Virtual Account
│   │   ├── PaymentHeader.js            # Header pembayaran & disclaimer demo
│   │   ├── PaymentMethodSection.js     # Kontainer tab metode & bukti bayar
│   │   ├── PaymentMethodTabs.js        # Tab pemilih QRIS vs BRIVA
│   │   ├── PaymentSuccessView.js       # Tampilan sukses upload bukti bayar
│   │   ├── ProofUploader.js            # Dropzone berkas bukti transfer
│   │   ├── QrisView.js                 # Tampilan visual QR Code dinamis
│   │   └── index.js                    # Barrel export fitur payment
│   └── shared/                         # Komponen Global Aplikasi
│       ├── CatalogView.js              # Wrapper katalog publik & peminjam
│       ├── NavBar.js                   # Navigation bar atas responsif
│       ├── RequireAuth.js              # Route guard otentikasi di browser
│       └── nav/
│           ├── NavBrand.js             # Logo, icon navigasi, array menu rute
│           └── NavDrawer.js            # Drawer menu samping slide-over
├── constants/                          # Definisi Konstanta Terpusat
│   ├── categories.js                   # Daftar kategori peralatan fallback
│   ├── gearStock.js                    # Label & warna indikator stok
│   └── rentalStatus.js                 # Warna badge status sewa peminjaman
├── lib/                                # Core Utilities, Logic & Stores
│   ├── adapters/
│   │   └── rentalAdapter.js            # Normalisasi data API UNRAM ➔ Model UI
│   ├── domain/
│   │   └── rekomendasi.js              # Algoritma penentuan gear per rombongan
│   ├── stores/
│   │   ├── catalogStore.js             # Store reaktif katalog alat (v3)
│   │   ├── rentalsStore.js             # Store reaktif transaksi rental (v3)
│   │   └── wishlistStore.js            # Store reaktif daftar impian alat
│   └── utils/
│       ├── formValidations.js          # Validasi nama, WA, KTP, dan tanggal
│       ├── gearImage.js                # Normalisasi URL gambar remote vs lokal
│       ├── hitungBiaya.js              # Hitung hari, biaya sewa, format rupiah
│       └── imageCompressor.js          # Kompresi file gambar via Canvas
├── public/uploads/                     # Direktori penyimpanan media fisik lokal
├── services/gateway/
│   └── client.js                       # Klien HTTP Gateway HMIF UNRAM
├── .env.local                          # Environment Variables konfigurasi API
└── package.json                        # Definisi dependensi & skrip Next.js
```

---

## 🔍 3. Rincian Fungsi Setiap Berkas & Hubungan Antar-Modul

### A. Modul Otentikasi & Navigasi

| Berkas | Lokasi | Fungsi & Tanggung Jawab | Menyambung Ke (*Connections*) |
| :--- | :--- | :--- | :--- |
| **`login/page.js`** | `app/login/page.js` | Formulir login akun peminjam/admin. Memvalidasi format email & sandi. | ➔ Memanggil `loginAction` di `app/actions/auth.js`<br>➔ Mengarahkan rute sesuai role (`/admin/dashboard` atau `/user/katalog`) |
| **`register/page.js`** | `app/register/page.js` | Orkestrator pendaftaran akun baru NEXORA dengan auto-login. | ➔ Mengimpor `RegisterFields` & `registerValidation`<br>➔ Memanggil `registerAction` di `app/actions/auth.js` |
| **`RegisterFields.js`** | `app/register/components/` | Komponen input nama, email, kata sandi, dan konfirmasi sandi dengan tombol intip mata (*show/hide*). | ➔ Dipanggil oleh `app/register/page.js` |
| **`registerValidation.js`** | `app/register/utils/` | Fungsi validasi regex email, panjang minimal nama/sandi, dan komponen Spinner loading. | ➔ Digunakan oleh `RegisterFields.js` & `register/page.js` |
| **`NavBar.js`** | `components/shared/` | Topbar sticky navigasi utama. Menampilkan tombol Kembali (*browser back*), logo brand, indikator role, dan tombol logout. | ➔ Mengimpor `NavBrand` dan `NavDrawer`<br>➔ Memanggil `logoutAction` dari `app/actions/auth.js`<br>➔ Mendengarkan event window `role-changed` |
| **`NavBrand.js`** | `components/shared/nav/` | Menyediakan logo HIKERENT gunung, icon panah kembali, serta array rute navigasi untuk Guest, User, dan Admin. | ➔ Dipanggil oleh `NavBar.js` dan `NavDrawer.js` |
| **`NavDrawer.js`** | `components/shared/nav/` | Menu samping slide-over yang muncul saat tombol Menu diklik, lengkap dengan status login dan daftar navigasi rute aktif. | ➔ Dipanggil oleh `NavBar.js` |
| **`RequireAuth.js`** | `components/shared/` | Komponen pelindung (*route guard*) di sisi klien yang memastikan pengguna telah terautentikasi sebelum melihat halaman privat. | ➔ Memeriksa `localStorage.getItem("role")` |

---

### B. Modul Checkout Peminjam (`app/user/checkout/`)

| Berkas | Lokasi | Fungsi & Tanggung Jawab | Menyambung Ke (*Connections*) |
| :--- | :--- | :--- | :--- |
| **`page.js`** | `app/user/checkout/page.js` | Orkestrator halaman checkout. Mengkoordinasikan form identitas, upload KTP, dan ringkasan order. | ➔ Menggunakan hook `useCheckoutForm`<br>➔ Merender subkomponen form checkout |
| **`useCheckoutForm.js`** | `app/user/checkout/hooks/` | Custom hook pengelola state utama form checkout (nama, WA, tanggal, KTP, error, loading). | ➔ Mengimpor `useCheckoutItems`, `useCheckoutInputHandlers`, dan `checkoutSubmission.js` |
| **`useCheckoutItems.js`** | `app/user/checkout/hooks/` | Menghitung daftar alat yang disewa (baik paket rombongan dari `localStorage` maupun sewa satuan dari URL query), durasi malam, dan total tarif sewa. | ➔ Dipanggil oleh `useCheckoutForm.js`<br>➔ Menggunakan `useCatalog` dari `catalogStore.js` |
| **`useCheckoutInputHandlers.js`** | `app/user/checkout/hooks/` | Menangani seluruh event input: sanitasi nomor WA hanya angka, proteksi copy-paste, sinkronisasi tanggal sewa, dan upload KTP. | ➔ Dipanggil oleh `useCheckoutForm.js`<br>➔ Menggunakan fungsi validasi dari `lib/utils/formValidations.js` |
| **`checkoutSubmission.js`** | `app/user/checkout/utils/` | Memvalidasi seluruh kolom dan mengirimkan transaksi sewa ke server via `createRentalAction`, kemudian mendaftarkannya ke `rentalsStore.js`. | ➔ Memanggil `createRentalAction` dari `app/actions/rentals.js`<br>➔ Memanggil `addRental` dari `lib/stores/rentalsStore.js` |
| **`CustomerInfoFields.js`** | `app/user/checkout/components/` | Form visual input tanggal sewa mulai & selesai, nama peminjam, dan nomor WhatsApp. | ➔ Dipanggil oleh `app/user/checkout/page.js` |
| **`KtpUploader.js`** | `app/user/checkout/components/` | Dropzone berkas foto KTP asli dengan pratinjau thumbnail instan. | ➔ Dipanggil oleh `app/user/checkout/page.js` |
| **`CheckoutOrderSummary.js`** | `app/user/checkout/components/` | Rincian tabel item yang disewa, durasi sewa, total nominal, dan tombol ajukan sewa. | ➔ Dipanggil oleh `app/user/checkout/page.js` |
| **`CheckoutSuccessModal.js`** | `app/user/checkout/components/` | Popup konfirmasi sukses sewa dengan tombol navigasi menuju halaman pembayaran atau riwayat. | ➔ Menautkan navigasi ke `/user/payment` dan `/user/riwayat` |

---

### C. Modul Pembayaran Sewa (`app/user/payment/` & `components/features/payment/`)

| Berkas | Lokasi | Fungsi & Tanggung Jawab | Menyambung Ke (*Connections*) |
| :--- | :--- | :--- | :--- |
| **`page.js`** | `app/user/payment/page.js` | Orkestrator transaksi pembayaran sewa. Mengambil pesanan yang disetujui, mengelola unggah bukti bayar, dan mengupdate status ke backend. | ➔ Mengimpor `BillingSummary`, `PaymentHeader`, `PaymentMethodSection`, `PaymentSuccessView`<br>➔ Memanggil `updateRentalAction` dan `createRentalStatusLogAction` |
| **`PaymentHeader.js`** | `components/features/payment/` | Banner atas informasi alur pembayaran dan kartu *disclaimer* demo simulasi visual. | ➔ Dipanggil oleh `app/user/payment/page.js` |
| **`PaymentMethodSection.js`** | `components/features/payment/` | Kontainer pilihan metode transfer (QRIS vs BRIVA) dan dropzone formulir bukti bayar. | ➔ Menggabungkan `PaymentMethodTabs`, `QrisView`, `BrivaView`, `ProofUploader` |
| **`PaymentMethodTabs.js`** | `components/features/payment/` | Tab pemilih interaktif antara metode QRIS dan Virtual Account BRIVA. | ➔ Dipanggil oleh `PaymentMethodSection.js` |
| **`QrisView.js`** | `components/features/payment/` | Tampilan visual QR Code Standar Pembayaran Nasional dengan badge nominal dinamis. | ➔ Dipanggil oleh `PaymentMethodSection.js` |
| **`BrivaView.js`** | `components/features/payment/` | Nomor Virtual Account BRI yang di-generate dari ID transaksi beserta tombol *Salin Nomor VA*. | ➔ Dipanggil oleh `PaymentMethodSection.js` |
| **`ProofUploader.js`** | `components/features/payment/` | Dropzone unggah screenshot bukti transfer dan input catatan opsional peminjam. | ➔ Menggunakan `compressImage` dari `lib/utils/imageCompressor.js` |
| **`BillingSummary.js`** | `components/features/payment/` | Kartu ringkasan tagihan sewa peminjam dan tombol langsung konfirmasi WhatsApp Admin. | ➔ Dipanggil oleh `app/user/payment/page.js` |
| **`PaymentSuccessView.js`** | `components/features/payment/` | Layar konfirmasi saat bukti pembayaran berhasil disimpan dengan link ke Riwayat. | ➔ Dipanggil oleh `app/user/payment/page.js` |

---

### D. Modul Admin Katalog (`app/admin/katalog/`)

| Berkas | Lokasi | Fungsi & Tanggung Jawab | Menyambung Ke (*Connections*) |
| :--- | :--- | :--- | :--- |
| **`page.js`** | `app/admin/katalog/page.js` | Orkestrator panel manajemen alat pendakian. | ➔ Menggunakan hook `useAdminCatalog`<br>➔ Merender `GearFilterHeader`, `GearFormModal`, `GearTable` |
| **`useAdminCatalog.js`** | `app/admin/katalog/hooks/` | Custom hook penyedia state form, sinkronisasi katalog backend, dan penanganan unggah gambar lokal. | ➔ Mengimpor `catalogConstants.js` dan `catalogMutations.js`<br>➔ Memanggil `uploadGearImageAction` |
| **`catalogConstants.js`** | `app/admin/katalog/constants/` | Menyimpan opsi status stok enum (`hijau`, `kuning`, `merah`), kategori fallback, dan state form kosong. | ➔ Digunakan oleh `useAdminCatalog.js` dan subkomponen katalog |
| **`catalogMutations.js`** | `app/admin/katalog/utils/` | Fungsi eksekusi mutasi CRUD alat ke basis data backend HMIF UNRAM (`createGearAction`, `updateGearAction`, `deleteGearAction`) sekaligus update cache store lokal. | ➔ Memanggil server actions di `app/actions/gear.js`<br>➔ Memanggil `addCatalogItem`, `updateCatalogItem`, `deleteCatalogItem` di `catalogStore.js` |
| **`GearFilterHeader.js`** | `app/admin/katalog/components/` | Header panel, tombol sinkronkan DB langsung, filter chip kategori, dan pencarian alat. | ➔ Dipanggil oleh `app/admin/katalog/page.js` |
| **`GearFormModal.js`** | `app/admin/katalog/components/` | Form modal tambah/edit alat (nama, slug, harga, kategori, stok fisik, ketersediaan, deskripsi). | ➔ Mengimpor `GearImageField.js` |
| **`GearImageField.js`** | `app/admin/katalog/components/` | Dropzone unggah file foto dari komputer (`public/uploads/`) dan input URL gambar langsung. | ➔ Dipanggil oleh `GearFormModal.js`<br>➔ Menggunakan `normalizeGearImage` dari `catalogStore.js` |
| **`GearTable.js`** | `app/admin/katalog/components/` | Tabel inventaris alat dengan foto thumbnail, stok fisik, badge ketersediaan, serta tombol edit dan hapus. | ➔ Dipanggil oleh `app/admin/katalog/page.js` |

---

### E. Modul Admin Approval (`app/admin/approval/`)

| Berkas | Lokasi | Fungsi & Tanggung Jawab | Menyambung Ke (*Connections*) |
| :--- | :--- | :--- | :--- |
| **`page.js`** | `app/admin/approval/page.js` | Orkestrator verifikasi dan persetujuan pengajuan sewa peminjam. | ➔ Mengimpor `ApprovalHeader`, `ApprovalFilterBar`, `RentalApprovalCard`, `PaymentProofModal` |
| **`ApprovalHeader.js`** | `app/admin/approval/components/` | Header panel operasional dan tombol sinkronisasi ulang data rental dari database backend. | ➔ Memanggil `syncRentalsFromBackend()` dari `lib/stores/rentalsStore.js` |
| **`ApprovalFilterBar.js`** | `app/admin/approval/components/` | Filter tab status (*Semua, Menunggu Verifikasi, Disetujui, Diambil, Selesai, Ditolak*) dengan counter jumlah dan kotak pencarian peminjam. | ➔ Dipanggil oleh `app/admin/approval/page.js` |
| **`RentalApprovalCard.js`** | `app/admin/approval/components/` | Kartu transaksi sewa: identitas peminjam, foto thumbnail bukti bayar, rincian alat yang disewa, dan input catatan petugas. | ➔ Mengimpor `RentalCardActions` dan `RentalCardAuditTrail` |
| **`RentalCardActions.js`** | `app/admin/approval/components/` | Tombol transisi status sewa bertingkat (*Setujui/Tolak ➔ Serahkan Alat ➔ Selesai*) dengan proteksi bukti bayar dan tombol chat WhatsApp peminjam. | ➔ Mengirimkan event perubahan status ke handler `handleStatusTransition` |
| **`RentalCardAuditTrail.js`** | `app/admin/approval/components/` | Menampilkan linimasa rekam jejak status (*audit trail*) yang ditarik dari tabel `rental_status_logs`. | ➔ Dipanggil oleh `RentalApprovalCard.js` |
| **`PaymentProofModal.js`** | `app/admin/approval/components/` | Modal lightbox perbesar foto bukti transfer pembayaran yang diunggah peminjam untuk diverifikasi admin. | ➔ Dipanggil oleh `app/admin/approval/page.js` |

---

### F. Modul Admin Packages (`app/admin/packages/`)

| Berkas | Lokasi | Fungsi & Tanggung Jawab | Menyambung Ke (*Connections*) |
| :--- | :--- | :--- | :--- |
| **`page.js`** | `app/admin/packages/page.js` | Orkestrator manajemen paket bundling pendakian rombongan. | ➔ Mengimpor `CreatePackageForm` dan `PackageCardItem`<br>➔ Memanggil `fetchPackagesAction`, `createPackageAction`, `deletePackageAction` |
| **`CreatePackageForm.js`** | `app/admin/packages/components/` | Formulir pembuatan bundel baru: nama paket, target rombongan (misal: "4 Orang"), dan deskripsi. | ➔ Dipanggil oleh `app/admin/packages/page.js` |
| **`PackageCardItem.js`** | `app/admin/packages/components/` | Kartu paket aktif yang menampilkan daftar alat di dalamnya serta formulir untuk menyematkan alat baru ke dalam paket (`package_items`). | ➔ Memanggil `addPackageItemAction` dan `removePackageItemAction` |

---

### G. Modul Kalkulator & Rekomendasi (`app/user/kalkulator/` & `rekomendasi/`)

| Berkas | Lokasi | Fungsi & Tanggung Jawab | Menyambung Ke (*Connections*) |
| :--- | :--- | :--- | :--- |
| **`kalkulator/page.js`** | `app/user/kalkulator/page.js` | Orkestrator kalkulator biaya sewa mandiri berbasis alat, unit, dan rentang tanggal sewa. | ➔ Mengimpor `CalculatorDateInputs` dan `CalculatorCostSummary` |
| **`CalculatorDateInputs.js`** | `app/user/kalkulator/components/` | Input tanggal mulai dan selesai sewa dengan validasi error real-time. | ➔ Dipanggil oleh `app/user/kalkulator/page.js` |
| **`CalculatorCostSummary.js`** | `app/user/kalkulator/components/` | Menghitung breakdown biaya sewa, tombol salin ringkasan ke clipboard, cetak PDF, dan tombol lanjut ke checkout sewa. | ➔ Menggunakan `formatRupiah` dan `hitungBiaya` dari `lib/utils/hitungBiaya.js` |
| **`rekomendasi/page.js`** | `app/user/rekomendasi/page.js` | Tab switcher antara paket promo bundling resmi dan kalkulator cerdas perlengkapan rombongan. | ➔ Mengimpor `OfficialPackagesView` dan `CustomCalculatorView` |
| **`OfficialPackagesView.js`** | `app/user/rekomendasi/components/` | Kartu paket hemat dari database (`packages` & `package_items`) dengan rincian alat dan tombol sewa langsung. | ➔ Menyimpan data paket ke `localStorage` dan redirect ke `/user/checkout?paket=1` |
| **`CustomCalculatorView.js`** | `app/user/rekomendasi/components/` | Algoritma penyusunan rekomendasi perlengkapan berdasarkan jumlah orang, lama hari pendakian, dan cuaca. | ➔ Memanggil `buatRekomendasi` dari `lib/domain/rekomendasi.js` |

---

### H. Modul Pengujian API (`app/api-test/`)

| Berkas | Lokasi | Fungsi & Tanggung Jawab | Menyambung Ke (*Connections*) |
| :--- | :--- | :--- | :--- |
| **`page.js`** | `app/api-test/page.js` | Orkestrator test bench pengujian interaktif ke API Gateway backend HMIF UNRAM. | ➔ Mengimpor `endpointDefinitions`, `apiTestPayloads`, `EndpointSection` |
| **`endpointDefinitions.js`** | `app/api-test/constants/` | Daftar konfigurasi 9 grup endpoint API backend (`auth`, `categories`, `gear`, `rentals`, `rental_items`, `packages`, `package_items`, `wishlist`, `rental_status_logs`). | ➔ Digunakan oleh `app/api-test/page.js` |
| **`apiTestPayloads.js`** | `app/api-test/utils/` | Generator payload uji coba (data dummy request JSON dan header autentikasi) untuk setiap jenis request API. | ➔ Digunakan saat tombol "Uji Endpoint" diklik |
| **`EndpointSection.js`** | `app/api-test/components/` | Kartu tabel pengujian interaktif per grup modul dengan badge HTTP method (`GET`, `POST`, `PUT`, `DELETE`) dan panel JSON viewer response. | ➔ Dipanggil oleh `app/api-test/page.js` |

---

### I. Modul Core, Store, Adapter, & Gateway (`lib/` & `services/`)

| Berkas | Lokasi | Fungsi & Tanggung Jawab | Menyambung Ke (*Connections*) |
| :--- | :--- | :--- | :--- |
| **`client.js`** | `services/gateway/client.js` | Klien HTTP terpusat untuk komunikasi ke REST API backend HMIF UNRAM (`v3`). Mengelola header `X-API-Key`, token `Bearer`, dan method override Apache `X-HTTP-Method-Override`. | ➔ Menghubungkan seluruh Server Actions ke backend UNRAM |
| **`rentalAdapter.js`** | `lib/adapters/rentalAdapter.js` | Normalisasi data mentah backend UNRAM menjadi model UI NEXORA (`normalizeRental`), penyimpanan cache bukti transfer persisten, dan deteksi ID user aktif. | ➔ Digunakan oleh `lib/stores/rentalsStore.js` |
| **`rentalsStore.js`** | `lib/stores/rentalsStore.js` | Store global reaktif transaksi rental peminjam berbasis `useSyncExternalStore`. Mengelola sinkronisasi multi-tab/window. | ➔ Menyambung ke Server Action `app/actions/rentals.js` |
| **`catalogStore.js`** | `lib/stores/catalogStore.js` | Store global reaktif katalog alat pendakian dengan auto-cleanup cache `v2` ke `v3`. | ➔ Menyambung ke Route Handlers `/api/gear` dan `/api/categories` |
| **`wishlistStore.js`** | `lib/stores/wishlistStore.js` | Store global reaktif daftar alat impian peminjam dengan penyimpanan lokal persisten. | ➔ Digunakan oleh `app/user/wishlist/page.js` dan kartu alat `GearCard.js` |
| **`gearImage.js`** | `lib/utils/gearImage.js` | Menangani normalisasi tautan foto: prefixing gambar remote backend HMIF UNRAM vs berkas lokal `public/uploads/` vs Base64. | ➔ Digunakan di seluruh komponen kartu alat, katalog, dan admin table |
| **`hitungBiaya.js`** | `lib/utils/hitungBiaya.js` | Utilitas murni kalkulasi durasi malam/hari, validasi tanggal sewa, dan format mata uang Rupiah (`formatRupiah`). | ➔ Digunakan di seluruh kalkulator, checkout, dan pembayaran |
| **`formValidations.js`**| `lib/utils/formValidations.js`| Validasi ketat nama lengkap KTP, nomor WhatsApp Indonesia (awalan 08/62), foto KTP, dan tanggal sewa. | ➔ Digunakan di checkout dan registrasi |
| **`imageCompressor.js`**| `lib/utils/imageCompressor.js`| Kompresor gambar berbasis HTML5 Canvas di sisi browser sebelum file diunggah. | ➔ Digunakan di form bukti bayar `ProofUploader.js` |

---

## 🔁 4. Aliran Data End-to-End Transaksi Sewa (*End-to-End Data Flow*)

Sebagai gambaran keterhubungan antar-berkas, berikut adalah rekam jejak alur data sebuah transaksi penyewaan alat di NEXORA:

1. **Eksplorasi Alat**:
   - Peminjam membuka `/user/katalog` ➔ dilayani oleh `CatalogView.js`.
   - Data alat diambil secara reaktif melalui `useCatalogSync()` dari `lib/stores/catalogStore.js`.
   - URL foto dinormalisasi melalui `lib/utils/gearImage.js`.
2. **Pengajuan Sewa (Checkout)**:
   - Peminjam memilih alat dan diarahkan ke `/user/checkout?alatId=1`.
   - `useCheckoutForm.js` mengkoordinasikan identitas peminjam dari `CustomerInfoFields.js` dan dropzone KTP dari `KtpUploader.js`.
   - `checkoutSubmission.js` memvalidasi data dan memanggil server action `createRentalAction` di `app/actions/rentals.js`.
   - `createRentalAction` menyimpan data transaksi ke tabel backend `/rentals` dan setiap item ke `/rental_items` via `services/gateway/client.js`.
   - Transaksi dinormalisasi oleh `lib/adapters/rentalAdapter.js` dan disimpan ke `lib/stores/rentalsStore.js`.
3. **Persetujuan Admin (Approval)**:
   - Admin membuka `/admin/approval`.
   - Data pesanan muncul pada `RentalApprovalCard.js` dengan tombol aksi `RentalCardActions.js`.
   - Admin klik **Setujui** ➔ memanggil `updateRentalAction` (status `aktif`) dan mencatat log ke `createRentalStatusLogAction` (`rental_status_logs`).
4. **Pembayaran Peminjam**:
   - Peminjam membuka `/user/payment?rentalId=ORD-123456`.
   - `PaymentMethodSection.js` menampilkan QRIS atau nomor BRIVA.
   - Peminjam mengunggah foto struk transfer via `ProofUploader.js`.
   - Gambar dikompresi oleh `imageCompressor.js`, disimpan di `rentalAdapter.js`, dan metadata JSON disimpan ke kolom `notes` tabel `rentals` backend.
5. **Serah Terima Alat di Basecamp**:
   - Admin memverifikasi bukti bayar via `PaymentProofModal.js`.
   - Admin klik **Konfirmasi Bayar & Serahkan Alat (Diambil)** pada `RentalCardActions.js`.
   - Setelah selesai mendaki, peminjam mengembalikan alat ➔ Admin klik **Alat Dikembalikan (Selesaikan Transaksi)**.
   - Seluruh linimasa status terekam rapi di `RentalCardAuditTrail.js`.

---

## ✨ Fitur Utama

### 1. Autentikasi & Keamanan
- Login & Registrasi User (Authentication & Authorization).
- Proteksi rute berdasarkan peran (User vs Admin/Manajemen).

### 2. Katalog Alat & Manajemen Inventaris
- **Manajemen Alat:** Tambah, Edit, dan Hapus data peralatan pendakian.
- **Cek Ketersediaan Real-Time:** Pengecekan stok berdasarkan rentang tanggal dengan indikator visual level ketersediaan (Merah / Kuning / Hijau).

### 3. Sistem Peminjaman & Kalkulator Biaya
- Pengajuan peminjaman interaktif dengan verifikasi dokumen (KTP) & persetujuan syarat ketentuan.
- **Kalkulator Biaya Sewa Otomatis:** Menghitung durasi peminjaman dan total tarif secara presisi.
- Wishlist / Keranjang peminjaman alat.

### 4. Status & Riwayat Peminjaman
- Daftar peminjaman aktif dan pemantauan status transparan.
- Riwayat transaksi peminjaman lengkap untuk peminjam.

### 5. Panel Approval Manajemen
- Verifikasi pengajuan dan kontrol persetujuan (*Approval / Rejection*) peminjaman oleh Admin/Manajemen.

### 6. Fitur Tambahan (Smart Recommendation)
- Rekomendasi peralatan pintar berbasis jumlah personel rombongan dan durasi trip pendakian.

---

## 🛠️ Tech Stack

| Komponen | Teknologi / Library |
| :--- | :--- |
| **Frontend** | React.js / Next.js (App Router), Tailwind CSS |
| **Backend** | Node.js (Express.js) / REST API Service |
| **Database** | MySQL / PostgreSQL / MongoDB |
| **Autentikasi** | JSON Web Token (JWT) / Session-based Auth |
| **Integrasi Pihak Ketiga** | WhatsApp Click-to-Chat API Generator |

---

## 👥 Struktur Peran (Role)

| Role | Akses & Hak Akses |
| :--- | :--- |
| **User (Peminjam)** | Registrasi/login, eksplorasi katalog, cek ketersediaan alat, ajukan peminjaman, kelola wishlist, komunikasi via WhatsApp, dan pantau riwayat peminjaman. |
| **Admin / Manajemen** | Kelola katalog & stok alat (CRUD), proses persetujuan/penolakan (*approval/rejection*) pengajuan, dan manajemen data peminjaman keseluruhan. |

---

## 👨‍💻 Anggota Kelompok

| No | Nama Anggota | NIM / Detail | Peran / Tanggung Jawab |
| :-: | :--- | :--- | :--- |
| 1 | **Musfiqoh Rizkia Aulia** | `F1D02410083` | Fullstack Developer |
| 2 | **Ni Putu Ayu Dian Sulastri** | `F1D02510021` | Fullstack Developer |
| 3 | **Meisya Ananda Puteri** | `F1D02410072` | UI/UX & Frontend Developer |
| 4 | **Ni Wayan Eka Aprilianti** | `F1D02410021` | Backend & Database Specialist |

