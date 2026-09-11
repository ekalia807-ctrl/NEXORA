"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

// localStorage itu "external store" — pakai useSyncExternalStore,
// bukan useState + useEffect, biar gak ada cascading render.
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
  return null; // gak ada localStorage pas render di server
}

export default function NavBar() {
  const role = useSyncExternalStore(subscribe, getRoleSnapshot, getServerRoleSnapshot);
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("role-changed"));
    router.push("/login");
  }

  return (
    // ... bagian JSX di bawahnya biarin sama persis, gak perlu diubah
    <header className="sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-ink">
          NEXORA
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-ink/70 md:flex">
          <Link href="/katalog" className="hover:text-ink transition-colors">Katalog</Link>
          <Link href="/kalkulator" className="hover:text-ink transition-colors">Kalkulator</Link>
          <Link href="/rombongan" className="hover:text-ink transition-colors">Rombongan</Link>
          <Link href="/riwayat" className="hover:text-ink transition-colors">Riwayat</Link>
          
          {role === "admin" && (
            <Link href="/admin/approval" className="font-semibold text-amber hover:text-ink transition-colors">
              Panel Approval
            </Link>
          )}

          {role === "user" && (
            <Link href="/dashboard" className="hover:text-ink transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {role ? (
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-ink/60 uppercase">
                ({role})
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-sm border border-line px-4 py-2 text-xs font-medium text-ink hover:border-ink/40 transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-sm bg-ridge px-4 py-2 text-xs font-medium text-fog hover:bg-ink transition-colors"
            >
              Masuk / Daftar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}