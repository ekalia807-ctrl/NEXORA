"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/utils/hitungBiaya";

export default function PaymentSuccessView({
  selectedRental,
  method,
  userNotes,
  proofPreview,
  waUrl,
  onResetManual,
}) {
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-8 text-center shadow-sm backdrop-blur-md sm:p-12">
      <span
        className="status-dot bg-moss mx-auto block"
        style={{ width: 16, height: 16 }}
      />

      <h1 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-ink">
        Bukti Pembayaran Berhasil Dikirim!
      </h1>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink/65">
        Bukti transfer pembayaran kamu telah tersimpan di sistem. Tim admin NEXORA akan segera memverifikasi transaksi ini. Setelah pembayaran diverifikasi, kamu dapat mengambil peralatan di basecamp sesuai jadwal peminjaman.
      </p>

      <div className="mx-auto mt-6 max-w-md space-y-2 rounded-xl border border-line bg-paper/60 p-5 text-left text-xs text-ink/80 shadow-sm">
        <div className="flex justify-between border-b border-line/40 pb-2">
          <span className="text-ink/50">ID Transaksi:</span>
          <span className="font-mono font-semibold text-ink">{selectedRental.id}</span>
        </div>
        <div className="flex justify-between border-b border-line/40 pb-2">
          <span className="text-ink/50">Peralatan Sewa:</span>
          <span className="font-semibold text-ink">{selectedRental.item}</span>
        </div>
        <div className="flex justify-between border-b border-line/40 pb-2">
          <span className="text-ink/50">Metode Pembayaran:</span>
          <span className="font-medium text-ink">
            {method === "qris" ? "QRIS NEXORA" : "BRIVA (BRI Virtual Account)"}
          </span>
        </div>
        <div className="flex justify-between border-b border-line/40 pb-2">
          <span className="text-ink/50">Total Pembayaran:</span>
          <span className="font-mono font-bold text-ink">
            {formatRupiah(selectedRental.total || selectedRental.total_price || 0)}
          </span>
        </div>
        <div className="flex justify-between pt-0.5">
          <span className="text-ink/50">Status:</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-amber">
            <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
            Menunggu Verifikasi Admin
          </span>
        </div>
        {userNotes && (
          <div className="border-t border-line/40 pt-2 text-[11px] text-ink/60">
            <span className="font-medium text-ink/75">Catatan:</span> {userNotes}
          </div>
        )}
      </div>

      {proofPreview && (
        <div className="mx-auto mt-4 max-w-xs overflow-hidden rounded-xl border border-line bg-paper p-1 shadow-xs">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={proofPreview}
              alt="Bukti Transfer"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="py-1 text-[10px] font-mono text-ink/40 block">
            Pratinjau Bukti Terunggah
          </span>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/user/riwayat"
          className="rounded-xl bg-ridge px-6 py-2.5 text-xs font-semibold text-fog shadow-sm transition-all hover:bg-ink"
        >
          Pantau Status di Riwayat Sewa →
        </Link>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-moss/40 bg-moss/10 px-5 py-2.5 text-xs font-semibold text-moss transition-all hover:bg-moss hover:text-fog flex items-center gap-1.5"
        >
          <span>💬 Konfirmasi via WhatsApp</span>
        </a>
        <button
          type="button"
          onClick={onResetManual}
          className="rounded-xl border border-line bg-paper/60 px-5 py-2.5 text-xs font-semibold text-ink/70 transition-all hover:bg-paper"
        >
          Ubah / Perbarui Bukti
        </button>
        <Link
          href="/user/katalog"
          className="rounded-xl border border-line bg-white px-5 py-2.5 text-xs font-semibold text-ink/70 transition-all hover:bg-paper"
        >
          Kembali ke Katalog
        </Link>
      </div>
    </div>
  );
}
