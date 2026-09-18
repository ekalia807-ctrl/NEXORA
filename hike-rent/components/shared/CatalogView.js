"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCatalogSync, categories, stockLabel, stockColor } from "@/lib/catalogStore";
import { formatRupiah } from "@/lib/hitungBiaya";
import { useRole } from "@/lib/useRole";
import {
  fetchWishlistAction,
  addToWishlistAction,
  removeFromWishlistAction,
} from "@/app/actions/wishlist";

const SORT_OPTIONS = [
  { value: "nama-asc", label: "Nama (A-Z)" },
  { value: "harga-asc", label: "Harga terendah" },
  { value: "harga-desc", label: "Harga tertinggi" },
];

export default function CatalogView() {
  const router = useRouter();
  const role = useRole();
  const gear = useCatalogSync();
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [sort, setSort] = useState("nama-asc");
  const [wishlist, setWishlist] = useState([]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const availableCategories = useMemo(() => {
    const set = new Set(["Semua"]);
    gear.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [gear]);

  useEffect(() => {
    let active = true;
    async function initWishlist() {
      const res = await fetchWishlistAction();
      if (active && res.success && Array.isArray(res.data)) {
        setWishlist(res.data);
      }
    }
    if (role) {
      initWishlist();
    }
    return () => {
      active = false;
    };
  }, [role]);

  async function handleToggleWishlist(item) {
    if (!role) {
      router.push(`/login?redirect=${encodeURIComponent("/user/katalog")}`);
      return;
    }

    const existing = wishlist.find(
      (w) =>
        String(w.gear_id) === String(item.id) ||
        (w.gear_name && w.gear_name.toLowerCase() === item.name.toLowerCase())
    );

    if (existing) {
      // Hapus dari wishlist
      const res = await removeFromWishlistAction(existing.id);
      if (res.success) {
        setWishlist((prev) => prev.filter((w) => w.id !== existing.id));
      }
    } else {
      // Tambah ke wishlist
      const res = await addToWishlistAction(item.id);
      if (res.success) {
        setWishlist((prev) => [
          ...prev,
          {
            id: res.data?.id || Date.now(),
            gear_id: item.id,
            gear_name: item.name,
            gear_price: item.price,
          },
        ]);
      }
    }
  }

  const filtered = useMemo(() => {
    let result = gear.filter((item) =>
      item.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    if (showWishlistOnly) {
      result = result.filter((item) =>
        wishlist.some(
          (w) =>
            String(w.gear_id) === String(item.id) ||
            (w.gear_name && w.gear_name.toLowerCase() === item.name.toLowerCase())
        )
      );
    }

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
  }, [gear, search, kategori, sort, showWishlistOnly, wishlist]);

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
          {availableCategories.map((k) => (
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

        {/* Filter Wishlist Saya (Khusus Pengguna Login) */}
        {role && (
          <button
            type="button"
            onClick={() => setShowWishlistOnly(!showWishlistOnly)}
            className={`border px-3.5 py-2.5 text-xs font-semibold transition-colors ${
              showWishlistOnly
                ? "border-alert bg-alert/15 text-alert"
                : "border-line bg-paper text-ink/70 hover:border-ink/50"
            }`}
          >
            {showWishlistOnly
              ? `Wishlist Aktif (${wishlist.length})`
              : `Wishlist (${wishlist.length})`}
          </button>
        )}
      </div>

      <p className="mt-4 text-sm text-ink/50">
        {filtered.length} alat ditemukan
        {showWishlistOnly && " (Difilter dari Wishlist)"}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-10 text-ink/50">
          {showWishlistOnly
            ? "Belum ada alat di daftar Wishlist kamu. Klik Simpan pada alat yang kamu sukai."
            : "Tidak ada alat yang cocok dengan pencarian kamu."}
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isWishlisted = wishlist.some(
              (w) =>
                String(w.gear_id) === String(item.id) ||
                (w.gear_name && w.gear_name.toLowerCase() === item.name.toLowerCase())
            );

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between border border-line bg-white/40 p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <h3 className="font-display text-lg font-semibold text-ink">{item.name}</h3>
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(item)}
                        title={isWishlisted ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
                        className={`mt-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                          isWishlisted
                            ? "bg-alert/15 text-alert border border-alert/30"
                            : "bg-paper text-ink/50 hover:text-ink border border-line"
                        }`}
                      >
                        {isWishlisted ? "Tersimpan" : "+ Simpan"}
                      </button>
                    </div>
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

                {(() => {
                  const checkoutPath = `/user/checkout?alat=${encodeURIComponent(item.name)}`;
                  const targetUrl = role
                    ? checkoutPath
                    : `/login?redirect=${encodeURIComponent(checkoutPath)}`;
                  const kalkulatorPath = `/user/kalkulator?alatId=${item.id}`;
                  const hitungUrl = role
                    ? kalkulatorPath
                    : `/login?redirect=${encodeURIComponent(kalkulatorPath)}`;
                  const isOutOfStock = item.stock === "merah";

                  return (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line/40 pt-4">
                      <p className="font-display text-lg font-semibold text-ink">
                        {formatRupiah(item.price)}
                        <span className="ml-1 text-xs font-normal text-ink/50">
                          /{item.unit.replace("per ", "")}
                        </span>
                      </p>
                      <div className="flex items-center gap-2">
                        <Link
                          href={hitungUrl}
                          className="border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink/50 hover:bg-paper"
                        >
                          Hitung
                        </Link>
                        <Link
                          href={isOutOfStock ? "#" : targetUrl}
                          aria-disabled={isOutOfStock}
                          className={`rounded-sm px-3.5 py-1.5 text-xs font-medium transition-colors ${
                            isOutOfStock
                              ? "cursor-not-allowed bg-line text-ink/40"
                              : "bg-ridge text-fog hover:bg-ink"
                          }`}
                        >
                          {isOutOfStock ? "Habis" : "Ajukan sewa"}
                        </Link>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
