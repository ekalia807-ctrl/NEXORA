"use client";

import Link from "next/link";
import { useCatalogSync } from "@/lib/catalogStore";
import { useRentalsSync } from "@/lib/rentalsStore";

export default function AdminDashboardPage() {
  const gear = useCatalogSync();
  const rentals = useRentalsSync();

  const totalAlat = gear.length;
  const alatHabis = gear.filter((item) => item.stock === "merah").length;
  const menungguVerifikasi = rentals.filter(
    (t) => t.status === "Menunggu verifikasi" || t.status === "diajukan"
  ).length;

  const uniqueUsers = new Set();
  for (const t of rentals) {
    if (t.user || t.name) uniqueUsers.add(t.user || t.name);
  }
  const totalPengguna = Math.max(uniqueUsers.size, rentals.length > 0 ? 1 : 0);

  const pendapatanSelesai = rentals
    .filter((t) => t.status === "Selesai" || t.status === "Aktif")
    .reduce((sum, t) => sum + Number(t.total || t.total_price || 0), 0);

  const aktivitasTerbaru = [...rentals].slice(0, 5);

  const stats = [
    {
      label: "TOTAL ALAT",
      value: `${totalAlat} Item`,
      note: totalAlat > 0 ? `${alatHabis} alat sedang habis` : "Data tersinkron dari DB",
    },
    {
      label: "MENUNGGU VERIFIKASI",
      value: `${menungguVerifikasi} Pengajuan`,
      note: menungguVerifikasi > 0 ? "Perlu ditinjau admin" : "Tidak ada antrean pending",
    },
    {
      label: "TOTAL PEMINJAM",
      value: `${totalPengguna} Akun`,
      note: totalPengguna > 0 ? "Tercatat di transaksi sewa" : "Belum ada peminjam aktif",
    },
    {
      label: "TOTAL PENDAPATAN",
      value: `Rp${pendapatanSelesai.toLocaleString("id-ID")}`,
      note: "Dari sewa selesai & aktif",
    },
  ];

  const quickLinks = [
    { href: "/admin/katalog", label: "Kelola Katalog" },
    { href: "/admin/packages", label: "Kelola Paket Bundling" },
    { href: "/admin/approval", label: "Approval Pengajuan" },
    { href: "/admin/accounts", label: "Akun Pengguna" },
    { href: "/admin/pendapatan", label: "Rekap Penghasilan" },
  ];

  return (
    <div className="space-y-8">
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Dashboard Admin</h1>
          <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
            Panel Admin
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Ringkasan operasional NEXORA: stok alat, pengajuan, peminjam, dan pendapatan riil dari database.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-line bg-white/40 p-6">
            <div className="font-mono text-xs text-ink/50">{s.label}</div>
            <div className="mt-2 font-display text-2xl font-bold text-ink">{s.value}</div>
            <p className="mt-1 text-xs text-ink/60">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="border border-line bg-white/40 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Aktivitas Terbaru</h2>
          {aktivitasTerbaru.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink/50">
              Belum ada aktivitas transaksi sewa yang tercatat.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-line">
              {aktivitasTerbaru.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-mono text-xs text-ink/50">{t.id}</div>
                    <div className="text-sm font-medium text-ink">
                      {t.user || t.name} — {t.item}
                    </div>
                    <div className="text-xs text-ink/50">{t.date}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-line px-3 py-1 text-xs text-ink/60">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/admin/history"
            className="mt-4 inline-block text-xs font-medium text-ridge underline underline-offset-4"
          >
            Lihat semua histori peminjaman →
          </Link>
        </div>

        <div className="border border-line bg-white/40 p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Akses Cepat</h2>
          <div className="mt-4 flex flex-col gap-2">
            {quickLinks.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="rounded-sm border border-line px-4 py-2.5 text-sm text-ink/80 hover:border-ridge hover:text-ink transition-colors"
              >
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
