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
    <section className="bg-paper px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-lg font-display text-3xl font-bold text-ink sm:text-4xl">
          Empat langkah, dari cari alat sampai turun gunung.
        </h2>

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {steps.map((step) => (
            <div key={step.n} className="flex gap-5">
              <span className="font-mono text-sm text-rust">{step.n}</span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/65">
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
