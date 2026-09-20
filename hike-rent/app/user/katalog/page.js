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
        {/* Hero katalog — foto latar + overlay gelap biar teks tetap kebaca */}
        <section className="relative overflow-hidden border border-line">
          <img
            src="https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=1600&q=80"
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/30" />

          <div className="relative p-6 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-fog/70">
                  Basecamp NEXORA
                </p>
                <h1 className="mt-2 font-display text-3xl font-bold text-fog sm:text-4xl">
                  Katalog Alat
                </h1>
              </div>
              <span className="shrink-0 rounded-full border border-fog/30 bg-fog/10 px-3 py-1 font-mono text-xs text-fog">
                {role ? "Peminjam" : "Tamu"}
              </span>
            </div>

            <p className="mt-3 max-w-md text-sm leading-relaxed text-fog/80">
              Cari dan bandingkan alat pendakian yang tersedia untuk disewa.
            </p>

            {/* Legenda status stok */}
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-fog/80">
              <span className="flex items-center gap-1.5 border border-fog/25 px-2.5 py-1">
                <span className="h-2 w-2 rounded-full bg-moss" /> Tersedia
              </span>
              <span className="flex items-center gap-1.5 border border-fog/25 px-2.5 py-1">
                <span className="h-2 w-2 rounded-full bg-amber" /> Terbatas
              </span>
              <span className="flex items-center gap-1.5 border border-fog/25 px-2.5 py-1">
                <span className="h-2 w-2 rounded-full bg-alert" /> Habis
              </span>
            </div>

            {/* Banner panduan untuk pengunjung berstatus Tamu */}
            {!role && (
              <div className="mt-5 flex flex-col gap-2 rounded-sm border border-fog/25 bg-ink/40 p-3 text-xs text-fog/85 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Anda sedang menjelajah sebagai <strong className="text-fog">Tamu</strong>. Anda dapat melihat seluruh katalog, dan akan diarahkan masuk saat ingin mengajukan sewa.
                </span>
                <Link
                  href="/login"
                  className="shrink-0 font-semibold text-fog underline underline-offset-2 transition-colors hover:text-amber"
                >
                  Masuk sekarang →
                </Link>
              </div>
            )}
          </div>
        </section>

        <CatalogView />
      </main>
    </div>
  );
}