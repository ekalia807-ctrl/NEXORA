/**
 * Kamus Status Peminjaman Resmi (Single Source of Truth)
 * Menyelaraskan status antara Database Backend HMIF UNRAM dan Frontend NEXORA.
 *
 * Skema Enum Database:
 * - "menunggu_verifikasi" : Pengajuan baru masuk, menunggu persetujuan admin
 * - "aktif"               : Disetujui admin dan alat sedang aktif dipinjam / diambil
 * - "selesai"             : Alat sudah dikembalikan dengan baik
 * - "ditolak"             : Pengajuan ditolak atau dibatalkan
 */

export const RENTAL_STATUS = {
  PENDING: "menunggu_verifikasi",
  ACTIVE: "aktif",
  COMPLETED: "selesai",
  REJECTED: "ditolak",
};

/**
 * Label tampilan human-readable untuk antarmuka pengguna
 */
export const RENTAL_STATUS_LABEL = {
  [RENTAL_STATUS.PENDING]: "Menunggu Verifikasi",
  [RENTAL_STATUS.ACTIVE]: "Disetujui / Aktif",
  [RENTAL_STATUS.COMPLETED]: "Selesai",
  [RENTAL_STATUS.REJECTED]: "Ditolak",
};

/**
 * Badge styling warna status terpusat (Tailwind CSS)
 */
export const RENTAL_STATUS_STYLE = {
  [RENTAL_STATUS.PENDING]: "bg-amber text-ink",
  [RENTAL_STATUS.ACTIVE]: "bg-moss text-fog",
  [RENTAL_STATUS.COMPLETED]: "bg-line text-ink/70",
  [RENTAL_STATUS.REJECTED]: "bg-alert text-fog",
  // Alias tampilan human-readable
  "Menunggu verifikasi": "bg-amber text-ink",
  Disetujui: "bg-moss text-fog",
  Aktif: "bg-moss text-fog",
  Diambil: "bg-ridge text-amber",
  Selesai: "bg-line text-ink/70",
  Ditolak: "bg-alert text-fog",
};

// Alias backward compatibility
export const statusStyle = RENTAL_STATUS_STYLE;

/**
 * Pemetaan status lama atau variasi input ke enum resmi database
 */
export function normalizeBackendStatus(statusInput) {
  if (!statusInput) return RENTAL_STATUS.PENDING;

  const s = String(statusInput).toLowerCase().trim();
  if (s === "diajukan" || s === "menunggu verifikasi" || s === "menunggu_verifikasi") {
    return RENTAL_STATUS.PENDING;
  }
  if (
    s === "disetujui" ||
    s === "diverifikasi" ||
    s === "diambil" ||
    s === "aktif"
  ) {
    return RENTAL_STATUS.ACTIVE;
  }
  if (s === "selesai" || s === "dikembalikan") {
    return RENTAL_STATUS.COMPLETED;
  }
  if (s === "ditolak" || s === "dibatalkan") {
    return RENTAL_STATUS.REJECTED;
  }

  return RENTAL_STATUS.PENDING;
}
