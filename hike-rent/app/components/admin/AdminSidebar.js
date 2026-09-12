"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Menu khusus admin. Terpisah total dari app/components/peminjam/DashboardSidebar.js
// supaya kalau ada perubahan menu admin, gak perlu sentuh kode peminjam sama sekali.
const menuAdmin = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "◧" },
  { href: "/admin/catalog", label: "Katalog Alat", icon: "🎒" },
  { href: "/admin/approval", label: "Approval Pengajuan", icon: "✔" },
  { href: "/admin/accounts", label: "Akun Pengguna", icon: "👤" },
  { href: "/admin/reports", label: "Laporan", icon: "📊" },
  { href: "/admin/revenue", label: "Rekap Penghasilan", icon: "💰" },
  { href: "/admin/history", label: "Histori Peminjaman", icon: "🕘" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("role-changed"));
    router.push("/login");
  }

  return (
    <aside className="h-fit w-full shrink-0 border border-line bg-white/40 lg:sticky lg:top-24 lg:w-64">
      {/* Header — jadi tombol toggle di layar kecil */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:block">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wide text-amber">
            Panel Admin
          </span>
          <h2 className="mt-0.5 font-display text-lg font-semibold text-ink">
            NEXORA Admin
          </h2>
        </div>

        <button
          className="lg:hidden"
          aria-label="Buka menu admin"
          onClick={() => setOpen(!open)}
        >
          <span className="block h-0.5 w-6 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-6 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-4 bg-ink" />
        </button>
      </div>

      <nav className={`${open ? "flex" : "hidden"} flex-col gap-1 px-3 py-4 lg:flex`}>
        {menuAdmin.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-ridge text-fog"
                  : "text-ink/70 hover:bg-paper hover:text-ink"
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={`${open ? "block" : "hidden"} border-t border-line px-3 py-3 lg:block`}>
        <button
          onClick={handleLogout}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-left text-sm text-ink/70 hover:border-alert hover:text-alert"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
