// Definisi Modul Endpoint API untuk Pengujian NEXORA

export const AUTH_ENDPOINTS = [
  {
    id: "login",
    method: "POST",
    path: "/hikerent/login",
    desc: "Autentikasi akun dan login untuk project HikeRent. Mengembalikan token Bearer sesi serta API Key unik kelompok.",
  },
  {
    id: "register",
    method: "POST",
    path: "/hikerent/register",
    desc: "Mendaftarkan akun baru untuk project HikeRent (publik, tanpa API key). Field nama bebas pakai nama / name / nama_lengkap. Setelah register, login untuk mendapatkan token & API Key.",
  },
  {
    id: "logout",
    method: "POST",
    path: "/hikerent/logout",
    desc: "Mengakhiri sesi autentikasi dan membatalkan token untuk project HikeRent.",
  },
  {
    id: "me",
    method: "GET",
    path: "/hikerent/me",
    desc: "Memeriksa validitas sesi JWT login dan mengambil profil user aktif yang sedang login. Memerlukan header Authorization: Bearer.",
  },
  {
    id: "key",
    method: "GET",
    path: "/hikerent/key",
    desc: "Mengambil Akses Key (API Key) unik dari database khusus untuk project HikeRent.",
  },
];

export const CATEGORIES_ENDPOINTS = [
  {
    id: "cat-list",
    method: "GET",
    path: "/hikerent/categories",
    desc: "Mengambil daftar seluruh kategori gear",
  },
  {
    id: "cat-detail",
    method: "GET",
    path: "/hikerent/categories/{id}",
    desc: "Mengambil detail single kategori gear berdasarkan ID",
  },
  {
    id: "cat-create",
    method: "POST",
    path: "/hikerent/categories",
    desc: "Membuat data baru kategori gear",
  },
  {
    id: "cat-update",
    method: "PUT",
    path: "/hikerent/categories/{id}",
    desc: "Memperbarui data kategori gear berdasarkan ID",
  },
  {
    id: "cat-delete",
    method: "DELETE",
    path: "/hikerent/categories/{id}",
    desc: "Menghapus data kategori gear berdasarkan ID",
  },
];

export const GEAR_ENDPOINTS = [
  {
    id: "gear-list",
    method: "GET",
    path: "/hikerent/gear",
    desc: "Mengambil daftar seluruh gear items (peralatan)",
  },
  {
    id: "gear-detail",
    method: "GET",
    path: "/hikerent/gear/{id}",
    desc: "Mengambil detail single gear items (peralatan) berdasarkan ID",
  },
  {
    id: "gear-create",
    method: "POST",
    path: "/hikerent/gear",
    desc: "Membuat data baru gear items (peralatan)",
  },
  {
    id: "gear-update",
    method: "PUT",
    path: "/hikerent/gear/{id}",
    desc: "Memperbarui data gear items (peralatan) berdasarkan ID",
  },
  {
    id: "gear-delete",
    method: "DELETE",
    path: "/hikerent/gear/{id}",
    desc: "Menghapus data gear items (peralatan) berdasarkan ID",
  },
];

export const RENTALS_ENDPOINTS = [
  {
    id: "rentals-list",
    method: "GET",
    path: "/hikerent/rentals",
    desc: "Mengambil daftar seluruh transaksi rental hikerent",
  },
  {
    id: "rentals-detail",
    method: "GET",
    path: "/hikerent/rentals/{id}",
    desc: "Mengambil detail single transaksi rental hikerent berdasarkan ID",
  },
  {
    id: "rentals-create",
    method: "POST",
    path: "/hikerent/rentals",
    desc: "Membuat data baru transaksi rental hikerent",
  },
  {
    id: "rentals-update",
    method: "PUT",
    path: "/hikerent/rentals/{id}",
    desc: "Memperbarui data transaksi rental hikerent berdasarkan ID",
  },
  {
    id: "rentals-delete",
    method: "DELETE",
    path: "/hikerent/rentals/{id}",
    desc: "Menghapus data transaksi rental hikerent berdasarkan ID",
  },
];

