"use client";

import { useState } from "react";
import Link from "next/link";
import { categories, stockLabel, stockColor, useCatalog } from "@/lib/catalogStore";
import { useRole } from "@/lib/useRole";

export default function UserKatalogPage() {
  const gear = useCatalog();
  const role = useRole();
  const [active, setActive] = useState("Semua");

  const filtered =
    active === "Semua" ? gear : gear.filter((item) => item.category === active);

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Katalog Alat</h1>
          <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
            {role ? "Peminjam" : "Tamu"}
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Ketersediaan diperbarui secara real-time. Indikator warna menunjukkan status stok alat yang siap disewa.
        </p>

        {!role && (
          <div className="mt-4 flex flex-col gap-2 rounded-sm border border-line bg-paper/60 p-3 text-xs text-ink/70 sm:flex-row sm:items-center sm:justify-between">
            <span>
              💡 Anda sedang menjelajah sebagai <strong>Tamu</strong>. Anda dapat melihat seluruh katalog, dan akan diarahkan masuk saat ingin mengajukan sewa.
            </span>
            <Link
              href="/login"
              className="shrink-0 font-semibold text-ink underline underline-offset-2 hover:text-amber transition-colors"
            >
              Masuk sekarang →
            </Link>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                active === cat
                  ? "border-ridge bg-ridge text-fog font-medium"
                  : "border-line text-ink/70 hover:border-ink/40 bg-paper/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => {
          const checkoutPath = `/user/checkout?alat=${encodeURIComponent(item.name)}`;
          const targetUrl = role
            ? checkoutPath
            : `/login?redirect=${encodeURIComponent(checkoutPath)}`;

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between border border-line bg-white/40 p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {item.name}
                  </h3>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink/60">
                    <span className={`status-dot ${stockColor[item.stock]}`} />
                    {stockLabel[item.stock]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/60">{item.note}</p>
              </div>

              <div className="mt-6">
                <div className="flex items-end justify-between border-t border-line/60 pt-4">
                  <div>
                    <div className="font-mono text-sm font-semibold text-ink">
                      Rp{item.price.toLocaleString("id-ID")}
                    </div>
                    <div className="text-xs text-ink/50">{item.unit}</div>
                  </div>
                  <div className="text-xs text-ink/50">{item.provider}</div>
                </div>

                <Link
                  href={item.stock === "merah" ? "#" : targetUrl}
                  aria-disabled={item.stock === "merah"}
                  className={`mt-4 block rounded-sm py-2 text-center text-sm font-medium transition-colors ${
                    item.stock === "merah"
                      ? "cursor-not-allowed bg-line text-ink/40"
                      : "bg-ridge text-fog hover:bg-ink"
                  }`}
                >
                  {item.stock === "merah" ? "Tidak tersedia" : "Ajukan sewa"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
