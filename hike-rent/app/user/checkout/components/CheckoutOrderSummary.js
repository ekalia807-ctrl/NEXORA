"use client";

import { formatRupiah, hitungBiaya } from "@/lib/utils/hitungBiaya";

export default function CheckoutOrderSummary({
  paketItems,
  diffDays,
  totalPaketHarga,
  loading,
}) {
  return (
    <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
      <div className="rounded-2xl border border-line bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur-sm space-y-5">
        <div className="border-b border-line/60 pb-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber font-semibold">
            Ringkasan Transaksi
          </span>
          <h2 className="mt-0.5 font-display text-lg font-bold text-ink">
            Peralatan yang Disewa
          </h2>
        </div>

        <div className="space-y-2 rounded-xl border border-line bg-paper/50 p-3.5">
          {paketItems.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2 text-sm shadow-2xs"
            >
              <div className="flex flex-col">
                <span className="font-medium text-ink/90">{it.name}</span>
                <span className="text-[11px] text-ink/45">
                  {formatRupiah(it.pricePerHari)} / hari × {it.jumlah} unit
                </span>
              </div>

              <span className="font-mono font-semibold text-ink/75">
                {formatRupiah(
                  hitungBiaya({
                    hargaPerHari: it.pricePerHari,
                    jumlah: it.jumlah,
                    durasiHari: diffDays,
                  })
                )}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-line/60 pt-3 mt-1">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-ink/70">
                Total Estimasi
              </span>
              <span className="block text-[11px] text-ink/45">
                Durasi: {diffDays} hari sewa
              </span>
            </div>
            <span className="font-display text-xl font-bold text-ink">
              {formatRupiah(totalPaketHarga)}
            </span>
          </div>
        </div>

        {/* Basecamp info badge */}
        <div className="rounded-xl border border-line/60 bg-paper/40 p-3 text-xs text-ink/70 space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-ink">
            <span>📍</span>
            <span>Ketentuan Pengambilan Basecamp:</span>
          </div>
          <p className="text-[11px] text-ink/60">
            Peralatan diambil langsung di basecamp operasional NEXORA. Harap membawa KTP fisik asli yang sesuai dengan data formulir ini saat serah terima alat.
          </p>
        </div>

        {/* Tombol Ajukan Sewa */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ridge py-3.5 text-center text-xs font-bold text-fog shadow-sm transition-all hover:bg-ink disabled:opacity-50 active:scale-[0.99]"
        >
          {loading ? "Memproses Pengajuan..." : "Ajukan Sewa Sekarang →"}
        </button>
      </div>
    </div>
  );
}
