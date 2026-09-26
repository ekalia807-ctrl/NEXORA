"use client";

import { useMemo, useState } from "react";
import { useRentalsSync } from "@/lib/stores/rentalsStore";
import { statusStyle } from "@/constants/rentalStatus";

const statusFilters = ["Semua", "Aktif", "Menunggu verifikasi", "Selesai", "Ditolak"];

export default function AdminHistoryPage() {
  const rentals = useRentalsSync();
  const [activeStatus, setActiveStatus] = useState("Semua");

  const filtered = useMemo(() => {
    if (activeStatus === "Semua") return rentals;
    return rentals.filter((t) => t.status === activeStatus);
  }, [activeStatus, rentals]);

  return (
    <div className="space-y-6">
      {/* Header Standar Admin */}
      <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 lg:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
                Panel Admin
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Log & Arsip</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Histori Peminjaman Seluruh Pengguna
            </h1>
            <p className="mt-1.5 text-sm text-ink/65 max-w-2xl">
              Seluruh jejak transaksi sewa alat dari semua peminjam, mulai dari tahap diajukan, aktif diambil, hingga pengembalian selesai.
            </p>
          </div>
          <span className="rounded-full bg-ridge px-3.5 py-1 font-mono text-xs font-semibold text-fog shadow-sm">
            {filtered.length} Transaksi Ditampilkan
          </span>
        </div>

        {/* Filter Status Pills Terstandar */}
        <div className="mt-5 pt-4 border-t border-line/60 flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeStatus === s
                  ? "bg-ridge text-fog shadow-sm"
                  : "border border-line bg-white/60 text-ink/70 hover:border-ridge/40 hover:bg-white"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Histori Terstandar */}
      <div className="rounded-2xl overflow-hidden border border-line bg-white/70 shadow-sm backdrop-blur-md">
        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper/50 text-xs uppercase font-semibold text-ink/60">
                <th className="px-5 py-3.5">ID Transaksi</th>
                <th className="px-5 py-3.5">Nama Peminjam</th>
                <th className="px-5 py-3.5">Peralatan Sewa</th>
                <th className="px-5 py-3.5">Periode Sewa</th>
                <th className="px-5 py-3.5">Total Biaya</th>
                <th className="px-5 py-3.5 text-right">Status Terkini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink/70">
                    <span className="rounded bg-ridge/10 px-2 py-0.5 text-ridge border border-ridge/20">
                      {t.id}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-ink">{t.user || t.name}</td>
                  <td className="px-5 py-3.5 text-ink/80 text-xs">{t.item}</td>
                  <td className="px-5 py-3.5 text-ink/70 text-xs">{t.date}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-ink">
                    Rp{Number(t.total || t.total_price || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[t.status] || "bg-line text-ink/60"
                        }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-paper border border-line text-ink/40 font-mono text-xs mb-3">
                      0
                    </div>
                    <div className="text-sm font-semibold text-ink">
                      Tidak ada transaksi {activeStatus !== "Semua" ? `dengan status "${activeStatus}"` : "tercatat"}.
                    </div>
                    <div className="mt-1 text-xs text-ink/50">
                      Data transaksi baru dari peminjam akan muncul secara otomatis di sini.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

