"use client";

import Link from "next/link";
import { useRole } from "@/lib/useRole";
import DashboardSidebar from "@/components/user/DashboardSidebar";
import CatalogView from "@/components/shared/CatalogView";

export default function UserKatalogPage() {
  const role = useRole();

  return (
    <div className={role ? "flex flex-col gap-8 lg:flex-row" : "space-y-6"}>
      {/* Sidebar hanya ditampilkan untuk pengguna yang sudah masuk */}
      {role && <DashboardSidebar />}

      <main className="min-w-0 flex-1 space-y-6">
        <div className="border border-line bg-white/40 p-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-ink">Katalog Alat</h1>
            <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
              {role ? "Peminjam" : "Tamu"}
            </span>
          </div>
          <p className="mt-2 text-sm text-ink/65">
            Cari dan bandingkan alat pendakian yang tersedia untuk disewa.
          </p>

          {/* Banner panduan untuk pengunjung berstatus Tamu */}
          {!role && (
            <div className="mt-4 flex flex-col gap-2 rounded-sm border border-line bg-paper/60 p-3 text-xs text-ink/70 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Anda sedang menjelajah sebagai <strong>Tamu</strong>. Anda dapat melihat seluruh katalog, dan akan diarahkan masuk saat ingin mengajukan sewa.
              </span>
              <Link
                href="/login"
                className="shrink-0 font-semibold text-ink underline underline-offset-2 hover:text-amber transition-colors"
              >
                Masuk sekarang →
              </Link>
            </div>
          )}
        </div>

        <CatalogView />
      </main>
    </div>
  );
}
