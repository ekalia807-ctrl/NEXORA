// Dicocokkan ke id asli di lib/gear.js dulu; kalau id-nya berubah (misal
// admin edit/hapus alat), fallback ke pencarian kategori + kata kunci nama.
function cariAlat(catalog, { id, kategori, kataKunci }) {
  const byId = catalog.find((item) => item.id === id);
  if (byId) return byId;
  return (
    catalog.find(
      (item) =>
        item.category === kategori &&
        item.name.toLowerCase().includes(kataKunci.toLowerCase())
    ) || null
  );
}

export function buatRekomendasi({ personel, durasiHari, kondisi = [] }, catalog) {
  const p = Math.max(1, Number(personel) || 1);
  const d = Math.max(1, Number(durasiHari) || 1);

  const aturan = [];

  if (p <= 2) {
    aturan.push({
      target: { id: "tenda-dome-2p", kategori: "Tenda", kataKunci: "dome 2" },
      jumlah: 1,
      alasan: "Rombongan kecil, cukup 1 tenda 2 orang",
    });
  } else {
    aturan.push({
      target: { id: "tenda-dome-4p", kategori: "Tenda", kataKunci: "dome 4" },
      jumlah: Math.ceil(p / 4),
      alasan: "1 tenda per ~4 personel",
    });
  }

  aturan.push({
    target:
      d >= 4
        ? { id: "carrier-80l", kategori: "Carrier", kataKunci: "80l" }
        : { id: "carrier-60l", kategori: "Carrier", kataKunci: "60l" },
    jumlah: p,
    alasan: d >= 4 ? "Trip lebih dari 3 hari, carrier lebih besar" : "1 carrier per personel",
  });

  aturan.push({
    target: { id: "sleeping-bag", kategori: "Tidur", kataKunci: "sleeping bag" },
    jumlah: p,
    alasan: "1 per personel",
  });

  aturan.push({
    target: { id: "matras", kategori: "Tidur", kataKunci: "matras" },
    jumlah: p,
    alasan: "1 per personel",
  });

  aturan.push({
    target: { id: "kompor-portable", kategori: "Masak", kataKunci: "kompor" },
    jumlah: Math.max(1, Math.ceil(p / 6)),
    alasan: "1 set kompor per ~6 personel",
  });

  if (d >= 2) {
    aturan.push({
      target: { id: "nesting", kategori: "Masak", kataKunci: "nesting" },
      jumlah: Math.max(1, Math.ceil(p / 6)),
      alasan: "Trip menginap, perlu alat masak lengkap",
    });
  }

  if (kondisi.includes("teknis")) {
    aturan.push({
      target: { id: "kompas", kategori: "Navigasi", kataKunci: "kompas" },
      jumlah: 1,
      alasan: "Jalur teknis, perlu navigasi manual",
    });
  }

  if (d >= 4) {
    aturan.push({
      target: { id: "gps-handheld", kategori: "Navigasi", kataKunci: "gps" },
      jumlah: 1,
      alasan: "Trip panjang, GPS membantu jaga jalur",
    });
  }

  return aturan.map((rule) => ({
    jumlah: rule.jumlah,
    alasan: rule.alasan,
    alat: cariAlat(catalog, rule.target),
  }));
}
