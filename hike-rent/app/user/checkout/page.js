"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import RequireAuth from "@/app/components/shared/RequireAuth";

function CheckoutForm() {
  const [submitted, setSubmitted] = useState(false);
  const searchParams = useSearchParams();
  const alat = searchParams.get("alat") || "";

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-line bg-white/40 p-8 text-center sm:p-12">
        <span className="status-dot bg-amber mx-auto block" style={{ width: 14, height: 14 }} />
        <h1 className="mt-6 font-display text-3xl font-bold text-ink">
          Pengajuan Sewa Terkirim
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink/65">
          Tim penyedia akan memverifikasi dokumen kamu. Biasanya selesai dalam 6 jam. Pantau perkembangan statusnya di halaman riwayat.
        </p>
        <Link
          href="/user/riwayat"
          className="mt-8 inline-block rounded-sm bg-ridge px-6 py-3 text-sm font-medium text-fog hover:bg-ink transition-colors"
        >
          Lihat Status Pengajuan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Checkout Pengajuan Sewa</h1>
          <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
            Peminjam
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Lengkapi data diri dan konfirmasi perlengkapan yang ingin kamu sewa sebelum diproses oleh pihak penyedia.
        </p>
      </div>

      <div className="border border-line bg-white/40 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink/70">Alat yang Dipilih</label>
            <input
              type="text"
              readOnly
              value={alat || "Semua paket sewa terpilih"}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink/80 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="Masukkan nama lengkap sesuai identitas"
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Nomor WhatsApp Aktif</label>
            <input
              type="text"
              required
              placeholder="081234567890"
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Unggah Foto KTP (Simulasi)</label>
            <input
              type="file"
              required
              className="mt-1.5 w-full text-sm text-ink/70 file:mr-4 file:rounded-sm file:border-0 file:bg-ridge file:px-4 file:py-2 file:text-xs file:font-medium file:text-fog hover:file:bg-ink cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-sm bg-ridge py-3 text-center text-sm font-medium text-fog hover:bg-ink transition-colors"
          >
            Kirim Pengajuan Sewa
          </button>
        </form>
      </div>
    </div>
  );
}

export default function UserCheckoutPage() {
  return (
    <RequireAuth allow={["user"]}>
      <Suspense fallback={<div className="p-6 text-sm text-ink/50">Memuat checkout...</div>}>
        <CheckoutForm />
      </Suspense>
    </RequireAuth>
  );
}