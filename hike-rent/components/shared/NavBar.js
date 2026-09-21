"use client";

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

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
  { href: "/", label: "Beranda", desc: "Halaman utama HIKERENT" },
  { href: "/katalog", label: "Katalog Alat", desc: "Jelajah peralatan & cek ketersediaan" },
];

// Menu khusus User (Peminjam terdaftar)
const menuUser = [
  { href: "/", label: "Beranda" },
  { href: "/user/dashboard", label: "Ringkasan" },
  { href: "/user/dashboard/profil", label: "Profil Saya" },
  { href: "/user/katalog", label: "Katalog Alat" },
  { href: "/user/kalkulator", label: "Kalkulator Biaya" },
  { href: "/user/checkout", label: "Checkout Sewa" },
  { href: "/user/riwayat", label: "Riwayat & Status" },
  { href: "/user/rekomendasi", label: "Rekomendasi Rombongan" },
];

// Menu khusus Admin
const menuAdmin = [
  { href: "/", label: "Beranda" },
  { href: "/admin/dashboard", label: "Dashboard Admin" },
  { href: "/admin/katalog", label: "Katalog Alat" },
  { href: "/admin/approval", label: "Approval Pengajuan" },
  { href: "/admin/accounts", label: "Akun Pengguna" },
  { href: "/admin/reports", label: "Laporan" },
  { href: "/admin/pendapatan", label: "Rekap Penghasilan" },
  { href: "/admin/history", label: "Histori Peminjaman" },
];

function MountainIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M2 20 9 7l4 7 2.5-4L22 20H2Z" />
    </svg>
  );
}

function Brand({ onClick }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ridge text-amber">
        <MountainIcon />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-ink">HIKERENT</span>
    </Link>
  );
}

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

  async function handleLogout() {
    try {
      await logoutAction();
    } catch { }
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("role-changed"));
    setDrawerOpen(false);
    router.push("/login");
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminArea = pathname?.startsWith("/admin");
  const items = role === "admin" ? menuAdmin : role === "user" ? menuUser : menuGuest;

  return (
    <>
      {/* Header utama: kiri = logo + menu + role, kanan = Keluar / Masuk.
          Di area admin dibuat selebar layar supaya sejajar dengan sidebar. */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-xl">
        <div
          className={`flex h-16 items-center justify-between gap-4 ${isAdminArea ? "px-4 sm:px-6" : "mx-auto max-w-7xl px-6 sm:px-8"
            }`}
        >
          {/* Kiri */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Brand />

            <span className="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />

            {/* Tombol menu samping */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu samping"
              className="flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ridge/40 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ridge"
            >
              <span className="flex w-4 flex-col gap-[3px]" aria-hidden="true">
                <span className="block h-[1.5px] w-full rounded bg-ink" />
                <span className="block h-[1.5px] w-full rounded bg-ink" />
                <span className="block h-[1.5px] w-2.5 rounded bg-ink" />
              </span>
              <span>Menu</span>
            </button>

            {/* Status role */}
            {role ? (
              <span
                className={`hidden rounded-full border px-3 py-1 text-xs font-medium sm:inline-flex ${role === "admin"
                    ? "border-amber/40 bg-amber/10 text-amber"
                    : "border-line bg-white/60 text-ink/70"
                  }`}
              >
                {role === "admin" ? "Admin" : "Peminjam"}
              </span>
            ) : (
              <span className="hidden text-xs text-ink/50 sm:inline-block">Tamu</span>
            )}
          </div>

          {/* Kanan: hanya aksi auth */}
          <div className="flex items-center">
            {role ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:border-alert hover:text-alert focus-visible:outline focus-visible:outline-2 focus-visible:outline-alert sm:inline-block"
              >
                Keluar
              </button>
            ) : !isAuthPage ? (
              <Link
                href="/login"
                className="rounded-full bg-ridge px-5 py-2 text-sm font-medium text-fog transition-colors hover:bg-ink"
              >
                Masuk
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      {/* Backdrop overlay saat menu samping terbuka */}
      <div
        className={`fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs transition-opacity duration-300 ${drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Menu samping (slide-over dari kiri, searah dengan tombol Menu) */}
      <aside
        aria-label="Navigasi menu samping"
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-full max-w-sm flex-col justify-between border-r border-line bg-paper p-6 shadow-2xl transition-transform duration-300 ease-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div>
          {/* Header drawer */}
          <div className="flex items-center justify-between border-b border-line pb-5">
            <Brand onClick={() => setDrawerOpen(false)} />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Tutup menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink/40 hover:bg-white/70"
            >
              ✕
            </button>
          </div>

          {/* Info status pengguna */}
          <div className="mt-5 rounded-xl border border-line bg-white/50 p-4">
            <span className="text-xs text-ink/50">Akses sekarang</span>
            <div className="mt-0.5 font-display text-sm font-semibold capitalize text-ink">
              {role === "admin"
                ? "Administrator"
                : role === "user"
                  ? "Peminjam (Terverifikasi)"
                  : "Tamu (Mode Jelajah)"}
            </div>
            {!role && (
              <p className="mt-1 text-xs text-ink/60">
                Menu kalkulator & riwayat akan tersedia setelah Anda masuk ke akun.
              </p>
            )}
          </div>

          {/* Daftar menu */}
          <nav className="mt-6 flex flex-col gap-1">
            <div className="px-1 pb-1 text-xs font-medium text-ink/40">Menu tersedia</div>
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
                  className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm transition-colors ${active
                      ? "bg-ridge font-medium text-fog"
                      : "text-ink/75 hover:bg-white/70 hover:text-ink"
                    }`}
                >
                  <span>{item.label}</span>
                  {active && <span className="text-xs text-amber">●</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer drawer: aksi keluar hanya untuk user yang sudah login */}
        {role && (
          <div className="border-t border-line pt-5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-lg border border-line bg-white/50 py-2.5 text-sm font-medium text-ink transition-colors hover:border-alert hover:text-alert"
            >
              Keluar dari Akun
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
