"use client";

import Link from "next/link";
import { useWishlist, removeWishlistItem } from "@/lib/stores/wishlistStore";
import { formatRupiah } from "@/lib/utils/hitungBiaya";
import { stockLabel, stockColor } from "@/constants/gearStock";

export default function UserWishlistPage() {
  const wishlist = useWishlist();

  return (
    <div className="space-y-6">
      {/* Header Halaman Wishlist */}
      <div className="rounded-2xl border border-line bg-white/70 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber">
                Panel Peminjam
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Favorit</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Wishlist Alat Pendakian
            </h1>
            <p className="mt-1.5 text-sm text-ink/65">
              Daftar peralatan pendakian yang kamu tandai untuk rencana petualangan berikutnya.
            </p>
          </div>

          <span className="rounded-full bg-ridge px-3.5 py-1 font-mono text-xs font-medium text-fog shadow-sm">
            {wishlist.length} Disimpan
          </span>
        </div>
      </div>

      {/* Konten Wishlist */}
      {wishlist.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white/50 p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-paper border border-line text-3xl">
            ♡
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">
            Wishlist Kamu Masih Kosong
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
            Kamu belum menandai alat pendakian apa pun. Buka katalog untuk menemukan tenda, carrier,
            alat masak, atau perlengkapan lainnya, lalu klik tanda simpan.
          </p>
          <div className="mt-6">
            <Link
              href="/user/katalog"
              className="inline-block rounded-xl bg-ridge px-5 py-2.5 text-xs font-semibold text-fog shadow-sm transition-all hover:bg-ink hover:shadow"
            >
              Jelajahi Katalog Alat →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const isOutOfStock = item.stock === "merah";
            const checkoutPath = `/user/checkout?alatId=${encodeURIComponent(item.id || item.gear_id)}`;
            const kalkulatorPath = `/user/kalkulator?alatId=${item.id || item.gear_id}`;

            return (
              <div
                key={item.id || item.gear_id}
                className="group flex flex-col justify-between rounded-2xl border border-line bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md backdrop-blur-sm"
              >
                <div>
                  {/* Foto Alat */}
                  <div className="relative h-44 w-full overflow-hidden rounded-xl border border-line bg-paper">
                    {item.image || item.gear_image ? (
                      <img
                        src={item.image || item.gear_image}
                        alt={item.name || item.gear_name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-ink/40">
                        Foto tidak tersedia
                      </div>
                    )}
                    <span
                      className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-fog shadow-sm ${
                        stockColor[item.stock] || "bg-line"
                      }`}
                    >
                      {stockLabel[item.stock] || item.stock}
                    </span>
                  </div>

                  {/* Detail Item */}
                  <div className="mt-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-rust font-semibold">
                      {item.category || "Peralatan"}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-semibold text-ink line-clamp-1">
                      {item.name || item.gear_name}
                    </h3>
                    <p className="mt-1 text-xs text-ink/50">
                      Penyedia: {item.provider || "Basecamp NEXORA"}
                    </p>
                  </div>
                </div>

                {/* Footer Kartu & Aksi */}
                <div className="mt-5 border-t border-line/60 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-ink/50 uppercase tracking-wide">Tarif Sewa</span>
                    <p className="font-display text-lg font-bold text-ink">
                      {formatRupiah(item.price || item.gear_price || 0)}
                      <span className="ml-1 text-xs font-normal text-ink/50">/hari</span>
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={kalkulatorPath}
                        className="flex items-center justify-center rounded-xl border border-line bg-paper/60 px-3 py-2 text-xs font-medium text-ink transition-all hover:bg-paper"
                      >
                        Hitung Biaya
                      </Link>
                      <Link
                        href={isOutOfStock ? "#" : checkoutPath}
                        aria-disabled={isOutOfStock}
                        className={`flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                          isOutOfStock
                            ? "cursor-not-allowed bg-line text-ink/40"
                            : "bg-ridge text-fog shadow-sm hover:bg-ink"
                        }`}
                      >
                        {isOutOfStock ? "Habis" : "Sewa Sekarang"}
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeWishlistItem(item.id || item.gear_id)}
                      className="flex w-full items-center justify-center gap-1 rounded-xl border border-line py-2 text-xs font-medium text-alert/80 hover:border-alert/40 hover:bg-alert/10 hover:text-alert transition-all"
                    >
                      ✕ Hapus dari Wishlist
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
