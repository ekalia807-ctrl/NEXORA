"use client";

import { useMemo, useState } from "react";
import { useCatalogSync } from "@/lib/stores/catalogStore";
import { useRole } from "@/lib/hooks/useRole";
import { useWishlist, toggleWishlist, isItemInWishlist } from "@/lib/stores/wishlistStore";

import GearFilterBar from "@/components/catalog/GearFilterBar";
import GearCard from "@/components/catalog/GearCard";
import GearDetailModal from "@/components/catalog/GearDetailModal";

const SORT_OPTIONS = [
  { value: "terlaris", label: "Paling sering dipinjam (Terlaris)" },
  { value: "nama-asc", label: "Nama (A-Z)" },
  { value: "harga-asc", label: "Harga terendah" },
  { value: "harga-desc", label: "Harga tertinggi" },
];

const AVAILABILITY_OPTIONS = [
  { value: "semua", label: "Semua Ketersediaan" },
  { value: "hijau", label: "Tersedia" },
  { value: "kuning", label: "Terbatas" },
  { value: "merah", label: "Habis" },
];

export default function CatalogView() {
  const role = useRole();
  const gear = useCatalogSync();
  const wishlist = useWishlist();

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [ketersediaan, setKetersediaan] = useState("semua");
  const [sort, setSort] = useState("terlaris");
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  // Detail Modal state
  const [selectedGear, setSelectedGear] = useState(null);

  // Kategori unik dari data katalog
  const categories = useMemo(() => {
    const set = new Set(gear.map((g) => g.category).filter(Boolean));
    return ["Semua", ...Array.from(set)];
  }, [gear]);

  // Wishlist handler
  function handleToggleWishlist(item, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    toggleWishlist({
      id: item.id,
      gear_id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      image: item.image,
      stock: item.stock,
    });
  }

  function handleResetFilters() {
    setSearch("");
    setKategori("Semua");
    setKetersediaan("semua");
    setSort("terlaris");
    setShowWishlistOnly(false);
  }

  // Filter & Sort Pipeline
  const filteredGear = useMemo(() => {
    let result = [...gear];

    // 1. Filter Kategori
    if (kategori !== "Semua") {
      result = result.filter((g) => g.category === kategori);
    }

    // 2. Filter Ketersediaan Stok
    if (ketersediaan !== "semua") {
      result = result.filter((g) => g.stock === ketersediaan);
    }

    // 3. Filter Pencarian Teks
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          (g.note && g.note.toLowerCase().includes(q)) ||
          (g.provider && g.provider.toLowerCase().includes(q))
      );
    }

    // 4. Filter Wishlist
    if (showWishlistOnly) {
      result = result.filter((g) =>
        wishlist.some(
          (w) =>
            String(w.id) === String(g.id) ||
            String(w.gear_id) === String(g.id) ||
            (w.name && w.name.toLowerCase() === g.name.toLowerCase())
        )
      );
    }

    // 5. Pengurutan (Sorting)
    result.sort((a, b) => {
      if (sort === "terlaris") {
        return (b.timesBorrowed || 0) - (a.timesBorrowed || 0);
      }
      if (sort === "nama-asc") {
        return a.name.localeCompare(b.name, "id");
      }
      if (sort === "harga-asc") {
        return a.price - b.price;
      }
      if (sort === "harga-desc") {
        return b.price - a.price;
      }
      return 0;
    });

    return result;
  }, [gear, search, kategori, ketersediaan, sort, showWishlistOnly, wishlist]);

  return (
    <div className="space-y-6">
      {/* Baris Filter & Pencarian */}
      <GearFilterBar
        search={search}
        setSearch={setSearch}
        kategori={kategori}
        setKategori={setKategori}
        ketersediaan={ketersediaan}
        setKetersediaan={setKetersediaan}
        sort={sort}
        setSort={setSort}
        showWishlistOnly={showWishlistOnly}
        setShowWishlistOnly={setShowWishlistOnly}
        categories={categories}
        sortOptions={SORT_OPTIONS}
        availabilityOptions={AVAILABILITY_OPTIONS}
        wishlistCount={wishlist.length}
        filteredCount={filteredGear.length}
        totalCount={gear.length}
        onResetFilters={handleResetFilters}
      />

      {/* Grid Katalog Alat */}
      {filteredGear.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white/60 p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-lg">
            🔍
          </div>
          <h3 className="mt-4 font-display text-base font-bold text-ink">
            Tidak Ada Alat yang Cocok
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink/60">
            Coba ubah kata kunci pencarian, sesuaikan filter ketersediaan, atau pilih kategori lainnya.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 rounded-xl bg-ridge px-4 py-2 text-xs font-semibold text-fog hover:bg-ink transition-colors shadow-xs"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGear.map((item) => {
            const inWish = wishlist.some(
              (w) =>
                String(w.id) === String(item.id) ||
                String(w.gear_id) === String(item.id) ||
                (w.name && w.name.toLowerCase() === item.name.toLowerCase())
            );

            return (
              <GearCard
                key={item.id}
                item={item}
                role={role}
                isInWishlist={inWish}
                onToggleWishlist={handleToggleWishlist}
                onOpenDetail={(it) => setSelectedGear(it)}
              />
            );
          })}
        </div>
      )}

      {/* Modal Detail & Lightbox Alat */}
      <GearDetailModal
        selectedGear={selectedGear}
        onClose={() => setSelectedGear(null)}
        role={role}
        isInWishlist={
          selectedGear
            ? wishlist.some(
                (w) =>
                  String(w.id) === String(selectedGear.id) ||
                  String(w.gear_id) === String(selectedGear.id) ||
                  (w.name && w.name.toLowerCase() === selectedGear.name.toLowerCase())
              )
            : false
        }
        onToggleWishlist={handleToggleWishlist}
      />
    </div>
  );
}
