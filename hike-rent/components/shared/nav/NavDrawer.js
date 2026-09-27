"use client";

import Link from "next/link";
import { Brand } from "./NavBrand";

export default function NavDrawer({
  isOpen,
  onClose,
  role,
  items,
  pathname,
  onLogout,
}) {
  return (
    <>
      {/* Backdrop overlay saat menu samping terbuka */}
      <div
        className={`fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu samping (slide-over dari kiri, searah dengan tombol Menu) */}
      <aside
        aria-label="Navigasi menu samping"
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-full max-w-sm flex-col justify-between border-r border-line bg-paper p-6 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Header drawer */}
          <div className="flex items-center justify-between border-b border-line pb-5">
            <Brand onClick={onClose} role={role} />
            <button
              type="button"
              onClick={onClose}
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
                  : item.href === "/admin/dashboard"
                    ? pathname === item.href
                    : pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                    active
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
              onClick={onLogout}
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
