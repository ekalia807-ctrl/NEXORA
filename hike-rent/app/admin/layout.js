"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import RequireAuth from "@/components/shared/RequireAuth";

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [{ href: "/admin/dashboard", label: "Dashboard" }],
  },
  {
    title: "Management",
    items: [
      { href: "/admin/katalog", label: "Katalog" },
      { href: "/admin/packages", label: "Paket Bundling" },
      { href: "/admin/approval", label: "Approval" },
    ],
  },
  {
    title: "Users",
    items: [{ href: "/admin/accounts", label: "Akun Pengguna" }],
  },
  {
    title: "Reports",
    items: [
      { href: "/admin/pendapatan", label: "Pendapatan" },
      { href: "/admin/history", label: "Histori" },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

// Semua rute di bawah /admin/* wajib lewat sini dulu.
// RequireAuth allow=["admin"] artinya: kalau belum login -> /login,
// kalau login tapi role "user" -> otomatis dilempar ke /user/dashboard.
// Header (logo, Menu, Keluar) dipegang NavBar setinggi 4rem; sidebar menempel di bawahnya.
export default function AdminLayout({ children }) {
  const pathname = usePathname() || "";

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <RequireAuth allow={["admin"]}>
      <div className="min-h-[calc(100vh-4rem)] bg-[#f3f1ea] text-ink lg:flex">
        {/* Sidebar — desktop */}
        <aside className="hidden overflow-hidden bg-[#123B2E] text-white lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0 lg:flex-col">
          {/* Garis kontur peta, dekorasi tipis di bawah sidebar */}
          <svg
            aria-hidden="true"
            viewBox="0 0 256 260"
            className="pointer-events-none absolute bottom-0 left-0 w-full text-white/[0.08]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <g transform="translate(140 235) rotate(-18)">
              <ellipse cx="0" cy="0" rx="160" ry="96" />
              <ellipse cx="6" cy="-2" rx="132" ry="78" />
              <ellipse cx="12" cy="-4" rx="105" ry="62" />
              <ellipse cx="16" cy="-7" rx="80" ry="46" />
              <ellipse cx="20" cy="-9" rx="57" ry="31" />
              <ellipse cx="22" cy="-11" rx="34" ry="18" />
            </g>
          </svg>

          <nav className="relative flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="px-3 pb-1.5 text-xs font-medium text-white/40">
                  {group.title}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`relative block rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${active
                            ? "bg-white/[0.12] font-medium text-white"
                            : "text-white/70 hover:bg-white/[0.07] hover:text-white"
                          }`}
                      >
                        {active && (
                          <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-amber-400" />
                        )}
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Navigasi horizontal — mobile & tablet, menempel di bawah header */}
        <div className="sticky top-16 z-30 bg-[#123B2E] lg:hidden">
          <nav className="flex gap-1.5 overflow-x-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ALL_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors ${active
                      ? "bg-amber-400 font-medium text-[#123B2E]"
                      : "bg-white/10 text-white/80 hover:bg-white/15"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Konten (div, bukan <main>, karena root layout sudah punya <main>) */}
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
