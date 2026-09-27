export const stockOptions = [
  { value: "hijau", label: "Hijau — Stok Tersedia & Aman" },
  { value: "kuning", label: "Kuning — Stok Terbatas / Menipis" },
  { value: "merah", label: "Merah — Stok Habis / Kosong" },
];

export const fallbackCategories = [
  { id: 1, name: "Tenda", slug: "tenda" },
  { id: 2, name: "Carrier", slug: "carrier" },
  { id: 3, name: "Sepatu", slug: "sepatu" },
];

export const emptyForm = {
  name: "",
  slug: "",
  category_id: 1,
  price: "",
  unit: "per hari",
  total_stock: 5,
  available_stock: 5,
  stock_status: "hijau",
  image_url: "",
  note: "",
};
