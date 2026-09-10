"use client";

import { useState } from "react";
import Link from "next/link";
import { categories, gear, stockLabel, stockColor } from "../../lib/gear";

export default function KatalogPage() {
  const [active, setActive] = useState("Semua");

  const filtered =
    active === "Semua" ? gear : gear.filter((item) => item.category === active);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
      <h1 className="font-display text-4xl font-bold text-ink">Katalog alat</h1>
      <p className="mt-3 max-w-prose text-ink/65">
        Ketersediaan diperbarui real-time. Warna menunjukkan status stok untuk
        rentang tanggal yang kamu pilih di kalkulator.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              active === cat
                ? "border-ridge bg-ridge text-fog"
                : "border-line text-ink/70 hover:border-ink/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
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

            <div className="mt-6 flex items-end justify-between">
              <div>
                <div className="font-mono text-sm text-ink">
                  Rp{item.price.toLocaleString("id-ID")}
                </div>
                <div className="text-xs text-ink/50">{item.unit}</div>
              </div>
              <div className="text-xs text-ink/50">{item.provider}</div>
            </div>

            <Link
              href={
                item.stock === "merah"
                  ? "#"
                  : `/pengajuan?alat=${encodeURIComponent(item.name)}`
              }
              aria-disabled={item.stock === "merah"}
              className={`mt-5 block rounded-sm py-2.5 text-center text-sm transition-colors ${
                item.stock === "merah"
                  ? "cursor-not-allowed bg-line text-ink/40"
                  : "bg-ridge text-fog hover:bg-ink"
              }`}
            >
              {item.stock === "merah" ? "Tidak tersedia" : "Ajukan sewa"}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
