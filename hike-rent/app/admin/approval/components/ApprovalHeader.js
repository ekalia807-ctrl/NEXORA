"use client";

export default function ApprovalHeader({ onSync }) {
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
              Operasional Toko
            </span>
            <span className="h-1 w-1 rounded-full bg-ink/30" />
            <span className="font-mono text-[11px] text-ink/50">Admin Panel</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Approval Pengajuan Sewa
          </h1>
          <p className="mt-1.5 text-sm text-ink/65 leading-relaxed">
            Verifikasi permohonan peminjaman, periksa bukti bayar, konfirmasi serah terima barang, dan pantau pengembalian alat.
          </p>
        </div>

        <button
          type="button"
          onClick={onSync}
          className="flex items-center gap-2 rounded-xl border border-line bg-paper/60 px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition-all shadow-xs"
        >
          <span>🔄</span>
          <span>Sinkronkan DB</span>
        </button>
      </div>
    </div>
  );
}
