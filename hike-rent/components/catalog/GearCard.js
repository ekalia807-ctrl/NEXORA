"use client";

import { useState } from "react";
import Link from "next/link";
import { stockLabel, stockColor } from "@/constants/gearStock";
import { formatRupiah } from "@/lib/utils/hitungBiaya";

function GearCardImage({ src, alt, onClick }) {
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

export default function GearCard({
  item,
  role,
  isInWishlist,
  onToggleWishlist,
  onOpenDetail,
}) {
  const isOutOfStock = item.stock === "merah";
  const stockAccent = {
    hijau: "border-l-moss",
    kuning: "border-l-amber",
    merah: "border-l-alert",
  };

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border border-line border-l-4 ${
        stockAccent[item.stock] || "border-l-line"
      } bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md backdrop-blur-sm`}
    >
      <div>
        {/* Gambar Alat */}
        <GearCardImage
          src={item.image}
          alt={item.name}
          onClick={() => onOpenDetail(item)}
        />

        {/* Kategori, Stok & Tombol Wishlist */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-medium text-rust border border-line">
            {item.category}
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-fog ${
                stockColor[item.stock] || "bg-line"
              }`}
            >
              {stockLabel[item.stock] || item.stock}
            </span>

            {/* Tombol Wishlist */}
            <button
              type="button"
              onClick={(e) => onToggleWishlist(item, e)}
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                isInWishlist
                  ? "border-alert bg-alert/15 text-alert shadow-xs"
                  : "border-line bg-paper/60 text-ink/40 hover:border-ink/30 hover:text-ink"
              }`}
              title={isInWishlist ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
            >
              <span className="text-xs">{isInWishlist ? "♥" : "♡"}</span>
            </button>
          </div>
        </div>

        {/* Nama Alat & Catatan Singkat */}
        <h3
          onClick={() => onOpenDetail(item)}
          className="mt-2.5 cursor-pointer font-display text-base font-bold text-ink hover:text-ridge transition-colors"
        >
          {item.name}
        </h3>

        {item.note && (
          <p className="mt-1 line-clamp-2 text-xs text-ink/60 leading-relaxed">
            {item.note}
          </p>
        )}

        {/* Info Penyedia & Popularitas */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-ink/50">
          <span>Oleh: {item.provider}</span>
          {item.timesBorrowed > 0 && (
            <span className="font-mono text-amber-700">
              Dipinjam {item.timesBorrowed}x
            </span>
          )}
        </div>
      </div>

      {/* Harga & Tombol Aksi */}
      <div className="mt-5 border-t border-line/60 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-ink/60">Biaya sewa:</span>
          <span className="font-display text-lg font-bold text-ink">
            {formatRupiah(item.price)}
            <span className="ml-0.5 text-xs font-normal text-ink/50">
              /{String(item.unit || "hari").replace("per ", "")}
            </span>
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {/* Tombol Kalkulator */}
          <Link
            href={
              role
                ? `/user/kalkulator?alatId=${item.id}`
                : `/login?redirect=${encodeURIComponent(`/user/kalkulator?alatId=${item.id}`)}`
            }
            className="flex items-center justify-center rounded-xl border border-line bg-paper/60 px-3 py-2 text-xs font-semibold text-ink hover:bg-paper transition-all"
          >
            Kalkulator
          </Link>

          {/* Tombol Ajukan Sewa */}
          <Link
            href={
              isOutOfStock
                ? "#"
                : role
                ? `/user/checkout?alatId=${encodeURIComponent(item.id)}`
                : `/login?redirect=${encodeURIComponent(`/user/checkout?alatId=${encodeURIComponent(item.id)}`)}`
            }
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
}
