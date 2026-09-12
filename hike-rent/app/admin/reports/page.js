"use client";

import { rentalTransactions } from "@/lib/admin/rentals";
import { initialAccounts } from "@/lib/admin/accounts";

function buildStatusBreakdown() {
  const counts = {};
  for (const t of rentalTransactions) {
    counts[t.status] = (counts[t.status] || 0) + 1;
  }
  return counts;
}

function buildTopCategories() {
  const counts = {};
  for (const t of rentalTransactions) {
    counts[t.category] = (counts[t.category] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

export default function AdminReportsPage() {
  const totalTransaksi = rentalTransactions.length;
  const statusBreakdown = buildStatusBreakdown();
  const topCategories = buildTopCategories();
  const totalPengguna = initialAccounts.length;
  const penggunaAktif = initialAccounts.filter((a) => a.status === "Aktif").length;

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Laporan</h1>
        <p className="mt-2 text-sm text-ink/65">
          Ringkasan performa operasional NEXORA berdasarkan seluruh data pengajuan.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border border-line bg-white/40 p-6">
          <div className="font-mono text-xs text-ink/50">TOTAL PENGAJUAN</div>
          <div className="mt-2 font-display text-2xl font-bold text-ink">{totalTransaksi}</div>
        </div>
        <div className="border border-line bg-white/40 p-6">
          <div className="font-mono text-xs text-ink/50">TOTAL PENGGUNA</div>
          <div className="mt-2 font-display text-2xl font-bold text-ink">{totalPengguna}</div>
        </div>
        <div className="border border-line bg-white/40 p-6">
          <div className="font-mono text-xs text-ink/50">PENGGUNA AKTIF</div>
          <div className="mt-2 font-display text-2xl font-bold text-ink">{penggunaAktif}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-line bg-white/40 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Status pengajuan
          </h2>
          <div className="mt-4 space-y-3">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-ink/70">{status}</span>
                <span className="font-mono text-ink">
                  {count} <span className="text-ink/40">/ {totalTransaksi}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-line bg-white/40 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Kategori alat terlaris
          </h2>
          <div className="mt-4 space-y-3">
            {topCategories.map(([category, count], i) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span className="text-ink/70">
                  <span className="mr-2 font-mono text-xs text-ink/40">#{i + 1}</span>
                  {category}
                </span>
                <span className="font-mono text-ink">{count}x disewa</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
