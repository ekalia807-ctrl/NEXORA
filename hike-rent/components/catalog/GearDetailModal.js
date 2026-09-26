"use client";

import { useState } from "react";
import Link from "next/link";
import { stockLabel, stockColor } from "@/constants/gearStock";
import { formatRupiah } from "@/lib/utils/hitungBiaya";

export default function GearDetailModal({
  selectedGear,
  onClose,
  role,
  isInWishlist,
  onToggleWishlist,
}) {
  const [lightboxZoom, setLightboxZoom] = useState(false);

  if (!selectedGear) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop Blur Overlay */}
      <div
        onClick={() => {
          if (lightboxZoom) setLightboxZoom(false);
          else onClose();
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
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/60 hover:bg-paper hover:text-ink transition-colors"
            aria-label="Tutup modal detail"
          >
            ✕
          </button>
        </div>

        {/* Body Modal: Responsive 2 Kolom */}
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

              {/* Warning khusus jika stok habis */}
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
                  onClick={(e) => onToggleWishlist(selectedGear, e)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    isInWishlist
                      ? "border-alert bg-alert/15 text-alert shadow-sm"
                      : "border-line bg-paper/60 text-ink/70 hover:border-ink/40"
                  }`}
                >
                  <span>{isInWishlist ? "♥ Di Wishlist" : "♡ Simpan ke Wishlist"}</span>
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
                      ? `/user/checkout?alatId=${encodeURIComponent(selectedGear.id)}`
                      : `/login?redirect=${encodeURIComponent(`/user/checkout?alatId=${encodeURIComponent(selectedGear.id)}`)}`
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
  );
}
