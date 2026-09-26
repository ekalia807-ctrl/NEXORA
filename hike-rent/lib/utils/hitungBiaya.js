export function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Durasi dihitung dari selisih tanggal (hari kalender), minimal 1 hari
// supaya sewa "hari yang sama" tetap kena tarif 1 hari/malam.
export function hitungDurasiHari(tanggalMulai, tanggalSelesai) {
  if (!tanggalMulai || !tanggalSelesai) return 0;
  const start = new Date(`${tanggalMulai}T00:00:00`);
  const end = new Date(`${tanggalSelesai}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  if (tanggalSelesai < tanggalMulai) return 0;
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const selisih = Math.ceil((end - start) / MS_PER_DAY);
  return Math.max(selisih, 1);
}

export function hitungBiaya({ hargaPerHari, jumlah = 1, durasiHari }) {
  return hargaPerHari * jumlah * durasiHari;
}

// Mengembalikan pesan error umum, atau null kalau valid.
export function validasiTanggal(tanggalMulai, tanggalSelesai) {
  if (!tanggalMulai || !tanggalSelesai) return "Tanggal mulai dan tanggal selesai wajib diisi.";

  const todayStr = getTodayString();

  if (tanggalMulai < todayStr) {
    return "Tanggal ambil minimal adalah hari ini (tidak boleh tanggal yang sudah lewat).";
  }

  if (tanggalSelesai < todayStr) {
    return "Tanggal kembali tidak boleh tanggal yang sudah lewat dari hari ini.";
  }

  if (tanggalSelesai < tanggalMulai) {
    return "Tanggal kembali tidak boleh lebih awal dari tanggal ambil.";
  }

  return null;
}

// Mengembalikan error per field (startError, endError) untuk ditampilkan langsung di dekat input
export function validasiTanggalTerpisah(tanggalMulai, tanggalSelesai) {
  const todayStr = getTodayString();
  let startError = "";
  let endError = "";

  if (!tanggalMulai) {
    startError = "Tanggal mulai sewa wajib diisi.";
  } else if (tanggalMulai < todayStr) {
    startError = "Tanggal ambil minimal adalah hari ini (tidak boleh tanggal yang sudah lewat).";
  }

  if (!tanggalSelesai) {
    endError = "Tanggal selesai sewa wajib diisi.";
  } else if (tanggalSelesai < todayStr) {
    endError = "Tanggal kembali tidak boleh tanggal yang sudah lewat dari hari ini.";
  } else if (tanggalMulai && tanggalSelesai < tanggalMulai) {
    endError = "Tanggal kembali tidak boleh lebih awal dari tanggal ambil.";
  }

  return {
    startError,
    endError,
    isValid: !startError && !endError,
  };
}
