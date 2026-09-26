import Link from "next/link";

export default function CTA() {
  return (
    <section className="border-t border-line bg-paper px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-7xl flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <h2 className="max-w-xl font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-ink">
            Bawa rombongan? Biar sistem yang susun daftar alatnya.
          </h2>
          <p className="mt-3 max-w-xl text-sm sm:text-base text-ink/65 leading-relaxed">
            Masukkan jumlah personel dan durasi trip, dapat rekomendasi alat
            yang sesuai dalam hitungan detik.
          </p>
        </div>
        <Link
          href="/user/rekomendasi"
          className="shrink-0 rounded-xl bg-ridge px-6 py-3.5 text-xs sm:text-sm font-semibold text-fog transition-all hover:bg-ink shadow-sm active:scale-[0.99]"
        >
          Coba rekomendasi rombongan →
        </Link>
      </div>
    </section>
  );
}
