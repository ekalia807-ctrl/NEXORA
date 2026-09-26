const steps = [
  {
    n: "01",
    title: "Cari & pilih alat",
    body: "Telusuri katalog, filter per kategori, dan lihat ketersediaan langsung untuk tanggal yang kamu mau.",
  },
  {
    n: "02",
    title: "Hitung & ajukan",
    body: "Kalkulator menghitung total biaya otomatis. Unggah KTP dan setujui ketentuan dalam satu alur.",
  },
  {
    n: "03",
    title: "Verifikasi & ambil",
    body: "Penyedia memverifikasi dokumen, biasanya dalam 6 jam. Setelah disetujui, alat siap diambil.",
  },
  {
    n: "04",
    title: "Pantau & kembalikan",
    body: "Lihat status peminjaman di halaman riwayat, dan kembalikan alat sesuai jadwal.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-paper px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="max-w-2xl font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink">
          Empat langkah, dari cari alat sampai turun gunung.
        </h2>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.n} className="flex flex-col gap-3 rounded-2xl border border-line/60 bg-white/60 p-5 shadow-2xs backdrop-blur-xs">
              <span className="font-mono text-sm font-bold text-rust">{step.n}</span>
              <div>
                <h3 className="font-display text-base sm:text-lg font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-ink/65">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
