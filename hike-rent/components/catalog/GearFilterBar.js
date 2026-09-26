"use client";

export default function GearFilterBar({
  search,
  setSearch,
  kategori,
  setKategori,
  ketersediaan,
  setKetersediaan,
  sort,
  setSort,
  showWishlistOnly,
  setShowWishlistOnly,
  categories,
  sortOptions,
  availabilityOptions,
  wishlistCount,
  filteredCount,
  totalCount,
  onResetFilters,
}) {
  const hasActiveFilters =
    search.trim() !== "" ||
    kategori !== "Semua" ||
    ketersediaan !== "semua" ||
    sort !== "terlaris" ||
    showWishlistOnly;

  return (
    <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 shadow-sm backdrop-blur-md space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 items-center">
        {/* Input Pencarian */}
        <div className="lg:col-span-4 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama alat, spesifikasi, atau merk..."
            className="w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-xs text-ink placeholder:text-ink/40 outline-none focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-xs text-ink/40 hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Kategori */}
        <div className="lg:col-span-3">
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10 transition-all font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Kategori: {c}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Ketersediaan Stok */}
        <div className="lg:col-span-2">
          <select
            value={ketersediaan}
            onChange={(e) => setKetersediaan(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper/60 px-3 py-2.5 text-xs text-ink outline-none focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10 transition-all"
          >
            {availabilityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Urutan */}
        <div className="lg:col-span-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10 transition-all"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Urut: {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Baris Status & Tombol Filter Tambahan */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line/50 text-xs text-ink/65">
        <div className="flex items-center gap-2">
          <span>
            Menampilkan <strong>{filteredCount}</strong> dari {totalCount} peralatan
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-semibold text-alert hover:underline ml-2"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Filter Khusus Wishlist */}
        <button
          type="button"
          onClick={() => setShowWishlistOnly(!showWishlistOnly)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
            showWishlistOnly
              ? "border-alert bg-alert/15 text-alert shadow-xs"
              : "border-line bg-paper/60 text-ink/70 hover:border-ink/40"
          }`}
        >
          <span>{showWishlistOnly ? "♥" : "♡"}</span>
          <span>Hanya Wishlist Saya</span>
          {wishlistCount > 0 && (
            <span className="rounded-full bg-alert text-fog px-1.5 py-0.2 text-[10px] font-mono">
              {wishlistCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
