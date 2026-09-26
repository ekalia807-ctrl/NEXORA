"use client";

import { formatRupiah } from "@/lib/utils/hitungBiaya";

export default function BrivaView({ brivaNumber, totalAmount, copied, onCopy }) {
  return (
    <div className="mt-6 rounded-2xl border border-line bg-paper/40 p-6">
      <div className="max-w-md mx-auto rounded-xl bg-white p-5 border border-line shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-line/60 pb-3">
          <div>
            <span className="font-display font-bold text-sm text-ink">
              BRI Virtual Account (BRIVA)
            </span>
            <div className="text-[11px] text-ink/50">Merchant: NEXORA Rent</div>
          </div>
          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            BRI
          </span>
        </div>

        <div>
          <span className="text-xs text-ink/60">Nomor Virtual Account:</span>
          <div className="mt-1 flex items-center justify-between gap-2 rounded-xl bg-paper/80 p-3 border border-line">
            <span className="font-mono text-lg font-bold tracking-wider text-ink">
              {brivaNumber}
            </span>
            <button
              type="button"
              onClick={onCopy}
              className="rounded-lg bg-ridge px-3 py-1 text-xs font-semibold text-fog hover:bg-ink transition-colors"
            >
              {copied ? "✓ Tersalin!" : "Salin"}
            </button>
          </div>
        </div>

        <div className="flex items-baseline justify-between border-t border-line/60 pt-3">
          <span className="text-xs text-ink/60">Total Pembayaran:</span>
          <span className="font-display text-lg font-bold text-ink">
            {formatRupiah(totalAmount || 0)}
          </span>
        </div>
      </div>

      <div className="mt-4 max-w-md mx-auto text-xs text-ink/65 space-y-1">
        <p className="font-semibold text-ink">Cara Pembayaran via BRImo:</p>
        <p>1. Buka aplikasi BRImo &gt; Pilih menu <strong>BRIVA</strong>.</p>
        <p>2. Masukkan nomor Virtual Account di atas &gt; Konfirmasi nama dan nominal tagihan.</p>
        <p>3. Selesaikan transfer dan simpan tangkapan layar (screenshot) bukti pembayaran.</p>
      </div>
    </div>
  );
}
