"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/useRole";

const menuUser = [
  { name: "Ringkasan / Status", href: "/dashboard" },
  { name: "Profil Saya", href: "/dashboard/profil" },
  { name: "Riwayat Sewa", href: "/riwayat" },
];

const menuAdmin = [{ name: "Approval Pengajuan", href: "/admin/approval" }];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const role = useRole();

  function handleLogout() {
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("role-changed"));
    router.push("/login");
  }

  const menuItems = role === "admin" ? [...menuUser, ...menuAdmin] : menuUser;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

        {/* Sidebar Kiri */}
        <aside className="h-fit border border-line bg-white/40 p-6 lg:sticky lg:top-24">
          <div className="border-b border-line pb-4">
            <span className="font-mono text-xs text-ink/50">
              AKUN SAYA · <span className="capitalize">{role || "Tamu"}</span>
            </span>
            <h2 className="mt-0.5 font-display text-lg font-semibold text-ink">
              Dashboard
            </h2>
          </div>

          <nav className="mt-6 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-sm px-3 py-2 text-sm text-ink/70 transition-colors hover:bg-ridge hover:text-fog"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-8 border-t border-line pt-4">
            <button
              onClick={handleLogout}
              className="block w-full rounded-sm border border-line px-3 py-2 text-center text-xs font-medium text-ink transition-colors hover:bg-ink hover:text-fog"
            >
              Keluar (Logout)
            </button>
          </div>
        </aside>

        {/* Konten Utama Dashboard di Kanan */}
        <main className="min-h-[60vh]">{children}</main>
      </div>
    </div>
  );
}