"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCatalogSync } from "@/lib/stores/catalogStore";
import { stockLabel, stockColor } from "@/constants/gearStock";
import { formatRupiah } from "@/lib/utils/hitungBiaya";
import { useRole } from "@/lib/hooks/useRole";
import { useWishlist, toggleWishlist, isItemInWishlist } from "@/lib/stores/wishlistStore";

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

const stockAccent = {
  hijau: "border-l-moss",
  kuning: "border-l-amber",
  merah: "border-l-alert",
};

function GearImage({ src, alt, onClick }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        onClick={onClick}
        className="flex h-44 w-full cursor-pointer items-center justify-center rounded-lg border border-line bg-paper text-xs text-ink/40 transition-colors hover:bg-paper/80"
      >
        <span>Belum ada foto alat</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group relative h-44 w-full cursor-pointer overflow-hidden rounded-lg border border-line bg-paper"
    >
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-ink/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center">
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink shadow-sm backdrop-blur-sm">
          🔍 Lihat Detail & Foto
        </span>
      </div>
    </div>
  );
}

export default function CatalogView() {
  const router = useRouter();
  const role = useRole();
  const gear = useCatalogSync();
  const wishlist = useWishlist();

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [ketersediaan, setKetersediaan] = useState("semua");
  const [sort, setSort] = useState("terlaris");
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  // Detail Modal state (Task 4)
  const [selectedGear, setSelectedGear] = useState(null);
  const [lightboxZoom, setLightboxZoom] = useState(false);

  // Tutup modal dengan Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        if (lightboxZoom) setLightboxZoom(false);
        else setSelectedGear(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxZoom]);

  // Kategori dinamis
  const availableCategories = useMemo(() => {
    const set = new Set(["Semua"]);
    gear.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [gear]);

  // Wishlist toggle handler
  async function handleToggleWishlist(item, e) {
    if (e) e.stopPropagation();
    if (!role) {
      router.push(`/login?redirect=${encodeURIComponent("/user/katalog")}`);
      return;
    }
    await toggleWishlist(item);
  }

  // Multi-filter logic (Task 8: Case-insensitive search, availability, sort, category, wishlist-only)
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return gear
      .filter((item) => {
        // 1. Text Search (case-insensitive across name, category, note, provider)
        if (query) {
          const matchName = (item.name || "").toLowerCase().includes(query);
          const matchCategory = (item.category || "").toLowerCase().includes(query);
          const matchNote = (item.note || "").toLowerCase().includes(query);
          const matchProvider = (item.provider || "").toLowerCase().includes(query);
          if (!matchName && !matchCategory && !matchNote && !matchProvider) {
            return false;
          }
        }

        // 2. Kategori
        if (kategori !== "Semua" && item.category !== kategori) {
          return false;
        }

        // 3. Status Ketersediaan (hijau / kuning / merah)
        if (ketersediaan !== "semua" && item.stock !== ketersediaan) {
          return false;
        }

        // 4. Wishlist filter
        if (showWishlistOnly) {
          const inWish = wishlist.some(
            (w) =>
              String(w.id) === String(item.id) ||
              String(w.gear_id) === String(item.id) ||
              (w.name && w.name.toLowerCase() === item.name.toLowerCase()) ||
              (w.gear_name && w.gear_name.toLowerCase() === item.name.toLowerCase())
          );
          if (!inWish) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sort) {
          case "terlaris":
            // TODO: Ganti dengan agregasi asli peminjaman dari rentals bila backend analytics aktif
            return Number(b.timesBorrowed ?? 0) - Number(a.timesBorrowed ?? 0);
          case "harga-asc":
            return (a.price || 0) - (b.price || 0);
          case "harga-desc":
            return (b.price || 0) - (a.price || 0);
          case "nama-asc":
          default:
            return (a.name || "").localeCompare(b.name || "");
        }
      });
  }, [gear, search, kategori, ketersediaan, sort, showWishlistOnly, wishlist]);

  function resetAllFilters() {
    setSearch("");
    setKategori("Semua");
    setKetersediaan("semua");
    setSort("terlaris");
    setShowWishlistOnly(false);
  }

  const isFilterActive =
    search.trim() !== "" ||
    kategori !== "Semua" ||
    ketersediaan !== "semua" ||
    sort !== "terlaris" ||
    showWishlistOnly;

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar (Apple-like rounded, soft shadow, responsive flex/grid) */}
      <div className="rounded-2xl border border-line bg-white/70 p-4 sm:p-5 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Input Search Bebas (Case-Insensitive) */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink/40">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari alat (tenda, matras, kompor, carrier)..."
              className="w-full rounded-xl border border-line bg-paper/70 pl-10 pr-9 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/40 focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-3 flex items-center text-xs text-ink/40 hover:text-ink"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdowns (Kategori, Ketersediaan, Urutan) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Filter Kategori */}
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              aria-label="Filter kategori"
              className="rounded-xl border border-line bg-paper/70 px-3.5 py-2.5 text-xs sm:text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white"
            >
              {availableCategories.map((k) => (
                <option key={k} value={k}>
                  {k === "Semua" ? "Semua Kategori" : k}
                </option>
              ))}
            </select>

            {/* Filter Ketersediaan Stok */}
            <select
              value={ketersediaan}
              onChange={(e) => setKetersediaan(e.target.value)}
              aria-label="Filter ketersediaan"
              className="rounded-xl border border-line bg-paper/70 px-3.5 py-2.5 text-xs sm:text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white"
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Filter Urutan */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Urutkan alat"
              className="rounded-xl border border-line bg-paper/70 px-3.5 py-2.5 text-xs sm:text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Wishlist filter button (Khusus User Login) */}
          {role && (
            <button
              type="button"
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                showWishlistOnly
                  ? "border border-alert bg-alert/15 text-alert shadow-sm"
                  : "border border-line bg-paper/70 text-ink/70 hover:border-ink/40 hover:bg-paper"
              }`}
            >
              <span>{showWishlistOnly ? "♥" : "♡"}</span>
              <span>Wishlist ({wishlist.length})</span>
            </button>
          )}
        </div>

        {/* Ringkasan status filter aktif */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-line/50 pt-3 text-xs text-ink/60">
          <div>
            Menampilkan <strong className="text-ink">{filtered.length}</strong> alat
            {showWishlistOnly && " (dari Wishlist)"}
            {kategori !== "Semua" && ` • Kategori: ${kategori}`}
            {ketersediaan !== "semua" && ` • Stok: ${stockLabel[ketersediaan] || ketersediaan}`}
            {search && ` • Kata kunci: "${search}"`}
          </div>

          {isFilterActive && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="font-medium text-rust hover:underline transition-colors"
            >
              Reset semua filter ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid Alat Katalog */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white/50 p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper border border-line text-2xl">
            🏔️
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">
            Tidak ada alat yang cocok
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
            {showWishlistOnly
              ? "Belum ada alat di daftar Wishlist kamu. Klik Simpan pada alat yang kamu minati untuk menyimpannya di sini."
              : "Tidak ada alat yang sesuai dengan kombinasi pencarian dan filter yang kamu pilih. Coba sesuaikan kata kunci atau reset filter."}
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={resetAllFilters}
              className="rounded-xl bg-ridge px-5 py-2.5 text-xs font-medium text-fog shadow-sm transition-all hover:bg-ink hover:shadow"
            >
              Tampilkan Semua Alat
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const isWishlisted = wishlist.some(
              (w) =>
                String(w.id) === String(item.id) ||
                String(w.gear_id) === String(item.id) ||
                (w.name && w.name.toLowerCase() === item.name.toLowerCase()) ||
                (w.gear_name && w.gear_name.toLowerCase() === item.name.toLowerCase())
            );

            const isOutOfStock = item.stock === "merah";
            const checkoutPath = `/user/checkout?alat=${encodeURIComponent(item.name)}`;
            const targetUrl = role
              ? checkoutPath
              : `/login?redirect=${encodeURIComponent(checkoutPath)}`;
            const kalkulatorPath = `/user/kalkulator?alatId=${item.id}`;
            const hitungUrl = role
              ? kalkulatorPath
              : `/login?redirect=${encodeURIComponent(kalkulatorPath)}`;

            return (
              <div
                key={item.id}
                className={`group flex flex-col justify-between rounded-2xl border border-line ${
                  stockAccent[item.stock] || "border-l-line"
                } border-l-4 bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md backdrop-blur-sm`}
              >
                <div>
                  {/* Foto Alat dengan Trigger Detail */}
                  <GearImage
                    src={item.image}
                    alt={item.name}
                    onClick={() => setSelectedGear(item)}
                  />

                  {/* Header Kartu: Nama & Wishlist Toggle */}
                  <div className="mt-4 flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-rust font-semibold">
                          {item.category}
                        </span>
                        {item.timesBorrowed > 0 && (
                          <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-medium text-ink/75">
                            🔥 {item.timesBorrowed}x dipinjam
                          </span>
                        )}
                      </div>
                      <h3
                        onClick={() => setSelectedGear(item)}
                        className="mt-1 font-display text-lg font-semibold text-ink line-clamp-1 cursor-pointer hover:text-ridge transition-colors"
                      >
                        {item.name}
                      </h3>
                    </div>

                    {/* Tombol Wishlist Toggle (Task 6) */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleWishlist(item, e)}
                      title={isWishlisted ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
                      className={`shrink-0 rounded-full p-2 text-sm transition-all ${
                        isWishlisted
                          ? "bg-alert/15 text-alert ring-1 ring-alert/40 hover:bg-alert/25"
                          : "bg-paper text-ink/40 hover:text-alert hover:bg-paper/80"
                      }`}
                    >
                      {isWishlisted ? "♥" : "♡"}
                    </button>
                  </div>

                  {/* Deskripsi ringkas & badge status */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-fog ${
                        stockColor[item.stock] || "bg-line text-ink"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      {stockLabel[item.stock] || item.stock}
                    </span>
                    <span className="text-xs text-ink/50 truncate">
                      Oleh: {item.provider}
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs text-ink/65 line-clamp-2 leading-relaxed">
                    {item.note || "Perlengkapan standar pendakian dengan material kuat dan tahan cuaca."}
                  </p>
                </div>

                {/* Footer Kartu: Harga, Detail, Hitung & Ajukan Sewa */}
                <div className="mt-5 border-t border-line/60 pt-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-ink/50 uppercase tracking-wide">Tarif Sewa</span>
                      <p className="font-display text-lg font-bold text-ink">
                        {formatRupiah(item.price)}
                        <span className="ml-1 text-xs font-normal text-ink/50">
                          /{String(item.unit || "hari").replace("per ", "")}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedGear(item)}
                      className="text-xs font-medium text-ridge hover:underline transition-colors"
                    >
                      Lihat Detail →
                    </button>
                  </div>

                  <div className="mt-3.5 grid grid-cols-2 gap-2">
                    <Link
                      href={hitungUrl}
                      className="flex items-center justify-center rounded-xl border border-line bg-paper/60 px-3 py-2 text-xs font-medium text-ink transition-all hover:border-ink/40 hover:bg-paper"
                    >
                      Hitung Biaya
                    </Link>
                    <Link
                      href={isOutOfStock ? "#" : targetUrl}
                      aria-disabled={isOutOfStock}
                      className={`flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                        isOutOfStock
                          ? "cursor-not-allowed bg-line/80 text-ink/40"
                          : "bg-ridge text-fog shadow-sm hover:bg-ink hover:shadow"
                      }`}
                    >
                      {isOutOfStock ? "Stok Habis" : "Ajukan Sewa"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TASK 4: MODAL DETAIL ALAT DENGAN FOKUS GAMBAR / LIGHTBOX ELEGAN         */}
      {/* ========================================================================= */}
      {selectedGear && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => {
              if (lightboxZoom) setLightboxZoom(false);
              else setSelectedGear(null);
            }}
            className="fixed inset-0 bg-ink/60 backdrop-blur-md transition-opacity duration-300"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-white shadow-2xl transition-all duration-300">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-line bg-paper/60 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink/50 uppercase tracking-wide">
                  Detail Peralatan
                </span>
                <span className="h-1 w-1 rounded-full bg-ink/30" />
                <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-medium text-rust border border-line">
                  {selectedGear.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGear(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink/60 hover:bg-paper hover:text-ink transition-colors"
                aria-label="Tutup modal detail"
              >
                ✕
              </button>
            </div>

            {/* Body Modal: Responsive 2 Kolom (Kiri: Gambar Fokus / Lightbox, Kanan: Info Lengkap) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Gambar Alat Membesar / Fokus */}
              <div className="flex flex-col gap-3">
                <div
                  onClick={() => setLightboxZoom(!lightboxZoom)}
                  className="group relative flex h-64 sm:h-72 w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-line bg-paper"
                  title="Klik untuk memperbesar gambar"
                >
                  {selectedGear.image ? (
                    <img
                      src={selectedGear.image}
                      alt={selectedGear.name}
                      className={`h-full w-full object-cover transition-transform duration-300 ease-out ${
                        lightboxZoom ? "scale-125 cursor-zoom-out" : "group-hover:scale-105"
                      }`}
                    />
                  ) : (
                    <span className="text-xs text-ink/40">Belum ada foto</span>
                  )}
                  <div className="absolute bottom-3 right-3 rounded-full bg-ink/75 px-3 py-1 text-[11px] font-medium text-fog backdrop-blur-sm">
                    {lightboxZoom ? "🔍 Perkecil" : "🔍 Klik Zoom"}
                  </div>
                </div>

                {/* Popularitas & info stok */}
                <div className="flex items-center justify-between rounded-xl bg-paper/60 px-4 py-2.5 text-xs text-ink/70 border border-line/60">
                  <span>Unit Tersedia: <strong>{selectedGear.availableStock ?? 5} unit</strong></span>
                  {selectedGear.timesBorrowed > 0 && (
                    <span className="font-medium text-amber-700">
                      🔥 Dipinjam {selectedGear.timesBorrowed}x
                    </span>
                  )}
                </div>
              </div>

              {/* Rincian Teks Lengkap */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-2xl font-bold text-ink">
                      {selectedGear.name}
                    </h2>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-fog ${
                        stockColor[selectedGear.stock] || "bg-line"
                      }`}
                    >
                      {stockLabel[selectedGear.stock] || selectedGear.stock}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-ink/50">
                    Dikelola oleh: <span className="font-medium text-ink">{selectedGear.provider}</span>
                  </p>

                  {/* Warning khusus jika stok habis (Task 4) */}
                  {selectedGear.stock === "merah" && (
                    <div className="mt-3.5 rounded-xl border border-alert/30 bg-alert/10 p-3 text-xs text-alert leading-relaxed">
                      <strong>⚠️ Stok Sedang Habis:</strong> Saat ini alat ini sedang disewa seluruhnya oleh pendaki lain. Silakan periksa kembali jadwal peminjaman atau pilih alat sejenis.
                    </div>
                  )}

                  {/* Deskripsi Lengkap */}
                  <div className="mt-4 space-y-2">
                    <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink/50">
                      Deskripsi & Catatan Penggunaan:
                    </h4>
                    <p className="text-sm leading-relaxed text-ink/75 bg-paper/40 p-3 rounded-xl border border-line/50">
                      {selectedGear.note ||
                        "Peralatan pendakian berkualitas standar expedition. Telah melalui inspeksi kelayakan fisik, kebersihan, dan fungsi sebelum disewakan."}
                    </p>
                  </div>
                </div>

                {/* Harga & Tombol Aksi Modal */}
                <div className="border-t border-line/60 pt-4 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-ink/60">Biaya sewa harian:</span>
                    <span className="font-display text-2xl font-bold text-ink">
                      {formatRupiah(selectedGear.price)}
                      <span className="ml-1 text-xs font-normal text-ink/50">
                        /{String(selectedGear.unit || "hari").replace("per ", "")}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Toggle Wishlist di Modal */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleWishlist(selectedGear, e)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all ${
                        wishlist.some(
                          (w) =>
                            String(w.id) === String(selectedGear.id) ||
                            String(w.gear_id) === String(selectedGear.id) ||
                            (w.name && w.name.toLowerCase() === selectedGear.name.toLowerCase())
                        )
                          ? "border-alert bg-alert/15 text-alert shadow-sm"
                          : "border-line bg-paper/60 text-ink/70 hover:border-ink/40"
                      }`}
                    >
                      <span>
                        {wishlist.some(
                          (w) =>
                            String(w.id) === String(selectedGear.id) ||
                            String(w.gear_id) === String(selectedGear.id) ||
                            (w.name && w.name.toLowerCase() === selectedGear.name.toLowerCase())
                        )
                          ? "♥ Di Wishlist"
                          : "♡ Simpan ke Wishlist"}
                      </span>
                    </button>

                    {/* Hitung Biaya */}
                    <Link
                      href={
                        role
                          ? `/user/kalkulator?alatId=${selectedGear.id}`
                          : `/login?redirect=${encodeURIComponent(`/user/kalkulator?alatId=${selectedGear.id}`)}`
                      }
                      className="flex items-center justify-center rounded-xl border border-line bg-paper/60 px-3.5 py-2.5 text-xs font-semibold text-ink hover:bg-paper transition-all"
                    >
                      Kalkulator Sewa
                    </Link>
                  </div>

                  {/* Tombol Ajukan Sewa */}
                  {selectedGear.stock === "merah" ? (
                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-xl bg-line py-3 text-center text-xs font-bold text-ink/40"
                    >
                      Stok Sedang Habis (Tidak Dapat Diajukan)
                    </button>
                  ) : (
                    <Link
                      href={
                        role
                          ? `/user/checkout?alat=${encodeURIComponent(selectedGear.name)}`
                          : `/login?redirect=${encodeURIComponent(`/user/checkout?alat=${encodeURIComponent(selectedGear.name)}`)}`
                      }
                      className="block w-full rounded-xl bg-ridge py-3 text-center text-xs font-bold text-fog shadow-md hover:bg-ink transition-all"
                    >
                      Ajukan Sewa Alat Ini →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
