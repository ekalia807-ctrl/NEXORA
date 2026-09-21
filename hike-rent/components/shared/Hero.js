"use client";

import { useRef } from "react";
import Link from "next/link";

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const stats = [
  { value: "180+", label: "Alat tersedia" },
  { value: "24", label: "Penyedia mitra" },
  { value: "6 jam", label: "Rata-rata verifikasi" },
];

export default function Hero() {
  const videoRef = useRef(null);

  // Mencegah video menyentuh transisi fade-to-black bawaan di awal & akhir klip
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    if (v.currentTime >= v.duration - 2.5) {
      v.currentTime = 1.0;
    }
  };

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-ridge text-fog">
      {/* Background video pendakian / pegunungan (seamless loop) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        onTimeUpdate={handleTimeUpdate}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      >
        <source src="/videos/hero-bg.webm" type="video/webm" />
      </video>

      {/* Overlay kiri → kanan: teks tetap terbaca, sisi kanan video tetap terlihat */}
      <div className="absolute inset-0 bg-gradient-to-r from-ridge via-ridge/80 to-ridge/25" />

      {/* Tulisan besar HIKERENT sebagai watermark, terpotong di garis bawah */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[0.1em] right-[-2vw] select-none font-display text-[22vw] font-bold leading-none tracking-tighter text-fog/[0.05]"
      >
        HIKERENT
      </span>

      {/* Fade bawah menuju warna section berikutnya */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ridge to-transparent" />

      {/* Konten */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-fog/20 bg-fog/10 px-3.5 py-1.5 text-sm text-fog/90 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-amber motion-safe:animate-pulse" />
          Sewa alat pendakian terverifikasi
        </span>

        <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Alat lengkap, siap pakai,
          <span className="block text-fog/60">tanpa harus punya semuanya.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-fog/80">
          HIKERENT menyewakan tenda, carrier, sleeping bag, sampai alat masak dari
          penyedia terverifikasi. Cek stok, hitung biaya, ajukan sewa — semua dalam
          satu platform.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/katalog"
            className="group inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 text-sm font-semibold text-ink shadow-lg shadow-black/20 transition-colors hover:bg-amber/90"
          >
            Lihat katalog alat
            <ArrowIcon />
          </Link>
          <Link
            href="/user/kalkulator"
            className="inline-flex items-center rounded-full border border-fog/25 bg-fog/10 px-6 py-3 text-sm font-medium text-fog backdrop-blur-md transition-colors hover:border-fog/50 hover:bg-fog/15"
          >
            Hitung estimasi biaya
          </Link>
        </div>

        <dl className="mt-14 grid max-w-xl grid-cols-3 divide-x divide-fog/15 overflow-hidden rounded-2xl border border-fog/15 bg-fog/[0.06] backdrop-blur-md">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-4 sm:px-5">
              <dt className="font-display text-2xl font-bold text-fog">{s.value}</dt>
              <dd className="mt-1 text-xs text-fog/70">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
