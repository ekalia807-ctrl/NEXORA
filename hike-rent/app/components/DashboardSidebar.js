"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/lib/useRole";

const menuUser = [
  { href: "/dashboard", label: "Ringkasan" },
  { href: "/dashboard/profil", label: "Profil Saya" },
  { href: "/riwayat", label: "Riwayat & Status" },
];

const menuAdmin = [{ href: "/admin/approval", label: "Approval Pengajuan" }];

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

  const items = role === "admin" ? [...menuUser, ...menuAdmin] : menuUser;

  return (
    <aside className="w-full shrink-0 border-b border-line bg-white/40 md:w-60 md:border-b-0 md:border-r">
      {/* Header — selalu tampil, jadi tombol toggle di mobile */}
      <div className="flex items-center justify-between px-5 py-4 md:block md:py-5">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wide text-ink/40">
            Masuk sebagai
          </div>
          <div className="mt-1 text-sm font-medium capitalize text-ink">
            {role || "Tamu"}
          </div>
        </div>

        <button
          className="md:hidden"
          aria-label="Buka menu dashboard"
          onClick={() => setOpen(!open)}
        >
          <span className="block h-0.5 w-6 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-6 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-4 bg-ink" />
        </button>
      </div>

      {/* Menu — di mobile cuma tampil kalau open=true, di desktop selalu tampil */}
      <nav className={`${open ? "flex" : "hidden"} flex-col gap-1 px-3 pb-4 md:flex`}>
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`rounded-sm px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-ridge text-fog"
                  : "text-ink/70 hover:bg-paper hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={`${open ? "block" : "hidden"} border-t border-line px-3 py-3 md:block md:mt-auto`}>
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