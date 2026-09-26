"use client";

import { useMemo } from "react";
import { useRentalsSync } from "@/lib/stores/rentalsStore";
import { useCatalogSync } from "@/lib/stores/catalogStore";

export default function AdminReportsPage() {
  const rentals = useRentalsSync();
  const catalog = useCatalogSync();

  const totalTransaksi = rentals.length;

  const statusBreakdown = useMemo(() => {
    const counts = {
      "Aktif": 0,
      "Menunggu verifikasi": 0,
      "Selesai": 0,
      "Ditolak": 0,
    };
    for (const t of rentals) {
      if (counts[t.status] !== undefined) {
        counts[t.status] += 1;
      } else {
        counts[t.status] = 1;
      }
    }
    return counts;
  }, [rentals]);

  const topCategories = useMemo(() => {
    const counts = {};
    for (const t of rentals) {
      if (t.category) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    }
    // Jika belum ada rental, ambil daftar kategori dari katalog live
    if (Object.keys(counts).length === 0) {
      for (const item of catalog) {
        if (item.category) {
          counts[item.category] = 0;
        }
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [rentals, catalog]);

  const uniqueUsers = useMemo(() => {
    const userNames = new Set();
    for (const t of rentals) {
      if (t.user || t.name) userNames.add(t.user || t.name);
    }
    return Math.max(userNames.size, totalTransaksi > 0 ? 1 : 0);
  }, [rentals, totalTransaksi]);

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Laporan</h1>
          <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
            Panel Admin
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Ringkasan performa operasional NEXORA berdasarkan seluruh data transaksi sewa live.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border border-line bg-white/40 p-6">
          <div className="font-mono text-xs text-ink/50">TOTAL PENGAJUAN</div>
          <div className="mt-2 font-display text-2xl font-bold text-ink">{totalTransaksi}</div>
        </div>
        <div className="border border-line bg-white/40 p-6">
          <div className="font-mono text-xs text-ink/50">TOTAL PEMINJAM</div>
          <div className="mt-2 font-display text-2xl font-bold text-ink">{uniqueUsers}</div>
        </div>
        <div className="border border-line bg-white/40 p-6">
          <div className="font-mono text-xs text-ink/50">KATALOG ALAT LIVE</div>
          <div className="mt-2 font-display text-2xl font-bold text-ink">{catalog.length}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-line bg-white/40 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Status Pengajuan
          </h2>
          <div className="mt-4 space-y-3">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-ink/70">{status}</span>
                <span className="font-mono text-ink">
                  {count}{" "}
                  <span className="text-ink/40">
                    / {totalTransaksi > 0 ? totalTransaksi : 0}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-line bg-white/40 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Kategori Alat
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
            {topCategories.length === 0 && (
              <div className="text-sm text-ink/50 py-4 text-center">
                Belum ada data kategori.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
