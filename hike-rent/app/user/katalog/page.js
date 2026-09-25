"use client";

import Link from "next/link";
import CatalogView from "@/components/shared/CatalogView";
import { useRole } from "@/lib/useRole";

export default function UserKatalogPage() {
  const role = useRole();

  return (
    <div className="space-y-8">
      {/* Header Halaman Katalog User */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-ridge via-[#25362c] to-ridge p-6 sm:p-10 text-fog shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber">
                Basecamp NEXORA
              </span>
              <span className="h-1 w-1 rounded-full bg-fog/40" />
              <span className="font-mono text-[11px] text-fog/60">Katalog Peralatan</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-fog sm:text-4xl">
              Katalog Alat Pendakian
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-fog/80">
              Temukan perlengkapan pendakian berkualitas tinggi, terawat, dan siap menemani petualanganmu.
              Cek stok real-time, simpan ke wishlist, atau langsung ajukan sewa.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full border border-fog/20 bg-fog/10 px-3.5 py-1 font-mono text-xs text-fog backdrop-blur-sm">
              {role ? "Peminjam Terdaftar" : "Tamu"}
            </span>
          </div>
        </div>

        {/* Legenda Ketersediaan Stok */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-fog/15 pt-4 text-xs text-fog/80">
          <span className="font-medium text-fog">Status Stok:</span>
          <span className="flex items-center gap-1.5 rounded-full bg-fog/10 px-2.5 py-1">
            <span className="h-2 w-2 rounded-full bg-moss" /> Tersedia
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-fog/10 px-2.5 py-1">
            <span className="h-2 w-2 rounded-full bg-amber" /> Terbatas
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-fog/10 px-2.5 py-1">
            <span className="h-2 w-2 rounded-full bg-alert" /> Habis
          </span>
        </div>
      </section>

      {/* Tampilan Katalog dengan Filter & Search */}
      <CatalogView />
    </div>
  );
}
