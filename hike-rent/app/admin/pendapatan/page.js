"use client";

import { useMemo } from "react";
import { useRentalsSync } from "@/lib/stores/rentalsStore";

function formatMonth(yearMonth) {
  try {
    const [year, month] = yearMonth.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  } catch {
    return yearMonth;
  }
}

export default function AdminRevenuePage() {
  const rentals = useRentalsSync();

  const counted = useMemo(() => {
    return rentals.filter((t) => t.status === "Selesai" || t.status === "Aktif");
  }, [rentals]);

  const monthly = useMemo(() => {
    const byMonth = {};
    for (const t of counted) {
      const monthKey =
        t.start_date?.slice(0, 7) ||
        (t.created_at ? t.created_at.slice(0, 7) : new Date().toISOString().slice(0, 7));
      byMonth[monthKey] = (byMonth[monthKey] || 0) + Number(t.total || t.total_price || 0);
    }
    return Object.keys(byMonth)
      .sort()
      .map((month) => ({ month, total: byMonth[month] }));
  }, [counted]);

  const totalPendapatan = monthly.reduce((sum, m) => sum + m.total, 0);
  const maxBulan = Math.max(...monthly.map((m) => m.total), 1);
  const rataRata = monthly.length ? Math.round(totalPendapatan / monthly.length) : 0;

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
              <span className="font-mono text-[11px] text-ink/50">Keuangan & Rekap</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Rekap Penghasilan Rental
            </h1>
            <p className="mt-1.5 text-sm text-ink/65 max-w-2xl">
              Total omzet dan tren finansial dari seluruh transaksi sewa yang sedang aktif maupun telah selesai dikembalikan.
            </p>
          </div>
          <span className="rounded-full bg-ridge px-3.5 py-1 font-mono text-xs font-semibold text-fog shadow-sm">
            {counted.length} Transaksi Terhitung
          </span>
        </div>
      </div>

      {/* Kartu Metrik Keuangan */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-ridge/80 bg-ridge p-6 text-fog shadow-sm backdrop-blur-md">
          <div className="font-mono text-xs font-semibold tracking-wider text-amber uppercase">TOTAL PENDAPATAN RIIL</div>
          <div className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Rp{totalPendapatan.toLocaleString("id-ID")}
          </div>
          <p className="mt-2 text-xs text-fog/70">Akumulasi sewa selesai & aktif di database</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-6 shadow-sm backdrop-blur-md">
          <div className="font-mono text-xs font-semibold tracking-wider text-ink/50 uppercase">RATA-RATA OMZET / BULAN</div>
          <div className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Rp{rataRata.toLocaleString("id-ID")}
          </div>
          <p className="mt-2 text-xs text-ink/55">Berdasarkan {monthly.length} periode bulan transaksi</p>
        </div>
      </div>

      {/* Grafik Tren Bulanan */}
      <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 shadow-sm backdrop-blur-md">
        <div className="border-b border-line/60 pb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Tren Penghasilan Bulanan</h2>
          <span className="font-mono text-xs text-ink/50">Grafik Performa</span>
        </div>
        {monthly.length === 0 ? (
          <div className="py-12 text-center text-sm text-ink/50 font-mono">
            Belum ada data transaksi bulanan yang aktif atau selesai.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {monthly.map((m) => (
              <div key={m.month}>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-ink/80">{formatMonth(m.month)}</span>
                  <span className="font-mono font-semibold text-ink">
                    Rp{m.total.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="mt-2 h-3 w-full rounded-full bg-line/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-ridge transition-all duration-500"
                    style={{ width: `${Math.max(5, (m.total / maxBulan) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabel Rincian Transaksi */}
      <div className="rounded-2xl overflow-hidden border border-line bg-white/70 shadow-sm backdrop-blur-md">
        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper/50 text-xs uppercase font-semibold text-ink/60">
                <th className="px-5 py-3.5">ID Transaksi</th>
                <th className="px-5 py-3.5">Nama Peminjam</th>
                <th className="px-5 py-3.5">Periode Sewa</th>
                <th className="px-5 py-3.5 text-right">Nominal Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {counted.map((t) => (
                <tr key={t.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink/70">
                    <span className="rounded bg-ridge/10 px-2 py-0.5 text-ridge border border-ridge/20">
                      {t.id}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-ink">{t.user || t.name}</td>
                  <td className="px-5 py-3.5 text-ink/70 text-xs">{t.date}</td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-ink">
                    Rp{Number(t.total || t.total_price || 0).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
              {counted.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-ink/50 font-mono">
                    Belum ada riwayat transaksi pendapatan tercatat.
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

