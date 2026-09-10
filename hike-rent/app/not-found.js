import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center sm:px-8">
      <h1 className="font-display text-4xl font-bold text-ink">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-4 text-ink/65">
        Halaman yang kamu cari mungkin sudah pindah atau belum ada.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-sm bg-ridge px-6 py-3 text-sm text-fog hover:bg-ink"
      >
        Kembali ke beranda
      </Link>
    </section>
  );
}
