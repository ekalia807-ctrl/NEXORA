const features = [
  {
    title: "Katalog & ketersediaan real-time",
    body: "Cek stok alat berdasarkan rentang tanggal, dengan indikator visual merah, kuning, hijau supaya kamu tahu langsung mana yang masih bisa dipesan.",
  },
  {
    title: "Kalkulator biaya otomatis",
    body: "Durasi peminjaman dan total tarif dihitung otomatis begitu tanggal dipilih. Tidak ada lagi hitung manual atau tarif yang beda-beda di chat.",
  },
  {
    title: "Pengajuan dengan verifikasi dokumen",
    body: "Unggah KTP dan setujui syarat ketentuan langsung dalam alur pengajuan, tanpa bolak-balik chat manual.",
  },
  {
    title: "Riwayat & status transparan",
    body: "Pantau peminjaman aktif dan lihat riwayat transaksi lengkap kapan saja, dari pengajuan sampai alat dikembalikan.",
  },
  {
    title: "Rekomendasi berbasis rombongan",
    body: "Masukkan jumlah personel dan durasi trip, sistem menyarankan daftar alat yang sesuai supaya tidak ada yang kelewat atau berlebih.",
  },
];

export default function Features() {
  return (
    <section id="fitur" className="bg-ridge px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr]">
        <div className="md:sticky md:top-24 md:self-start">
          <h2 className="font-display text-4xl font-bold leading-tight text-fog md:text-5xl">
            Semua yang dibutuhkan buat urus alat pendakian.
          </h2>
          <p className="mt-4 max-w-sm text-fog/65">
            Dari cari alat sampai alat kembali ke gudang, satu platform buat
            peminjam dan penyedia.
          </p>
        </div>

        <div>
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="border-t border-fog/15 py-8 first:pt-0"
            >
              <span className="font-mono text-xs text-amber">
                0{i + 1}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold text-fog">
                {feature.title}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-fog/65">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
