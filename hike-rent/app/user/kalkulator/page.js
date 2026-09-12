"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCatalog } from "@/lib/catalogStore";

export default function UserKalkulatorPage() {
  const gear = useCatalog();
  const [selected, setSelected] = useState({});
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const nights = useMemo(() => {
    if (!start || !end) return 0;
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 0;
  }, [start, end]);

  const chosenItems = gear.filter((item) => selected[item.id]);

  const total = chosenItems.reduce((sum, item) => {
    const qty = selected[item.id] || 0;
    return sum + item.price * qty * Math.max(nights, 1);
  }, 0);

  function updateQty(id, qty) {
    setSelected((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[id];
      } else {
        next[id] = qty;
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Kalkulator Biaya</h1>
          <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
            Peminjam
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Pilih tanggal pengambilan, pengembalian, dan alat yang dibutuhkan. Total biaya dihitung otomatis.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="grid gap-4 border border-line bg-white/40 p-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-ink/70">Tanggal ambil</span>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink/70">Tanggal kembali</span>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
              />
            </label>
          </div>

          <div className="divide-y divide-line border border-line bg-white/40">
            {gear.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <div className="font-medium text-ink">{item.name}</div>
                  <div className="font-mono text-xs text-ink/50">
                    Rp{item.price.toLocaleString("id-ID")} {item.unit}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, (selected[item.id] || 0) - 1)}
                    className="flex h-7 w-7 items-center justify-center border border-line text-ink/70 hover:border-ink/50 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-ink">
                    {selected[item.id] || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, (selected[item.id] || 0) + 1)}
                    className="flex h-7 w-7 items-center justify-center border border-line text-ink/70 hover:border-ink/50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit border border-line bg-ridge p-6 text-fog lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Ringkasan Biaya</h2>
          <div className="mt-3 text-sm text-fog/70">
            {nights > 0 ? `${nights} malam` : "Pilih tanggal ambil & kembali"}
          </div>

          <div className="mt-4 space-y-2 border-t border-fog/15 pt-4">
            {chosenItems.length === 0 && (
              <p className="text-sm text-fog/50">Belum ada alat dipilih.</p>
            )}
            {chosenItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-fog/80">
                  {item.name} × {selected[item.id]}
                </span>
                <span className="font-mono text-fog/80">
                  Rp
                  {(item.price * selected[item.id] * Math.max(nights, 1)).toLocaleString(
                    "id-ID"
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-baseline justify-between border-t border-fog/15 pt-4">
            <span className="text-sm text-fog/70">Total estimasi</span>
            <span className="font-display text-2xl font-bold">
              Rp{total.toLocaleString("id-ID")}
            </span>
          </div>

          <Link
            href="/user/checkout"
            className="mt-6 block rounded-sm bg-amber py-2.5 text-center text-sm font-medium text-ink hover:bg-amber/90 transition-colors"
          >
            Lanjut ke Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
