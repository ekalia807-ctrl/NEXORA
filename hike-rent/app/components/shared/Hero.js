"use client";

import { useRef } from "react";
import Link from "next/link";

export default function Hero() {
  const videoRef = useRef(null);

  // Mencegah video menyentuh transisi fade-to-black bawaan di awal & akhir klip
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    // Bila sudah mendekati akhir (2.5 detik sebelum durasi habis tempat fade-out terjadi),
    // langsung kembalikan ke detik 1.0 (setelah fade-in awal selesai)
    if (v.currentTime >= v.duration - 2.5) {
      v.currentTime = 1.0;
    }
  };

  return (
    <section className="relative overflow-hidden bg-ridge text-fog">
      {/* Background Video Pendakian / Pegunungan (Seamless Loop) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        onTimeUpdate={handleTimeUpdate}
        className="absolute inset-0 h-full w-full object-cover opacity-65"
      >
        <source src="/videos/hero-bg.webm" type="video/webm" />
      </video>

      {/* Lapisan Gradient Overlay untuk menjaga kontras dan keterbacaan teks */}
      <div className="absolute inset-0 bg-gradient-to-r from-ridge via-ridge/85 to-ridge/45 backdrop-blur-[0.5px]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ridge to-transparent" />

      {/* Konten Hero */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
        <span className="font-mono text-xs uppercase tracking-wide text-amber">
          Sewa alat pendakian
        </span>
        <h1 className="mt-5 max-w-2xl font-display text-4xl font-bold leading-[1.1] sm:text-5xl">
          Alat lengkap, siap pakai, tanpa harus punya semuanya.
        </h1>
        <p className="mt-6 max-w-prose text-[17px] leading-relaxed text-fog/85">
          NEXORA menyewakan tenda, carrier, sleeping bag, sampai alat masak
          dari penyedia terverifikasi. Cek stok, hitung biaya, ajukan sewa —
          semua dalam satu platform.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link
            href="/user/katalog"
            className="rounded-sm bg-amber px-6 py-3 text-sm font-medium text-ink transition-all hover:bg-amber/90 shadow-sm"
          >
            Lihat katalog alat
          </Link>
          <Link
            href="/user/kalkulator"
            className="rounded-sm border border-fog/30 bg-ridge/40 backdrop-blur-xs px-6 py-3 text-sm text-fog transition-all hover:border-fog/70 hover:bg-ridge/60"
          >
            Hitung estimasi biaya
          </Link>
        </div>

        <dl className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-fog/20 pt-8">
          <div>
            <dt className="font-display text-2xl font-bold text-fog">180+</dt>
            <dd className="mt-1 text-xs text-fog/70">Alat tersedia</dd>
          </div>
          <div>
            <dt className="font-display text-2xl font-bold text-fog">24</dt>
            <dd className="mt-1 text-xs text-fog/70">Penyedia mitra</dd>
          </div>
          <div>
            <dt className="font-display text-2xl font-bold text-fog">6 jam</dt>
            <dd className="mt-1 text-xs text-fog/70">Rata-rata verifikasi</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
