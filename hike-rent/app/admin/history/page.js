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
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Histori Peminjaman</h1>
          <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
            Panel Admin
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Seluruh transaksi sewa dari semua pengguna, dari yang masih berjalan sampai selesai.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                activeStatus === s
                  ? "border-ridge bg-ridge text-fog"
                  : "border-line text-ink/70 hover:border-ink/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border border-line bg-white/40">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase text-ink/50">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Pengguna</th>
              <th className="px-4 py-3 font-medium">Alat</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-mono text-xs text-ink/50">{t.id}</td>
                <td className="px-4 py-3 font-medium text-ink">{t.user || t.name}</td>
                <td className="px-4 py-3 text-ink/70">{t.item}</td>
                <td className="px-4 py-3 text-ink/70">{t.date}</td>
                <td className="px-4 py-3 font-mono text-ink/80">
                  Rp{Number(t.total || t.total_price || 0).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      statusStyle[t.status] || "bg-line text-ink/60"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-paper border border-line text-ink/40 font-mono text-xs mb-3">
                    0
                  </div>
                  <div className="text-sm font-medium text-ink">
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
  );
}
