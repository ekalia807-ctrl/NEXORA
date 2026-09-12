import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-ridge text-fog">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
        <span className="font-mono text-xs uppercase tracking-wide text-amber">
          Sewa alat pendakian
        </span>
        <h1 className="mt-5 max-w-2xl font-display text-4xl font-bold leading-[1.1] sm:text-5xl">
          Alat lengkap, siap pakai, tanpa harus punya semuanya.
        </h1>
        <p className="mt-6 max-w-prose text-[17px] leading-relaxed text-fog/75">
          NEXORA menyewakan tenda, carrier, sleeping bag, sampai alat masak
          dari penyedia terverifikasi. Cek stok, hitung biaya, ajukan sewa —
          semua dalam satu platform.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link
            href="/user/katalog"
            className="rounded-sm bg-amber px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-amber/90"
          >
            Lihat katalog alat
          </Link>
          <Link
            href="/user/kalkulator"
            className="rounded-sm border border-fog/25 px-6 py-3 text-sm text-fog transition-colors hover:border-fog/60"
          >
            Hitung estimasi biaya
          </Link>
        </div>

        <dl className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-fog/15 pt-8">
          <div>
            <dt className="font-display text-2xl font-bold text-fog">180+</dt>
            <dd className="mt-1 text-xs text-fog/60">Alat tersedia</dd>
          </div>
          <div>
            <dt className="font-display text-2xl font-bold text-fog">24</dt>
            <dd className="mt-1 text-xs text-fog/60">Penyedia mitra</dd>
          </div>
          <div>
            <dt className="font-display text-2xl font-bold text-fog">6 jam</dt>
            <dd className="mt-1 text-xs text-fog/60">Rata-rata verifikasi</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
