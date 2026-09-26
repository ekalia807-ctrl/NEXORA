"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/lib/hooks/useRole";
import { logoutAction } from "@/app/actions/auth";

// Menu lengkap khusus peminjam mencakup seluruh rute /user/*
const menuUser = [
  { href: "/user/katalog", label: "Katalog Alat" },
  { href: "/user/rekomendasi", label: "Rekomendasi Rombongan" },
  { href: "/user/wishlist", label: "Wishlist Saya" },
  { href: "/user/kalkulator", label: "Kalkulator Biaya" },
  { href: "/user/checkout", label: "Checkout Sewa" },
  { href: "/user/riwayat", label: "Riwayat & Status" },
  { href: "/user/profil", label: "Profil Saya" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const role = useRole();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    try {
      await logoutAction();
    } catch {}
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("role-changed"));
    router.push("/login");
  }

  return (
    <aside className="h-fit w-full shrink-0 rounded-2xl border border-line bg-white/70 shadow-sm backdrop-blur-md lg:sticky lg:top-24 lg:w-64 overflow-hidden">
      {/* Header — jadi tombol toggle di layar mobile */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:block">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink/50">
            Masuk sebagai: <span className="font-bold text-ink capitalize">{role || "Peminjam"}</span>
          </span>
          <h2 className="mt-0.5 font-display text-lg font-bold text-ink">
            Panel Pengguna
          </h2>
        </div>

        <button
          className="lg:hidden p-2 rounded-lg text-ink/70 hover:bg-paper transition-colors"
          aria-label="Buka menu user"
          onClick={() => setOpen(!open)}
        >
          <span className="block h-0.5 w-5 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-5 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-3.5 bg-ink" />
        </button>
      </div>

      {/* Navigasi Panel User */}
      <nav className={`${open ? "flex" : "hidden"} flex-col gap-1 p-3 lg:flex`}>
        {menuUser.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-ridge text-fog shadow-sm"
                  : "text-ink/70 hover:bg-paper/80 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={`${open ? "block" : "hidden"} border-t border-line/60 p-3 lg:block`}>
        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-line bg-paper/40 px-3.5 py-2.5 text-left text-sm font-medium text-ink/70 hover:border-alert/40 hover:bg-alert/10 hover:text-alert transition-all duration-200"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