export const RENTAL_ITEMS_ENDPOINTS = [
  {
    id: "items-list",
    method: "GET",
    path: "/hikerent/rental_items",
    desc: "Mengambil daftar seluruh detail rental items",
  },
  {
    id: "items-detail",
    method: "GET",
    path: "/hikerent/rental_items/{id}",
    desc: "Mengambil detail single detail rental items berdasarkan ID",
  },
  {
    id: "items-create",
    method: "POST",
    path: "/hikerent/rental_items",
    desc: "Membuat data baru detail rental items",
  },
  {
    id: "items-update",
    method: "PUT",
    path: "/hikerent/rental_items/{id}",
    desc: "Memperbarui data detail rental items berdasarkan ID",
  },
  {
    id: "items-delete",
    method: "DELETE",
    path: "/hikerent/rental_items/{id}",
    desc: "Menghapus data detail rental items berdasarkan ID",
  },
];

export const PACKAGES_ENDPOINTS = [
  {
    id: "pkg-list",
    method: "GET",
    path: "/hikerent/packages",
    desc: "Mengambil daftar seluruh paket pendakian",
  },
  {
    id: "pkg-detail",
    method: "GET",
    path: "/hikerent/packages/{id}",
    desc: "Mengambil detail single paket pendakian berdasarkan ID",
  },
  {
    id: "pkg-create",
    method: "POST",
    path: "/hikerent/packages",
    desc: "Membuat data baru paket pendakian",
  },
  {
    id: "pkg-update",
    method: "PUT",
    path: "/hikerent/packages/{id}",
    desc: "Memperbarui data paket pendakian berdasarkan ID",
  },
  {
    id: "pkg-delete",
    method: "DELETE",
    path: "/hikerent/packages/{id}",
    desc: "Menghapus data paket pendakian berdasarkan ID",
  },
];

export const PACKAGE_ITEMS_ENDPOINTS = [
  {
    id: "pkg-item-list",
    method: "GET",
    path: "/hikerent/package_items",
    desc: "Mengambil daftar seluruh item dalam paket",
  },
  {
    id: "pkg-item-detail",
    method: "GET",
    path: "/hikerent/package_items/{id}",
    desc: "Mengambil detail single item dalam paket berdasarkan ID",
  },
  {
    id: "pkg-item-create",
    method: "POST",
    path: "/hikerent/package_items",
    desc: "Membuat data baru item dalam paket",
  },
  {
    id: "pkg-item-update",
    method: "PUT",
    path: "/hikerent/package_items/{id}",
    desc: "Memperbarui data item dalam paket berdasarkan ID",
  },
  {
    id: "pkg-item-delete",
    method: "DELETE",
    path: "/hikerent/package_items/{id}",
    desc: "Menghapus data item dalam paket berdasarkan ID",
  },
];

export const WISHLIST_ENDPOINTS = [
  {
    id: "wish-list",
    method: "GET",
    path: "/hikerent/wishlist",
    desc: "Mengambil daftar seluruh wishlist",
  },
  {
    id: "wish-detail",
    method: "GET",
    path: "/hikerent/wishlist/{id}",
    desc: "Mengambil detail single wishlist berdasarkan ID",
  },
  {
    id: "wish-create",
    method: "POST",
    path: "/hikerent/wishlist",
    desc: "Membuat data baru wishlist",
  },
  {
    id: "wish-update",
    method: "PUT",
    path: "/hikerent/wishlist/{id}",
    desc: "Memperbarui data wishlist berdasarkan ID",
  },
  {
    id: "wish-delete",
    method: "DELETE",
    path: "/hikerent/wishlist/{id}",
    desc: "Menghapus data wishlist berdasarkan ID",
  },
];

export const RENTAL_STATUS_LOGS_ENDPOINTS = [
  {
    id: "logs-list",
    method: "GET",
    path: "/hikerent/rental_status_logs",
    desc: "Mengambil daftar seluruh status history logs",
  },
  {
    id: "logs-detail",
    method: "GET",
    path: "/hikerent/rental_status_logs/{id}",
    desc: "Mengambil detail single status history logs berdasarkan ID",
  },
  {
    id: "logs-create",
    method: "POST",
    path: "/hikerent/rental_status_logs",
    desc: "Membuat data baru status history logs",
  },
  {
    id: "logs-update",
    method: "PUT",
    path: "/hikerent/rental_status_logs/{id}",
    desc: "Memperbarui data status history logs berdasarkan ID",
  },
  {
    id: "logs-delete",
    method: "DELETE",
    path: "/hikerent/rental_status_logs/{id}",
    desc: "Menghapus data status history logs berdasarkan ID",
  },
];
