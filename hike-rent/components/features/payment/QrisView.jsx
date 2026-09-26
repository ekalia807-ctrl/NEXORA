"use client";

import { formatRupiah } from "@/lib/utils/hitungBiaya";

export default function QrisView({ totalAmount }) {
  return (
    <div className="mt-6 rounded-2xl border border-line bg-paper/40 p-6 text-center">
      <div className="mx-auto max-w-xs rounded-xl bg-white p-5 border border-line shadow-sm">
        {/* Header QRIS */}
        <div className="flex items-center justify-between border-b border-line/60 pb-3">
          <span className="font-display font-black text-sm tracking-wider text-ink">
            QRIS
          </span>
          <span className="font-mono text-[10px] text-ink/50">
            NEXORA BASECAMP
          </span>
        </div>

        {/* QR Code Graphic Simulasi */}
        <div className="my-4 flex items-center justify-center p-3 bg-white">
          <svg
            viewBox="0 0 160 160"
            className="h-44 w-44 rounded-lg border border-line p-2"
            fill="currentColor"
          >
            <rect width="160" height="160" fill="#ffffff" />
            <rect x="10" y="10" width="40" height="40" fill="#171B14" />
            <rect x="18" y="18" width="24" height="24" fill="#ffffff" />
            <rect x="24" y="24" width="12" height="12" fill="#171B14" />
            <rect x="110" y="10" width="40" height="40" fill="#171B14" />
            <rect x="118" y="18" width="24" height="24" fill="#ffffff" />
            <rect x="124" y="24" width="12" height="12" fill="#171B14" />
            <rect x="10" y="110" width="40" height="40" fill="#171B14" />
            <rect x="18" y="118" width="24" height="24" fill="#ffffff" />
            <rect x="24" y="124" width="12" height="12" fill="#171B14" />
            <rect x="60" y="20" width="8" height="8" fill="#171B14" />
            <rect x="76" y="20" width="8" height="8" fill="#171B14" />
            <rect x="92" y="20" width="8" height="8" fill="#171B14" />
            <rect x="60" y="40" width="16" height="8" fill="#171B14" />
            <rect x="84" y="40" width="16" height="8" fill="#171B14" />
            <rect x="20" y="60" width="8" height="16" fill="#171B14" />
            <rect x="36" y="60" width="8" height="8" fill="#171B14" />
            <rect x="60" y="60" width="40" height="40" fill="#171B14" rx="4" />
            <rect x="116" y="60" width="8" height="16" fill="#171B14" />
            <rect x="132" y="60" width="8" height="8" fill="#171B14" />
            <rect x="20" y="84" width="16" height="8" fill="#171B14" />
            <rect x="124" y="84" width="16" height="8" fill="#171B14" />
            <rect x="60" y="110" width="8" height="8" fill="#171B14" />
            <rect x="76" y="110" width="16" height="8" fill="#171B14" />
            <rect x="100" y="110" width="8" height="16" fill="#171B14" />
            <rect x="124" y="110" width="16" height="8" fill="#171B14" />
            <rect x="60" y="130" width="16" height="8" fill="#171B14" />
            <rect x="84" y="130" width="8" height="16" fill="#171B14" />
            <rect x="108" y="130" width="16" height="8" fill="#171B14" />
            <rect x="132" y="130" width="8" height="16" fill="#171B14" />
          </svg>
        </div>

        <div className="text-center">
          <div className="font-mono text-xs font-semibold text-ink/70">
            NMKR: 93600128004128
          </div>
          <div className="mt-1 font-display text-base font-bold text-ink">
            {formatRupiah(totalAmount || 0)}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-ink/65 max-w-sm mx-auto">
        Buka aplikasi e-wallet atau mobile banking favoritmu, scan QR di atas, dan simpan tangkapan layar bukti pembayaran untuk diunggah pada formulir di bawah.
      </p>
    </div>
  );
}
