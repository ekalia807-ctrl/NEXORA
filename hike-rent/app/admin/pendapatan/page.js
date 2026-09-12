"use client";

import { rentalTransactions } from "@/lib/admin/rentals";

const monthLabel = {
  "2026-05": "Mei 2026",
  "2026-06": "Jun 2026",
  "2026-07": "Jul 2026",
  "2026-08": "Agu 2026",
  "2026-09": "Sep 2026",
};

function buildMonthlyRevenue() {
  const counted = rentalTransactions.filter(
    (t) => t.status === "Selesai" || t.status === "Aktif"
  );
  const byMonth = {};
  for (const t of counted) {
    byMonth[t.month] = (byMonth[t.month] || 0) + t.total;
  }
  return Object.keys(byMonth)
    .sort()
    .map((month) => ({ month, total: byMonth[month] }));
}

export default function AdminRevenuePage() {
  const monthly = buildMonthlyRevenue();
  const totalPendapatan = monthly.reduce((sum, m) => sum + m.total, 0);
  const maxBulan = Math.max(...monthly.map((m) => m.total), 1);
  const rataRata = monthly.length ? Math.round(totalPendapatan / monthly.length) : 0;

  const counted = rentalTransactions.filter(
    (t) => t.status === "Selesai" || t.status === "Aktif"
  );

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Rekap Penghasilan</h1>
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
        <h2 className="font-display text-lg font-semibold text-ink">Tren bulanan</h2>
        <div className="mt-6 space-y-4">
          {monthly.map((m) => (
            <div key={m.month}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink/70">{monthLabel[m.month] || m.month}</span>
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
                <td className="px-4 py-3 text-ink/80">{t.user}</td>
                <td className="px-4 py-3 text-ink/70">{t.date}</td>
                <td className="px-4 py-3 text-right font-mono text-ink">
                  Rp{t.total.toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
