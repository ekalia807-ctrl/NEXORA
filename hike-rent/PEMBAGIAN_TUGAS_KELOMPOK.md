# 📋 Pembagian Tugas Kelompok Pengembang — NEXORA (HikeRent)

Dokumen ini berisi panduan pembagian tugas untuk **4 anggota kelompok** dalam menyempurnakan aplikasi sewa alat pendakian **NEXORA**. Pembagian ini dirancang berbasis fitur (*feature-based*) agar beban kerja seimbang, fokus jelas, dan **tidak terjadi konflik kode (*merge conflict*) di Git**.

---

## 📊 Ringkasan Matriks Pembagian Tugas

| Anggota | Peran / Domain | Wilayah File / Folder | Tingkat Beban | Risiko Konflik Git |
| :--- | :--- | :--- | :--- | :--- |
| **Anggota 1** | *Public Experience & Auth Lead* | `app/page.js`, `app/components/shared/*`, `login`, `register` | Sedang | 🟢 Sangat Rendah |
| **Anggota 2** | *Catalog & Estimation Specialist* | `app/user/katalog`, `app/user/kalkulator`, `app/user/rekomendasi`, `lib/catalogStore.js` | Sedang - Berat | 🟢 Sangat Rendah |
| **Anggota 3** | *Borrower Journey & Lifecycle* | `app/user/checkout`, `app/user/dashboard`, `app/user/riwayat`, `app/user/dashboard/profil` | Sedang - Berat | 🟢 Sangat Rendah |
| **Anggota 4** | *Admin Operations Lead* | Seluruh folder `app/admin/*` dan `lib/admin/*` | Sedang - Berat | 🟢 Sangat Rendah |

---

## 🧑‍💻 Rincian Tugas Per Anggota

### 👤 Anggota 1: Public Experience, Auth & Global Layout Lead
> **Fokus**: Tampilan halaman depan (*landing page*), alur autentikasi (Masuk & Daftar), serta estetika antarmuka umum.

* **Folder & File yang Dikelola**:
  - `app/page.js` *(Landing Page)*
  - `app/components/shared/Hero.js`, `Features.js`, `HowltWorks.js`, `CTA.js`, `Footer.js`
  - `app/components/shared/NavBar.js` *(Header & Menu Samping)*
  - `app/login/page.js` & `app/register/page.js`
  - `app/not-found.js` & `app/globals.css`
* **Target Penyempurnaan**:
  - [ ] **Validasi Form Login/Register**: Tambahkan validasi format email, konfirmasi kata sandi (*confirm password*), serta tombol lihat/sembunyikan sandi (*show/hide password*).
  - [ ] **Animasi & Interaksi Landing Page**: Berikan efek transisi/animasi saat scroll, buat accordion interaktif untuk Tanya Jawab (FAQ), atau tambahkan bagian ulasan (*testimoni*) pengguna.
  - [ ] **Notifikasi Toast**: Buat komponen feedback visual (*toast alert*) saat pengguna berhasil masuk atau keluar akun.

---

### 👤 Anggota 2: Catalog & Interactive Estimation Specialist
> **Fokus**: Menangani inventaris yang ditampilkan ke publik, kalkulator estimasi tarif sewa otomatis, dan rekomendasi perlengkapan rombongan.

* **Folder & File yang Dikelola**:
  - `app/user/katalog/page.js` & `app/katalog/page.js`
  - `app/user/kalkulator/page.js`
  - `app/user/rekomendasi/page.js`
  - `lib/catalogStore.js` & `lib/gear.js` *(Mock Store Katalog)*
* **Target Penyempurnaan**:
  - [ ] **Fitur Pencarian & Urutan Katalog**: Tambahkan input pencarian nama alat (*search bar*) dan fitur pengurutan (*sort by*: harga terendah, harga tertinggi, stok tersedia).
  - [ ] **Penyempurnaan Kalkulator Biaya**: Tambahkan validasi tanggal sewa (tanggal kembali wajib setelah tanggal ambil) dan ringkasan rincian biaya yang bisa disalin/dicetak.
  - [ ] **Algoritma Rekomendasi Pendakian**: Berikan opsi filter berdasarkan karakteristik trip (misal: "Trip Santai", "Musim Hujan", atau "Gunung Ekstrem") yang memengaruhi daftar perlengkapan yang disarankan. Tambahkan tombol aksi *"Sewa Paket Ini"* yang langsung membawa daftar alat ke kalkulator/checkout.

