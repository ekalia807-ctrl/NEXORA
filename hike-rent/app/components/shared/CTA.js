import Link from "next/link";

export default function CTA() {
  return (
    <section className="border-t border-line bg-paper px-6 py-24 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
        <div>
          <h2 className="max-w-md font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Bawa rombongan? Biar sistem yang susun daftar alatnya.
          </h2>
          <p className="mt-4 max-w-md text-ink/65">
            Masukkan jumlah personel dan durasi trip, dapat rekomendasi alat
            yang sesuai dalam hitungan detik.
          </p>
        </div>
        <Link
          href="/rekomendasi"
          className="shrink-0 rounded-sm bg-ridge px-6 py-3 text-sm text-fog transition-colors hover:bg-ink"
        >
          Coba rekomendasi rombongan
        </Link>
      </div>
    </section>
  );
}
