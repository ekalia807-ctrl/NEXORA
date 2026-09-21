export const categories = ["Semua", "Tenda", "Carrier", "Tidur", "Masak", "Navigasi"];

export const gear = [];

/**
 * Normalisasi URL gambar alat pendakian:
 * - "-" atau string kosong / null diubah menjadi ""
 * - URL relatif diberi awalan https://hmif.if.unram.ac.id
 * - URL absolut tetap dipertahankan
 */
export function normalizeGearImage(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === "-") return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `https://hmif.if.unram.ac.id${path}`;
}

export const stockLabel = {
  hijau: "Tersedia",
  kuning: "Terbatas",
  merah: "Habis",
};

export const stockColor = {
  hijau: "bg-moss",
  kuning: "bg-amber",
  merah: "bg-alert",
};

