"use client";

import { formatRupiah } from "@/lib/utils/hitungBiaya";

export default function BillingSummary({ rental, waUrl }) {
  if (!rental) return null;

  return (
    <div className="space-y-6">
      {/* Kartu Ringkasan Tagihan */}
      <div className="rounded-2xl border border-line bg-white/80 p-6 shadow-sm backdrop-blur-sm">
        <h2 className="font-display text-lg font-bold text-ink border-b border-line/60 pb-3">
          Ringkasan Tagihan
        </h2>

        <div className="mt-4 space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-ink/60">ID Transaksi:</span>
            <span className="font-mono font-bold text-ink bg-paper px-2 py-0.5 rounded border border-line">
              {rental.id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Nama Peminjam:</span>
            <strong className="text-ink">{rental.name}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Alat Disewa:</span>
            <strong className="text-ink">{rental.item}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Jadwal Sewa:</span>
            <span className="text-ink">{rental.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Durasi:</span>
            <span className="text-ink">{rental.total_days || 1} Hari</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Status Pengajuan:</span>
            <span className="rounded-full bg-moss/15 px-2.5 py-0.5 font-semibold text-moss">
              ● {rental.status}
            </span>
          </div>
        </div>

        <div className="mt-6 border-t border-line/60 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-ink/70">Total Biaya:</span>
            <span className="font-display text-2xl font-bold text-ink">
              {formatRupiah(rental.total || rental.total_price || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Hubungi Admin via WhatsApp */}
      <div className="rounded-2xl border border-line bg-white/80 p-5 shadow-sm backdrop-blur-sm text-center">
        <h3 className="font-display text-sm font-bold text-ink">Butuh Konfirmasi Cepat?</h3>
        <p className="mt-1 text-xs text-ink/65 leading-relaxed">
          Hubungi pengelola basecamp NEXORA langsung via WhatsApp untuk pertanyaan seputar ketersediaan dan pengambilan alat.
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-moss/40 bg-moss/10 py-2.5 text-xs font-semibold text-moss hover:bg-moss hover:text-fog transition-all shadow-sm"
        >
          <span>💬</span>
          <span>Chat Admin via WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
