"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCatalog, categories, stockLabel, stockColor } from "@/lib/catalogStore";
import { formatRupiah } from "@/lib/hitungBiaya";

const SORT_OPTIONS = [
  { value: "nama-asc", label: "Nama (A-Z)" },
  { value: "harga-asc", label: "Harga terendah" },
  { value: "harga-desc", label: "Harga tertinggi" },
];

export default function CatalogView() {
  const gear = useCatalog();
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [sort, setSort] = useState("nama-asc");

  const filtered = useMemo(() => {
    let result = gear.filter((item) =>
      item.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    if (kategori !== "Semua") {
      result = result.filter((item) => item.category === kategori);
    }

    switch (sort) {
      case "harga-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "harga-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      default:
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [gear, search, kategori, sort]);

  return (
    <div>
      {/* Search & filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama alat..."
          className="w-full border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-ridge sm:max-w-xs"
        />
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-ridge"
        >
          {categories.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-ridge"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-sm text-ink/50">{filtered.length} alat ditemukan</p>

      {filtered.length === 0 ? (
        <p className="mt-10 text-ink/50">Tidak ada alat yang cocok dengan pencarian kamu.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between border border-line bg-white/40 p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">{item.name}</h3>
                  <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-ink/60">
                    {stockLabel[item.stock] || item.stock}
                    <span
                      className={`h-2 w-2 rounded-full ${stockColor[item.stock] || "bg-line"}`}
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-rust">{item.category}</p>
                <p className="mt-3 text-sm text-ink/65">{item.note}</p>
                <p className="mt-1 text-xs text-ink/45">Penyedia: {item.provider}</p>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="font-display text-lg font-semibold text-ink">
                  {formatRupiah(item.price)}
                  <span className="ml-1 text-xs font-normal text-ink/50">
                    /{item.unit.replace("per ", "")}
                  </span>
                </p>
                <Link
                  href={`/user/kalkulator?alatId=${item.id}`}
                  className="rounded-sm bg-ridge px-4 py-2 text-xs font-medium text-fog transition-colors hover:bg-ink"
                >
                  Hitung sewa
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
