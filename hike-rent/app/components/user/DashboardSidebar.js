"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/lib/useRole";

// Menu lengkap khusus peminjam mencakup seluruh rute /user/*
const menuUser = [
  { href: "/user/dashboard", label: "Ringkasan", icon: "◧" },
  { href: "/user/dashboard/profil", label: "Profil Saya", icon: "👤" },
  { href: "/user/katalog", label: "Katalog Alat", icon: "🎒" },
  { href: "/user/kalkulator", label: "Kalkulator Biaya", icon: "🧮" },
  { href: "/user/checkout", label: "Checkout Sewa", icon: "📝" },
  { href: "/user/riwayat", label: "Riwayat & Status", icon: "🕘" },
  { href: "/user/rekomendasi", label: "Rekomendasi Rombongan", icon: "👥" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const role = useRole();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("role-changed"));
    router.push("/login");
  }

  return (
    <aside className="h-fit w-full shrink-0 border border-line bg-white/40 lg:sticky lg:top-24 lg:w-64">
      {/* Header — jadi tombol toggle di layar mobile */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:block">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink/50">
            Masuk sebagai: <span className="font-bold text-ink capitalize">{role || "Peminjam"}</span>
          </span>
          <h2 className="mt-0.5 font-display text-lg font-semibold text-ink">
            Panel Pengguna
          </h2>
        </div>

        <button
          className="lg:hidden"
          aria-label="Buka menu user"
          onClick={() => setOpen(!open)}
        >
          <span className="block h-0.5 w-6 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-6 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-4 bg-ink" />
        </button>
      </div>

      {/* Navigasi Panel User */}
      <nav className={`${open ? "flex" : "hidden"} flex-col gap-1 px-3 py-4 lg:flex`}>
        {menuUser.map((item) => {
          const active =
            item.href === "/user/dashboard"
              ? pathname === "/user/dashboard"
              : pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-ridge text-fog font-medium"
                  : "text-ink/70 hover:bg-paper hover:text-ink"
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={`${open ? "block" : "hidden"} border-t border-line px-3 py-3 lg:block`}>
        <button
          onClick={handleLogout}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-left text-sm text-ink/70 hover:border-alert hover:text-alert transition-colors"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
