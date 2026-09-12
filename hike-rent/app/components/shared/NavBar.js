"use client";

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("role-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("role-changed", callback);
  };
}

function getRoleSnapshot() {
  return localStorage.getItem("role");
}

function getServerRoleSnapshot() {
  return null;
}

// Menu khusus Guest (Tamu): Hanya Beranda dan Katalog
const menuGuest = [
  { href: "/", label: "Beranda", icon: "🏠", desc: "Halaman utama NEXORA" },
  { href: "/user/katalog", label: "Katalog Alat", icon: "🎒", desc: "Jelajah peralatan & cek ketersediaan" },
];

// Menu khusus User (Peminjam terdaftar)
const menuUser = [
  { href: "/", label: "Beranda", icon: "🏠" },
  { href: "/user/dashboard", label: "Ringkasan", icon: "◧" },
  { href: "/user/dashboard/profil", label: "Profil Saya", icon: "👤" },
  { href: "/user/katalog", label: "Katalog Alat", icon: "🎒" },
  { href: "/user/kalkulator", label: "Kalkulator Biaya", icon: "🧮" },
  { href: "/user/checkout", label: "Checkout Sewa", icon: "📝" },
  { href: "/user/riwayat", label: "Riwayat & Status", icon: "🕘" },
  { href: "/user/rekomendasi", label: "Rekomendasi Rombongan", icon: "👥" },
];

// Menu khusus Admin
const menuAdmin = [
  { href: "/", label: "Beranda", icon: "🏠" },
  { href: "/admin/dashboard", label: "Dashboard Admin", icon: "◧" },
  { href: "/admin/katalog", label: "Katalog Alat", icon: "🎒" },
  { href: "/admin/approval", label: "Approval Pengajuan", icon: "✔" },
  { href: "/admin/accounts", label: "Akun Pengguna", icon: "👤" },
  { href: "/admin/reports", label: "Laporan", icon: "📊" },
  { href: "/admin/pendapatan", label: "Rekap Penghasilan", icon: "💰" },
  { href: "/admin/history", label: "Histori Peminjaman", icon: "🕘" },
];

export default function NavBar() {
  const role = useSyncExternalStore(subscribe, getRoleSnapshot, getServerRoleSnapshot);
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Tutup drawer saat menekan Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  function handleLogout() {
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("role-changed"));
    setDrawerOpen(false);
    router.push("/login");
  }

  const items = role === "admin" ? menuAdmin : role === "user" ? menuUser : menuGuest;

  return (
    <>
      {/* Header Utama: Bagian tengah sengaja KOSONG */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          {/* Logo Brand */}
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-ink hover:opacity-85 transition-opacity"
          >
            NEXORA
          </Link>

          {/* Bagian tengah KOSONG sesuai instruksi */}
          <div className="flex-1" />

          {/* Sisi Kanan: Status role + Tombol Buka Menu Samping + Tombol Cepat Auth */}
          <div className="flex items-center gap-3">
            {role ? (
              <span
                className={`font-mono text-xs uppercase px-2.5 py-1 rounded-sm border ${
                  role === "admin"
                    ? "border-amber/40 bg-amber/10 text-amber font-semibold"
                    : "border-line bg-white/50 text-ink/70"
                }`}
              >
                {role === "admin" ? "Admin" : "Peminjam"}
              </span>
            ) : (
              <span className="hidden sm:inline-block font-mono text-xs text-ink/50 uppercase px-2 py-0.5">
                Tamu
              </span>
            )}

            {/* Tombol Toggle Menu Samping */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu samping"
              className="flex items-center gap-2.5 rounded-sm border border-line bg-white/60 px-3.5 py-2 text-xs font-semibold text-ink shadow-xs hover:border-ridge hover:bg-paper transition-all"
            >
              <span className="flex flex-col gap-1 w-4" aria-hidden="true">
                <span className="block h-0.5 w-full bg-ink" />
                <span className="block h-0.5 w-full bg-ink" />
                <span className="block h-0.5 w-2.5 bg-ink" />
              </span>
              <span>Menu</span>
            </button>

            {/* Tombol Auth Cepat di Header */}
            {role ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-block rounded-sm border border-line px-3 py-2 text-xs font-medium text-ink/70 hover:border-alert hover:text-alert transition-colors"
              >
                Keluar
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-sm bg-ridge px-4 py-2 text-xs font-medium text-fog hover:bg-ink transition-colors"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop Overlay saat Menu Samping Terbuka */}
      <div
        className={`fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Menu Samping (Slide-over Drawer) */}
      <aside
        aria-label="Navigasi menu samping"
        className={`fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-sm flex-col justify-between border-l border-line bg-paper p-6 shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          {/* Header Drawer */}
          <div className="flex items-center justify-between border-b border-line pb-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                Navigasi
              </span>
              <h2 className="font-display text-xl font-bold text-ink">NEXORA</h2>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Tutup menu"
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-ink hover:border-ink/50 hover:bg-white/60 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Info Status Pengguna di Drawer */}
          <div className="mt-5 rounded-sm border border-line bg-white/40 p-3.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
              Akses Sekarang:
            </span>
            <div className="mt-0.5 font-display text-sm font-semibold text-ink capitalize">
              {role === "admin"
                ? "👑 Administrator"
                : role === "user"
                ? "🎒 Peminjam (Terverifikasi)"
                : "🌐 Tamu (Mode Jelajah)"}
            </div>
            {!role && (
              <p className="mt-1 text-xs text-ink/60">
                Menu kalkulator & riwayat akan tersedia setelah Anda masuk ke akun.
              </p>
            )}
          </div>

          {/* Daftar Menu Navigasi Samping */}
          <nav className="mt-6 flex flex-col gap-1.5">
            <div className="px-1 pb-1 font-mono text-[11px] uppercase tracking-wider text-ink/40">
              Menu Tersedia
            </div>
            {items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : item.href === "/user/dashboard" || item.href === "/admin/dashboard"
                  ? pathname === item.href
                  : pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center justify-between rounded-sm px-3.5 py-3 text-sm transition-all ${
                    active
                      ? "bg-ridge text-fog font-medium shadow-xs"
                      : "text-ink/75 hover:bg-white/60 hover:text-ink border border-transparent hover:border-line/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base" aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {active && <span className="font-mono text-xs text-amber">●</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Drawer: Aksi Masuk / Daftar atau Keluar */}
        <div className="border-t border-line pt-5">
          {role ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-line bg-white/40 py-2.5 text-sm font-medium text-ink hover:border-alert hover:text-alert transition-colors"
            >
              <span>🚪</span>
              <span>Keluar dari Akun</span>
            </button>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setDrawerOpen(false)}
                className="block w-full rounded-sm bg-ridge py-2.5 text-center text-sm font-medium text-fog hover:bg-ink transition-colors"
              >
                Masuk ke Akun
              </Link>
              <Link
                href="/register"
                onClick={() => setDrawerOpen(false)}
                className="block w-full rounded-sm border border-line bg-white/40 py-2 text-center text-xs font-medium text-ink/70 hover:border-ink/50 hover:text-ink transition-colors"
              >
                Daftar Akun Baru
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}