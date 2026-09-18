# 🔒 Laporan Teknis & Spesifikasi Modul: Autentikasi & Akses Key
**Project:** NEXORA (HikeRent) • **Backend Gateway:** HMIF UNRAM API Gateway v2 • **Versi:** 1.0 (September 2026)  
**Dokumentasi Acuan:** Rencana Integrasi Sistem NEXORA & Arsitektur Backend API

---

## 1. Ringkasan Modul

Modul **Autentikasi & Akses Key** (`/hikerent/auth`) merupakan gerbang utama kendali hak akses dan identitas pengguna dalam ekosistem NEXORA / HikeRent. Modul ini bertanggung jawab atas registrasi peminjam baru, penerbitan token sesi JSON Web Token (JWT), manajemen masa aktif sesi pengguna, pembatalan sesi (*logout*), serta distribusi kunci akses proyek (*Project Scope API Key*).

### Ringkasan Endpoint

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔒 Autentikasi & Akses Key   [ /hikerent/auth ]                                        │
├────────┬───────────────────┬───────────────────────────────────────────────────────────┤
│ [POST] │ /hikerent/login   │ Autentikasi akun dan login untuk project HikeRent.        │
│        │                   │ Mengembalikan token Bearer sesi serta API Key unik        │
│        │                   │ kelompok.                                                 │
├────────┼───────────────────┼───────────────────────────────────────────────────────────┤
│ [POST] │ /hikerent/register│ Mendaftarkan akun baru untuk project HikeRent (publik,     │
│        │                   │ tanpa API key). Field nama bebas pakai nama / name /      │
│        │                   │ nama_lengkap. Setelah register, login untuk mendapatkan   │
│        │                   │ token & API Key.                                          │
├────────┼───────────────────┼───────────────────────────────────────────────────────────┤
│ [POST] │ /hikerent/logout  │ Mengakhiri sesi autentikasi dan membatalkan token untuk   │
│        │                   │ project HikeRent.                                         │
├────────┼───────────────────┼───────────────────────────────────────────────────────────┤
│ [GET]  │ /hikerent/me      │ Memeriksa validitas sesi JWT login dan mengambil profil   │
│        │                   │ user aktif yang sedang login. Memerlukan header           │
│        │                   │ Authorization: Bearer <token>.                            │
├────────┼───────────────────┼───────────────────────────────────────────────────────────┤
│ [GET]  │ /hikerent/key     │ Mengambil Akses Key (API Key) unik dari database khusus   │
│        │                   │ untuk project HikeRent.                                   │
└────────┴───────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 2. Arsitektur Keamanan Dua Lapis (Two-Layer Security)

Untuk menjamin pemisahan data antar kelompok praktikum serta melindungi privasi transaksi peminjam, sistem menerapkan arsitektur keamanan dua lapis:

| Lapisan (Layer) | Mekanisme & Header | Fungsi & Peruntukan dalam Sistem |
| :--- | :--- | :--- |
| **Layer 1: Project Scope** | `X-API-Key: pk_hikerent_...` | Mengunci akses *request* khusus ke partisi database kelompok HikeRent pada API Gateway kampus HMIF UNRAM. Mencegah kebocoran data antar kelompok. |
| **Layer 2: User Session** | `Authorization: Bearer <JWT>` | Token sesi aktif yang diterbitkan saat login. Wajib disertakan untuk semua aksi terproteksi (*checkout*, profil peminjam, riwayat sewa, approval admin). |
| **Penyimpanan Sesi** | `HTTP-Only Cookie + LocalStorage Role` | Token JWT disimpan dalam *secure cookie* `HttpOnly` untuk menangkal serangan XSS (Cross-Site Scripting), sedangkan penanda peran (`role: 'user' \| 'admin'`) disinkronkan ke `localStorage` untuk reaktivitas antarmuka (Navbar & menu dinamis). |

---

## 3. Spesifikasi Rinci 5 Endpoint

### 3.1. `POST /hikerent/login`
Autentikasi akun dan login untuk project HikeRent. Mengembalikan token Bearer sesi serta API Key unik kelompok.

- **URL:** `https://hmif.if.unram.ac.id/api/v2/hikerent/login`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Request Body Payload:**
  ```json
  {
    "email": "nama@email.com",
    "password": "password123"
  }
  ```
- **Response Sukses (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "message": "Login berhasil untuk project HIKERENT.",
    "project": "hikerent",
    "api_key": "pk_hikerent_da4b2b680ab481f4",
    "token_type": "Bearer",
    "token": "eyJzdWIiOjEwLCJuYW1lIjoiVGVzdCBQZW1pbmphbSIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc4OTcwODUyNywiZXhwIjoxNzkwMzEzMzI3fQ...",
    "expires_in": 604800,
    "user": {
      "id": 10,
      "name": "Test Peminjam",
      "email": "test@example.com",
      "role": "user"
    }
  }
  ```
- **Response Gagal (HTTP 400 / 401):**
  ```json
  {
    "error": "Unauthorized",
    "message": "Kredensial tidak valid atau kata sandi salah."
  }
  ```

---

### 3.2. `POST /hikerent/register`
Mendaftarkan akun baru untuk project HikeRent (publik, tanpa API key). Field nama fleksibel menerima `nama`, `name`, atau `nama_lengkap`. Setelah register berhasil, pengguna melakukan login untuk mendapatkan token & API Key.

- **URL:** `https://hmif.if.unram.ac.id/api/v2/hikerent/register`
- **Method:** `POST`
- **Autentikasi:** Terbuka / Publik (tidak memerlukan API Key / Bearer Token)
- **Headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Request Body Payload:**
  ```json
  {
    "name": "Rian Anggara",
    "email": "rian@email.com",
    "password": "password123"
  }
  ```
  *(Catatan: Mendukung kunci `name`, `nama`, atau `nama_lengkap`)*
