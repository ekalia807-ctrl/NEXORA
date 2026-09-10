"use client";

import { useState } from "react";
import Link from "next/link";

function recommend(people, nights) {
  const p = Math.max(people, 1);
  const n = Math.max(nights, 1);

  return [
    {
      name: "Tenda dome (4 orang)",
      qty: Math.ceil(p / 4),
      reason: "1 tenda per 4 orang supaya tidak sesak.",
    },
    {
      name: "Sleeping bag -5°C",
      qty: p,
      reason: "1 per orang.",
    },
    {
      name: "Matras gulung",
      qty: p,
      reason: "1 per orang.",
    },
    {
      name: "Carrier 60–80L",
      qty: p,
      reason: "1 per orang untuk bawa perlengkapan pribadi.",
    },
    {
      name: "Kompor portable + gas",
      qty: Math.ceil(p / 4),
      reason: "1 set masak per 4 orang, cukup untuk masak bergantian.",
    },
    {
      name: "Nesting set",
      qty: Math.ceil(p / 4),
      reason: "Mengikuti jumlah kompor.",
    },
    {
      name: "GPS handheld / kompas",
      qty: Math.ceil(p / 6),
      reason: "1 alat navigasi per 6 orang, cadangan bila rombongan terpisah.",
    },
  ].map((item) => ({ ...item, nights: n }));
}

export default function RekomendasiPage() {
  const [people, setPeople] = useState(6);
  const [nights, setNights] = useState(2);
  const [result, setResult] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    setResult(recommend(people, nights));
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <h1 className="font-display text-4xl font-bold text-ink">
        Rekomendasi rombongan
      </h1>
      <p className="mt-3 max-w-prose text-ink/65">
        Masukkan jumlah personel dan durasi trip, sistem menyusun daftar alat
        yang sesuai supaya tidak ada yang kelewat atau berlebih.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-10 grid gap-5 border border-line bg-white/40 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="block">
          <span className="text-sm text-ink/70">Jumlah personel</span>
          <input
            type="number"
            min={1}
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-ridge"
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink/70">Durasi trip (malam)</span>
          <input
            type="number"
            min={1}
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-ridge"
          />
        </label>
        <button
          type="submit"
          className="rounded-sm bg-ridge px-6 py-2.5 text-sm text-fog hover:bg-ink"
        >
          Susun rekomendasi
        </button>
      </form>

      {result && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            Untuk {people} orang, {nights} malam
          </h2>
          <div className="mt-5 divide-y divide-line border border-line bg-white/40">
            {result.map((item) => (
              <div key={item.name} className="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <div className="font-medium text-ink">{item.name}</div>
                  <div className="mt-1 text-sm text-ink/55">{item.reason}</div>
                </div>
                <span className="shrink-0 font-mono text-sm text-ink/70">
                  {item.qty}×
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/kalkulator"
            className="mt-6 inline-block rounded-sm bg-amber px-6 py-2.5 text-sm font-medium text-ink hover:bg-amber/90"
          >
            Hitung biaya untuk daftar ini
          </Link>
        </div>
      )}
    </section>
  );
}
