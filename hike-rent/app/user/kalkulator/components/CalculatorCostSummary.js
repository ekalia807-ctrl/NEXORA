"use client";

import Link from "next/link";
import { formatRupiah, hitungBiaya } from "@/lib/utils/hitungBiaya";

export default function CalculatorCostSummary({
  durasiHari,
  baris,
  totalBiaya,
  copied,
  onSalin,
  checkoutUrl,
}) {
  return (
    <div className="mt-6 rounded-2xl border border-line bg-paper/40 p-5 sm:p-6 print:border-black/20">
      <div className="flex items-center justify-between border-b border-line/60 pb-3">
        <span className="font-mono text-xs uppercase tracking-wider text-amber font-semibold">
          Rincian Biaya
        </span>
        <span className="font-mono text-xs text-ink/50">
          Durasi Sewa: {durasiHari} hari
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {baris.map((b) => (
          <li
            key={b.alat.id}
            className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-2.5 text-sm text-ink/85 border border-line/50 print:text-black"
          >
            <span className="font-medium">
              {b.alat.name} <span className="font-mono text-ridge">× {b.jumlah}</span>
            </span>
            <span className="font-mono font-semibold text-ink">
              {formatRupiah(
                hitungBiaya({
                  hargaPerHari: b.alat.price,
                  jumlah: b.jumlah,
                  durasiHari,
                })
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between border-t border-line/70 pt-4 print:border-black/20">
        <span className="font-display text-base font-semibold text-ink print:text-black">
          Total Estimasi Biaya
        </span>
        <span className="font-display text-2xl font-bold text-ink print:text-black">
          {formatRupiah(totalBiaya)}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={onSalin}
          className="rounded-xl border border-line bg-white/80 px-5 py-2.5 text-xs font-semibold text-ink shadow-2xs transition-all hover:bg-paper"
        >
          {copied ? "✓ Tersalin ke Clipboard!" : "Salin Ringkasan"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl border border-line bg-white/80 px-5 py-2.5 text-xs font-semibold text-ink shadow-2xs transition-all hover:bg-paper"
        >
          Cetak / Simpan PDF
        </button>
        <Link
          href={checkoutUrl}
          className="rounded-xl bg-ridge px-6 py-2.5 text-xs font-semibold text-fog shadow-sm transition-all hover:bg-ink"
        >
          Lanjutkan ke Pengajuan Sewa →
        </Link>
      </div>
    </div>
  );
}