---

### 👤 Anggota 3: Borrower Journey & Rental Lifecycle Engineer
> **Fokus**: Alur transaksi peminjam dari pengajuan sewa, verifikasi identitas, ringkasan dashboard, hingga pemantauan status alat.

* **Folder & File yang Dikelola**:
  - `app/user/checkout/page.js` *(Formulir Pengajuan Sewa)*
  - `app/user/dashboard/page.js` *(Dashboard Peminjam)*
  - `app/user/dashboard/profil/page.js` *(Profil Pengguna)*
  - `app/user/riwayat/page.js` *(Riwayat Transaksi & Stepper Status)*
* **Target Penyempurnaan**:
  - [ ] **Upload Identitas Interaktif**: Tambahkan fitur pratinjau gambar (*image preview thumbnail*) saat peminjam mengunggah foto KTP pada halaman checkout.
  - [ ] **Detail Modal Riwayat**: Buat modal popup ketika kartu riwayat diklik untuk melihat rincian bukti sewa (nomor referensi, tanggal sewa, biaya, dan kontak darurat penyedia).
  - [ ] **Integrasi Data Profil**: Simpan data diri profil di `localStorage` dan isi form checkout secara otomatis (*auto-fill*) agar peminjam tidak perlu mengisi ulang nama dan nomor WhatsApp setiap kali menyewa.

---

### 👤 Anggota 4: Admin Operations & Management System Lead
> **Fokus**: Sistem backoffice pengelola, persetujuan berkas KTP peminjam, pengelolaan inventaris alat, serta laporan keuangan.

* **Folder & File yang Dikelola**:
  - `app/admin/dashboard/page.js` *(Statistik Utama Operasional)*
  - `app/admin/katalog/page.js` *(CRUD Kelola Alat: Tambah, Ubah, Hapus)*
  - `app/admin/approval/page.js` *(Persetujuan / Penolakan Pengajuan Sewa Masuk)*
  - `app/admin/pendapatan/page.js` *(Rekapitulasi Keuangan)*
  - `app/admin/accounts/page.js` *(Manajemen Pengguna Terdaftar)*
  - `app/admin/reports/page.js` & `app/admin/history/page.js`
  - `lib/admin/*` *(Data Transaksi & Akun Mock Admin)*
* **Target Penyempurnaan**:
  - [ ] **Approval Interaktif**: Tambahkan dialog konfirmasi saat admin menekan tombol "Setujui" atau "Tolak" (disertai input alasan penolakan jika berkas KTP buram).
  - [ ] **Filter & Validasi CRUD Katalog**: Tambahkan konfirmasi dialog sebelum menghapus item alat, validasi input nominal angka pada harga, dan filter alat berdasarkan status stok.
  - [ ] **Visualisasi & Ekspor Laporan**: Tampilkan kartu ringkasan omset bulanan dan tombol simulasi *"Download Laporan (PDF / CSV)"*.

---

## 🛠️ Panduan Alur Kerja Tim (Git Workflow)

Agar pekerjaan tidak tumpang tindih dan riwayat commit tetap rapi:

1. **Gunakan Branch Masing-Masing**:
   - Anggota 1: `git checkout -b feature/public-and-auth`
   - Anggota 2: `git checkout -b feature/katalog-and-kalkulator`
   - Anggota 3: `git checkout -b feature/checkout-and-riwayat`
   - Anggota 4: `git checkout -b feature/admin-operations`

2. **Sinkronisasi Data Simulasi**:
   - Data katalog publik (`Anggota 2`) dan katalog admin (`Anggota 4`) sudah tersinkronisasi lewat external store di `lib/catalogStore.js`.
   - Jika Anggota 3 menambahkan data checkout baru, koordinasikan dengan Anggota 4 menggunakan key `localStorage` yang sama agar pengajuan baru otomatis tampil di halaman *Approval Admin*.

3. **Sebelum Melakukan Pull Request / Merge ke Main**:
   - Jalankan `npm run build` di terminal masing-masing untuk memastikan tidak ada error sintaks atau rute rusak.
