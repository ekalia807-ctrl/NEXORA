export function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

// Durasi dihitung dari selisih tanggal (hari kalender), minimal 1 hari
// supaya sewa "hari yang sama" tetap kena tarif 1 hari/malam.
export function hitungDurasiHari(tanggalMulai, tanggalSelesai) {
  const start = new Date(tanggalMulai);
  const end = new Date(tanggalSelesai);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const selisih = Math.ceil((end - start) / MS_PER_DAY);
  return Math.max(selisih, 1);
}

export function hitungBiaya({ hargaPerHari, jumlah = 1, durasiHari }) {
  return hargaPerHari * jumlah * durasiHari;
}

// Mengembalikan pesan error, atau null kalau valid.
export function validasiTanggal(tanggalMulai, tanggalSelesai) {
  if (!tanggalMulai || !tanggalSelesai) return "Tanggal mulai dan tanggal selesai wajib diisi.";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(tanggalMulai);
  const end = new Date(tanggalSelesai);

  if (start < today) return "Tanggal mulai tidak boleh sebelum hari ini.";
  if (end < start) return "Tanggal selesai tidak boleh sebelum tanggal mulai.";

  return null;
}
