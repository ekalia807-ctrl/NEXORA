"use client";

import { useMemo } from "react";
import { useRentalsSync } from "@/lib/rentalsStore";

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
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Rekap Penghasilan</h1>
          <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
            Panel Admin
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Total pendapatan dari transaksi sewa yang selesai atau sedang berjalan.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border border-line bg-ridge p-6 text-fog">
          <div className="font-mono text-xs text-fog/60">TOTAL PENDAPATAN</div>
          <div className="mt-2 font-display text-3xl font-bold">
            Rp{totalPendapatan.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="border border-line bg-white/40 p-6">
          <div className="font-mono text-xs text-ink/50">RATA-RATA PER BULAN</div>
          <div className="mt-2 font-display text-3xl font-bold text-ink">
            Rp{rataRata.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      <div className="border border-line bg-white/40 p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Tren Bulanan</h2>
        {monthly.length === 0 ? (
          <div className="mt-6 py-8 text-center text-sm text-ink/50">
            Belum ada data transaksi bulanan yang aktif atau selesai.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {monthly.map((m) => (
              <div key={m.month}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink/70">{formatMonth(m.month)}</span>
                  <span className="font-mono text-ink">
                    Rp{m.total.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full bg-line">
                  <div
                    className="h-2.5 bg-ridge"
                    style={{ width: `${(m.total / maxBulan) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto border border-line bg-white/40">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase text-ink/50">
              <th className="px-4 py-3 font-medium">ID Transaksi</th>
              <th className="px-4 py-3 font-medium">Pengguna</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {counted.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-mono text-xs text-ink/50">{t.id}</td>
                <td className="px-4 py-3 text-ink/80">{t.user || t.name}</td>
                <td className="px-4 py-3 text-ink/70">{t.date}</td>
                <td className="px-4 py-3 text-right font-mono text-ink">
                  Rp{Number(t.total || t.total_price || 0).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
            {counted.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-ink/50">
                  Belum ada transaksi pendapatan tercatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
