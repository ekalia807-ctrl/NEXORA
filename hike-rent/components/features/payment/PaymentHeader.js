"use client";

import Link from "next/link";

export default function PaymentHeader() {
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-6 shadow-sm backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
              Langkah Transaksi
            </span>
            <span className="h-1 w-1 rounded-full bg-ink/30" />
            <span className="font-mono text-[11px] text-ink/50">Pembayaran Sewa</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Pembayaran & Konfirmasi Sewa
          </h1>
          <p className="mt-1.5 text-sm text-ink/65">
            Selesaikan pembayaran untuk pengajuan sewa yang telah disetujui admin sebelum mengambil alat di basecamp.
          </p>
        </div>

        <Link
          href="/user/riwayat"
          className="rounded-xl border border-line bg-paper/60 px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition-all"
        >
          ← Kembali ke Riwayat
        </Link>
      </div>

      {/* Disclaimer Demo */}
      <div className="mt-4 rounded-xl border border-amber/30 bg-amber/10 p-3.5 text-xs text-ink/80 flex items-start gap-2.5">
        <span className="text-base leading-none">ℹ️</span>
        <p>
          <strong>Simulasi Demo:</strong> Metode pembayaran di bawah ini (QRIS & BRIVA) adalah antarmuka simulasi visual untuk keperluan pengujian dan demonstrasi alur sistem NEXORA. Tidak ada pemotongan saldo atau dana riil yang diproses.
        </p>
      </div>
    </div>
  );
}
