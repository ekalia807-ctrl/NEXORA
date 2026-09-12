"use client";

import { useMemo, useState } from "react";
import { rentalTransactions, statusStyle } from "@/lib/admin/rentals";

const statusFilters = ["Semua", "Aktif", "Menunggu verifikasi", "Selesai", "Ditolak"];

export default function AdminHistoryPage() {
  const [activeStatus, setActiveStatus] = useState("Semua");

  const filtered = useMemo(() => {
    if (activeStatus === "Semua") return rentalTransactions;
    return rentalTransactions.filter((t) => t.status === activeStatus);
  }, [activeStatus]);

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Histori Peminjaman</h1>
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
                <td className="px-4 py-3 font-medium text-ink">{t.user}</td>
                <td className="px-4 py-3 text-ink/70">{t.item}</td>
                <td className="px-4 py-3 text-ink/70">{t.date}</td>
                <td className="px-4 py-3 font-mono text-ink/80">
                  Rp{t.total.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${statusStyle[t.status]}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink/50">
                  Tidak ada transaksi dengan status ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
