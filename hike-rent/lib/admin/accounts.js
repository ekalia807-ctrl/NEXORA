// Data akun pengguna (peminjam) yang dikelola admin.
// Belum ada backend, jadi ini data awal yang nanti dimutasi di
// state React pada app/admin/accounts/page.js (hapus akun dsb).

export const initialAccounts = [
  {
    id: "USR-001",
    name: "Ayu Dian",
    email: "ayudian@email.com",
    whatsapp: "6281234567890",
    joined: "12 Jan 2026",
    totalSewa: 3,
    status: "Aktif",
  },
  {
    id: "USR-002",
    name: "Rian Pratama",
    email: "rian.pratama@email.com",
    whatsapp: "6281234567890",
    joined: "03 Feb 2026",
    totalSewa: 1,
    status: "Aktif",
  },
  {
    id: "USR-003",
    name: "Siti Aminah",
    email: "siti.aminah@email.com",
    whatsapp: "6289876543210",
    joined: "20 Mar 2026",
    totalSewa: 2,
    status: "Aktif",
  },
  {
    id: "USR-004",
    name: "Bagas Wicaksono",
    email: "bagas.w@email.com",
    whatsapp: "6285678901234",
    joined: "05 Mei 2026",
    totalSewa: 0,
    status: "Nonaktif",
  },
  {
    id: "USR-005",
    name: "Nadia Kusuma",
    email: "nadia.kusuma@email.com",
    whatsapp: "6281122334455",
    joined: "18 Jul 2026",
    totalSewa: 4,
    status: "Aktif",
  },
];
