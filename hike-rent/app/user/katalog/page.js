"use client";

import Link from "next/link";
import { useCatalogSync } from "@/lib/catalogStore";
import { useRentalsSync } from "@/lib/rentalsStore";

/* ---------- Tampilan saja (ikon & warna), bukan logika data ---------- */
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "h-5 w-5",
  "aria-hidden": true,
};

const BoxIcon = () => (
  <svg {...iconProps}>
    <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);
const ClockIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const UsersIcon = () => (
  <svg {...iconProps}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M17 14c2.5 0 4.5 1.8 4.5 4.5" />
  </svg>
);
const WalletIcon = () => (
  <svg {...iconProps}>
    <path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    <path d="M3 7l12-3v3" />
    <circle cx="17" cy="13.5" r="1" />
  </svg>
);

// Urutannya sama dengan array `stats` di bawah.
const statTheme = [
  { chip: "bg-emerald-100 text-emerald-700", icon: <BoxIcon /> },
  { chip: "bg-amber-100 text-amber-700", icon: <ClockIcon /> },
  { chip: "bg-sky-100 text-sky-700", icon: <UsersIcon /> },
  { chip: "bg-violet-100 text-violet-700", icon: <WalletIcon /> },
];

const statusStyle = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "selesai") return "bg-emerald-100 text-emerald-700";
  if (s === "aktif") return "bg-sky-100 text-sky-700";
  if (s.includes("menunggu") || s === "diajukan") return "bg-amber-100 text-amber-700";
  if (s.includes("tolak") || s.includes("batal")) return "bg-rose-100 text-rose-700";
  return "bg-ink/5 text-ink/60";
};

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
      {/* Page header */}
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#123B2E]">
          Dashboard Admin
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/60">
          Ringkasan operasional HIKE RENT: stok alat, pengajuan, peminjam, dan
          pendapatan riil dari database.
        </p>
      </header>

      {/* Stats */}
      <section
        aria-label="Ringkasan statistik"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((s, i) => {
          const theme = statTheme[i] || statTheme[0];
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-line bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.chip}`}
                >
                  {theme.icon}
                </span>
                <div className="text-sm text-ink/60 lowercase first-letter:uppercase">
                  {s.label}
                </div>
              </div>
              <div className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">
                {s.value}
              </div>
              <p className="mt-1.5 text-xs text-ink/50">{s.note}</p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Aktivitas terbaru */}
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            Aktivitas Terbaru
          </h2>
          {aktivitasTerbaru.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink/50">
              Belum ada aktivitas transaksi sewa yang tercatat.
            </div>
          ) : (
            <div className="mt-2 divide-y divide-line">
              {aktivitasTerbaru.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                      {String(t.user || t.name || "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink">
                        {t.user || t.name} — {t.item}
                      </div>
                      <div className="mt-0.5 flex gap-3 text-xs text-ink/50">
                        <span>{t.id}</span>
                        <span>{t.date}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusStyle(
                      t.status
                    )}`}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/admin/history"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-emerald-800 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            Lihat semua histori peminjaman
            <span aria-hidden="true">›</span>
          </Link>
        </section>

        {/* Akses cepat */}
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            Akses Cepat
          </h2>
          <div className="-mx-2 mt-3 flex flex-col">
            {quickLinks.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm text-ink/80 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
              >
                {q.label}
                <span aria-hidden="true" className="text-ink/30">
                  ›
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
