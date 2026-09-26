/**
 * Kamus Status Ketersediaan Stok & Kategori Peralatan
 */

export const STOCK_LABEL = {
  hijau: "Tersedia",
  kuning: "Terbatas",
  merah: "Habis",
};

export const STOCK_COLOR = {
  hijau: "bg-moss",
  kuning: "bg-amber",
  merah: "bg-alert",
};

export const DEFAULT_CATEGORIES = [
  "Semua",
  "Tenda",
  "Carrier",
  "Tidur",
  "Masak",
  "Navigasi",
];

// Alias backward compatibility
export const stockLabel = STOCK_LABEL;
export const stockColor = STOCK_COLOR;
export const categories = DEFAULT_CATEGORIES;
