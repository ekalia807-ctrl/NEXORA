"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/utils/hitungBiaya";

export default function CheckoutSuccessModal({
  name,
  whatsapp,
  paketItems,
  startDate,
  endDate,
  totalPaketHarga,
}) {
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-8 text-center shadow-sm backdrop-blur-md sm:p-12">
      <span
        className="status-dot bg-moss mx-auto block"
        style={{ width: 16, height: 16 }}
      />

      <h1 className="mt-5 font-display text-3xl font-bold text-ink">
        Pengajuan Sewa Berhasil Dikirim!
      </h1>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/65">
        Pengajuan sewa peralatan pendakian kamu telah tercatat. Tim admin
        NEXORA akan segera meninjau permohonanmu. Setelah disetujui, kamu
        dapat langsung melanjutkan ke pembayaran.
      </p>

      <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl border border-line bg-paper/60 p-4 text-left text-xs text-ink/80 shadow-sm">
        <div className="flex justify-between border-b border-line/40 pb-1.5">
          <span className="text-ink/50">Nama Peminjam:</span>
          <span className="font-semibold text-ink">{name}</span>
        </div>

        <div className="flex justify-between border-b border-line/40 pb-1.5">
          <span className="text-ink/50">Nomor WhatsApp:</span>
          <span className="font-mono font-semibold text-ink">{whatsapp || "-"}</span>
        </div>

        <div className="border-b border-line/40 pb-1.5">
          <span className="text-ink/50">Peralatan:</span>

          <ul className="mt-1 space-y-1">
            {paketItems.map((it) => (
              <li key={it.id} className="flex justify-between">
                <span className="text-ink/80">{it.name}</span>
                <span className="font-mono font-medium text-ink">
                  × {it.jumlah}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between border-b border-line/40 pb-1.5">
          <span className="text-ink/50">Periode Sewa:</span>
          <span className="font-medium text-ink">
            {startDate} s/d {endDate}
          </span>
        </div>

        <div className="flex justify-between pt-0.5">
          <span className="text-ink/50">Total Estimasi Biaya:</span>
          <span className="font-semibold text-ink">
            {formatRupiah(totalPaketHarga)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/user/riwayat"
          className="rounded-xl bg-ridge px-6 py-2.5 text-xs font-semibold text-fog shadow-sm transition-all hover:bg-ink"
        >
          Lihat Status di Riwayat →
        </Link>

        <Link
          href="/user/katalog"
          className="rounded-xl border border-line bg-paper/60 px-5 py-2.5 text-xs font-semibold text-ink transition-all hover:bg-paper"
        >
          Kembali ke Katalog
        </Link>
      </div>
    </div>
  );
}
