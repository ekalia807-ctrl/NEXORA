/**
 * Kamus Peran Pengguna (User Roles)
 */

export const ROLES = {
  GUEST: null,
  USER: "user",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  [ROLES.GUEST]: "Tamu / Pengunjung",
  [ROLES.USER]: "Peminjam Terdaftar",
  [ROLES.ADMIN]: "Pengelola / Admin",
};
