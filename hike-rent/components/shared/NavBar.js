"use client";

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction, getMeAction } from "@/app/actions/auth";
import { Brand, ArrowBackIcon, menuGuest, menuUser, menuAdmin } from "./nav/NavBrand";
import NavDrawer from "./nav/NavDrawer";

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

export default function NavBar() {
  const role = useSyncExternalStore(subscribe, getRoleSnapshot, getServerRoleSnapshot);
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auto-sinkronisasi sesi aktif dari server cookie terenkripsi jika localStorage kosong
  useEffect(() => {
    if (!role && typeof window !== "undefined") {
      getMeAction()
        .then((res) => {
          if (res?.success && res.data) {
            const userRole = res.data.role || "user";
            localStorage.setItem("role", userRole);
            localStorage.setItem("user", JSON.stringify(res.data));
            window.dispatchEvent(new Event("role-changed"));
          }
        })
        .catch(() => {});
    }
  }, [role]);

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
  const items = role === "admin" ? menuAdmin : role === "user" ? menuUser : menuGuest;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Kiri: Tombol Back, Brand Logo, Menu samping, Role */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Kembali ke halaman sebelumnya"
              title="Kembali"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-white/70 text-ink transition-colors hover:border-ridge/50 hover:bg-white hover:text-ridge focus-visible:outline focus-visible:outline-2 focus-visible:outline-ridge"
            >
              <ArrowBackIcon className="h-4 w-4" />
            </button>

            <Brand role={role} />

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
                className={`hidden rounded-full border px-3 py-1 text-xs font-medium sm:inline-flex ${
                  role === "admin"
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

      <NavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        role={role}
        items={items}
        pathname={pathname}
        onLogout={handleLogout}
      />
    </>
  );
}
