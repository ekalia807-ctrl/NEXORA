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
      {/* Header Standar Admin */}
      <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 lg:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
                Panel Admin
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Laporan & Analitik</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Laporan Performa Operasional
            </h1>
            <p className="mt-1.5 text-sm text-ink/65 max-w-2xl">
              Ringkasan performa operasional NEXORA berdasarkan seluruh data transaksi sewa riil dan ketersediaan inventaris live.
            </p>
          </div>
          <span className="rounded-full bg-ridge px-3.5 py-1 font-mono text-xs font-semibold text-fog shadow-sm">
            Sistem Terintegrasi
          </span>
        </div>
      </div>

      {/* Grid Kartu Metrik */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 shadow-sm backdrop-blur-md">
          <div className="font-mono text-xs font-semibold tracking-wider text-ink/50 uppercase">TOTAL TRANSAKSI PENGAJUAN</div>
          <div className="mt-2 font-display text-3xl font-bold text-ink">{totalTransaksi}</div>
          <p className="mt-1.5 text-xs text-ink/55">Akumulasi seluruh permohonan</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 shadow-sm backdrop-blur-md">
          <div className="font-mono text-xs font-semibold tracking-wider text-ink/50 uppercase">TOTAL PEMINJAM AKTIF</div>
          <div className="mt-2 font-display text-3xl font-bold text-ink">{uniqueUsers}</div>
          <p className="mt-1.5 text-xs text-ink/55">Akun terdata dalam transaksi sewa</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 shadow-sm backdrop-blur-md sm:col-span-2 lg:col-span-1">
          <div className="font-mono text-xs font-semibold tracking-wider text-ink/50 uppercase">KATALOG ALAT LIVE DI BACKEND</div>
          <div className="mt-2 font-display text-3xl font-bold text-ink">{catalog.length}</div>
          <p className="mt-1.5 text-xs text-ink/55">Unit alat terdaftar di database</p>
        </div>
      </div>

      {/* Grid Analisis Status & Kategori */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 shadow-sm backdrop-blur-md">
          <div className="border-b border-line/60 pb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink">
              Distribusi Status Pengajuan
            </h2>
            <span className="font-mono text-xs text-ink/50">Komposisi</span>
          </div>
          <div className="mt-4 space-y-3.5">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink/75">{status}</span>
                <span className="font-mono font-semibold text-ink">
                  {count}{" "}
                  <span className="text-ink/40 font-normal">
                    / {totalTransaksi > 0 ? totalTransaksi : 0}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 shadow-sm backdrop-blur-md">
          <div className="border-b border-line/60 pb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink">
              Peminjaman per Kategori Alat
            </h2>
            <span className="font-mono text-xs text-ink/50">Paling Diminati</span>
          </div>
          <div className="mt-4 space-y-3.5">
            {topCategories.map(([category, count], i) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span className="text-ink/80 flex items-center gap-2">
                  <span className="rounded-full bg-paper border border-line px-2 py-0.5 font-mono text-xs font-semibold text-ink/60">
                    #{i + 1}
                  </span>
                  <span className="font-medium">{category}</span>
                </span>
                <span className="font-mono font-semibold text-ink">{count}x disewa</span>
              </div>
            ))}
            {topCategories.length === 0 && (
              <div className="text-sm text-ink/50 py-8 text-center font-mono">
                Belum ada data kategori alat yang disewa.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

