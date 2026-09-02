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