- **Response Sukses (HTTP 201 Created):**
  ```json
  {
    "success": true,
    "message": "Registrasi berhasil untuk project HIKERENT. Silakan login via POST /hikerent/login untuk mendapatkan token dan API key.",
    "project": "hikerent",
    "user": {
      "id": "11",
      "name": "Rian Anggara",
      "email": "rian@email.com",
      "role": "user"
    }
  }
  ```
- **Response Gagal (HTTP 400 Bad Request):**
  ```json
  {
    "error": "Bad Request",
    "message": "Email/Username dan Password wajib diisi."
  }
  ```

---

### 3.3. `POST /hikerent/logout`
Mengakhiri sesi autentikasi dan membatalkan token untuk project HikeRent di tingkat server gateway.

- **URL:** `https://hmif.if.unram.ac.id/api/v2/hikerent/logout`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (Layer 2)
  - `X-API-Key: pk_hikerent_...` (Layer 1)
- **Response Sukses (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "message": "Logout berhasil untuk project HIKERENT. Sesi dan token telah diakhiri.",
    "project": "hikerent",
    "timestamp": 1789708551
  }
  ```

---

### 3.4. `GET /hikerent/me`
Memeriksa validitas sesi JWT login dan mengambil profil user aktif yang sedang login.

- **URL:** `https://hmif.if.unram.ac.id/api/v2/hikerent/me`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <token>` *(Wajib - Layer 2)*
  - `X-API-Key: pk_hikerent_...` *(Layer 1)*
- **Response Sukses (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "message": "Sesi autentikasi valid.",
    "session": {
      "user_id": 10,
      "name": "Test Peminjam",
      "email": "test@example.com",
      "project": "hikerent",
      "role": "user",
      "expires_at": "2026-09-25T05:15:27+00:00"
    }
  }
  ```
- **Response Gagal (HTTP 401 Unauthorized):**
  ```json
  {
    "error": "Unauthorized",
    "message": "Token tidak valid atau telah kedaluwarsa."
  }
  ```

---

### 3.5. `GET /hikerent/key`
Mengambil Akses Key (API Key) unik dari database khusus untuk project HikeRent. Endpoint ini dilindungi dan mewajibkan otentikasi Bearer token.

- **URL:** `https://hmif.if.unram.ac.id/api/v2/hikerent/key`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <token>` *(Wajib - Sesi aktif)*
- **Response Sukses (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "project": "hikerent",
    "api_key": "pk_hikerent_da4b2b680ab481f4"
  }
  ```
- **Response Gagal jika tanpa token (HTTP 401 Unauthorized):**
  ```json
  {
    "error": "Unauthorized",
    "message": "Akses ditolak: API Key bersifat rahasia. Silakan login terlebih dahulu via POST /api/v1/hikerent/login untuk mendapatkan API Key kelompok ini.",
    "project": "hikerent"
  }
  ```

---

## 4. Matriks Integrasi Frontend NEXORA (Zero UI/UX Regression)

| Komponen Frontend | File Path | Endpoint Terkait | Mekanisme Integrasi & UX |
| :--- | :--- | :--- | :--- |
| **Form Masuk** | `app/login/page.js` | `POST /login` | Submit form diproses secara asynchronous, menampilkan indikator spinner, menampilkan alert error merah jika kredensial salah, dan menyimpan token HttpOnly cookie. |
| **Form Daftar** | `app/register/page.js` | `POST /register`<br>`POST /login` | Validasi realtime (nama, email, min 6 char kata sandi, konfirmasi sandi), toggle mata intip, notifikasi toast sukses, dan otomatis meneruskan ke sesi login. |
| **Pusat Pengujian API** | `app/api-test/page.js` | Semua 5 Endpoint Auth | Menampilkan kartu interaktif bergaya neo-modern persis sesuai gambar spesifikasi, lengkap dengan tombol uji live untuk verifikasi kelompok. |
| **Navigasi & Sesi** | `app/layout.js`<br>`lib/useRole.js` | `GET /me`<br>`POST /logout` | Sinkronisasi status peran (`user` vs `admin`) secara dinamis di navbar tanpa memicu refresh halaman penuh. |

---

## 5. Kesimpulan Kesiapan

Modul **Autentikasi & Akses Key** telah tervalidasi 100% pada lingkungan backend HMIF UNRAM dan siap digunakan sebagai landasan utama sebelum melanjutkan ke fase modul berikutnya (Katalog Dinamis, Transaksi Sewa, dan Panel Admin).
