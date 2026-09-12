"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function PengajuanForm() {
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const alat = searchParams.get("alat") || "";

  // Proteksi rute langsung di awal render menggunakan localStorage
  if (typeof window !== "undefined") {
    const role = localStorage.getItem("role");
    if (!role) {
      const here = alat ? `/pengajuan?alat=${encodeURIComponent(alat)}` : "/pengajuan";
      router.replace(`/login?redirect=${encodeURIComponent(here)}`);
      return null;
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role");
      if (!role) {
        const here = alat ? `/pengajuan?alat=${encodeURIComponent(alat)}` : "/pengajuan";
        router.push(`/login?redirect=${encodeURIComponent(here)}`);
        return;
      }
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center sm:px-8">
        <span className="status-dot bg-amber mx-auto block" style={{ width: 12, height: 12 }} />
        <h1 className="mt-6 font-display text-3xl font-bold text-ink">
          Pengajuan terkirim
        </h1>
        <p className="mt-4 text-ink/65">
          Tim penyedia akan memverifikasi dokumen kamu. Biasanya selesai dalam 6 jam. Pantau statusnya di halaman riwayat.
        </p>
        <Link
          href="/riwayat"
          className="mt-8 inline-block rounded-sm bg-ridge px-6 py-3 text-sm text-fog hover:bg-ink transition-colors"
        >
          Lihat status pengajuan
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16 sm:px-8">
      <h1 className="font-display text-4xl font-bold text-ink">Ajukan Sewa</h1>
      <p className="mt-3 text-ink/65">
        Isi data diri dan perlengkapan yang ingin disewa. Pastikan akunmu sudah terverifikasi.
      </p>
      <form onSubmit={handleSubmit} className="mt-10 space-y-6 border border-line bg-white/40 p-8 shadow-sm">
        <div>
          <label className="block text-sm text-ink/70">Alat yang Dipilih</label>
          <input
            type="text"
            readOnly
            value={alat || "Pilih alat dari katalog terlebih dahulu"}
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink/80 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-ink/70">Nama Lengkap</label>
          <input
            type="text"
            required
            placeholder="Masukkan nama lengkap sesuai KTP"
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
          />
        </div>
        <div>
          <label className="block text-sm text-ink/70">Nomor WhatsApp Aktif</label>
          <input
            type="text"
            required
            placeholder="081234567890"
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
          />
        </div>
        <div>
          <label className="block text-sm text-ink/70">Unggah Foto KTP (Simulasi)</label>
          <input
            type="file"
            required
            className="mt-1.5 w-full text-sm text-ink/70 file:mr-4 file:rounded-sm file:border-0 file:bg-ridge file:px-4 file:py-2 file:text-xs file:font-medium file:text-fog hover:file:bg-ink"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-sm bg-ridge py-3 text-center text-sm font-medium text-fog hover:bg-ink transition-colors"
        >
          Kirim Pengajuan Sewa
        </button>
      </form>
    </section>
  );
}

export default function PengajuanPage() {
  return (
    <Suspense fallback={null}>
      <PengajuanForm />
    </Suspense>
  );
}