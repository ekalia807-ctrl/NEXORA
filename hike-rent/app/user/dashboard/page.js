"use client";

import Link from "next/link";
import { useRentalsSync, statusStyle } from "@/lib/rentalsStore";
import { useWishlist } from "@/lib/wishlistStore";
import { formatRupiah } from "@/lib/hitungBiaya";

export default function DashboardOverviewPage() {
  const rentals = useRentalsSync();
  const wishlist = useWishlist();

  const sewaAktif = rentals.filter((r) => r.status === "Disetujui" || r.status === "Diambil").length;
  const menungguVerifikasi = rentals.filter((r) => r.status === "Menunggu verifikasi").length;
  const totalPengajuan = rentals.length;
  const recentRentals = rentals.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header Dashboard User */}
      <div className="rounded-2xl border border-line bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
                Panel Peminjam
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Ringkasan Aktivitas</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Selamat Datang Kembali!
            </h1>
            <p className="mt-1.5 text-sm text-ink/65 leading-relaxed">
              Kelola status penyewaan alat kemahmu, selesaikan pembayaran, dan pantau wishlist favoritmu dari satu tempat.
            </p>
          </div>

          <span className="rounded-full bg-ridge px-3.5 py-1 font-mono text-xs font-medium text-fog shadow-sm">
            Status Akun: Aktif
          </span>
        </div>
      </div>

      {/* Grid Statistik Ringkas (Apple-like rounded-2xl, soft shadow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sewa Aktif */}
        <div className="rounded-2xl border border-line bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink/50 font-semibold">
              SEWA AKTIF
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-moss/15 text-moss text-sm">
              ⛺
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-ink">
            {sewaAktif} <span className="text-sm font-normal text-ink/50">Alat</span>
          </div>
          <p className="mt-1.5 text-xs text-ink/60">
            {sewaAktif > 0 ? "Sedang dalam tahap disetujui / dipinjam." : "Tidak ada peminjaman aktif saat ini."}
          </p>
        </div>

        {/* Card 2: Menunggu Verifikasi */}
        <div className="rounded-2xl border border-line bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink/50 font-semibold">
              MENUNGGU
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber/20 text-amber-700 text-sm">
              ⏳
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-ink">
            {menungguVerifikasi} <span className="text-sm font-normal text-ink/50">Antrean</span>
          </div>
          <p className="mt-1.5 text-xs text-ink/60">
            {menungguVerifikasi > 0 ? "Menunggu peninjauan admin." : "Semua pengajuan telah ditinjau."}
          </p>
        </div>

        {/* Card 3: Wishlist Favorit */}
        <div className="rounded-2xl border border-line bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink/50 font-semibold">
              WISHLIST
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-alert/15 text-alert text-sm">
              ♥
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-ink">
            {wishlist.length} <span className="text-sm font-normal text-ink/50">Alat</span>
          </div>
          <p className="mt-1.5 text-xs text-ink/60">
            <Link href="/user/wishlist" className="text-rust hover:underline">
              Lihat koleksi favorit →
            </Link>
          </p>
        </div>

        {/* Card 4: Total Riwayat */}
        <div className="rounded-2xl border border-line bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink/50 font-semibold">
              RIWAYAT
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-paper text-ink/60 text-sm">
              📋
            </span>
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-ink">
            {totalPengajuan} <span className="text-sm font-normal text-ink/50">Total</span>
          </div>
          <p className="mt-1.5 text-xs text-ink/60">
            Semua transaksi tercatat di audit trail.
          </p>
        </div>
      </div>

      {/* Akses Cepat & Aktivitas Terakhir */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Akses Cepat */}
        <div className="lg:col-span-1 rounded-2xl border border-line bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <h2 className="font-display text-base font-bold text-ink border-b border-line/60 pb-3">
            Akses Cepat Panel
          </h2>
          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              href="/user/katalog"
              className="flex items-center justify-between rounded-xl border border-line bg-paper/50 p-3.5 text-xs font-semibold text-ink hover:border-ridge hover:bg-paper transition-all"
            >
              <span>🌲 Cari & Sewa Alat</span>
              <span className="text-ink/40">›</span>
            </Link>
            <Link
              href="/user/wishlist"
              className="flex items-center justify-between rounded-xl border border-line bg-paper/50 p-3.5 text-xs font-semibold text-ink hover:border-ridge hover:bg-paper transition-all"
            >
              <span>♥ Wishlist Saya ({wishlist.length})</span>
              <span className="text-ink/40">›</span>
            </Link>
            <Link
              href="/user/kalkulator"
              className="flex items-center justify-between rounded-xl border border-line bg-paper/50 p-3.5 text-xs font-semibold text-ink hover:border-ridge hover:bg-paper transition-all"
            >
              <span>🧮 Kalkulator Biaya Sewa</span>
              <span className="text-ink/40">›</span>
            </Link>
            <Link
              href="/user/riwayat"
              className="flex items-center justify-between rounded-xl border border-line bg-paper/50 p-3.5 text-xs font-semibold text-ink hover:border-ridge hover:bg-paper transition-all"
            >
              <span>📜 Pantau Status Pengajuan</span>
              <span className="text-ink/40">›</span>
            </Link>
            <Link
              href="/user/rekomendasi"
              className="flex items-center justify-between rounded-xl border border-line bg-paper/50 p-3.5 text-xs font-semibold text-ink hover:border-ridge hover:bg-paper transition-all"
            >
              <span>🎒 Rekomendasi Rombongan</span>
              <span className="text-ink/40">›</span>
            </Link>
          </div>
        </div>

        {/* Kolom Aktivitas Peminjaman Terbaru */}
        <div className="lg:col-span-2 rounded-2xl border border-line bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <h2 className="font-display text-base font-bold text-ink">
              Transaksi Sewa Terbaru
            </h2>
            <Link href="/user/riwayat" className="text-xs font-semibold text-ridge hover:underline">
              Lihat Semua →
            </Link>
          </div>

          {recentRentals.length === 0 ? (
            <div className="py-10 text-center text-xs text-ink/50">
              Belum ada aktivitas transaksi sewa yang tercatat.
            </div>
          ) : (
            <div className="mt-3 divide-y divide-line/60">
              {recentRentals.map((r) => (
                <div key={r.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-ink/60 bg-paper px-2 py-0.5 rounded border border-line">
                        {r.id}
                      </span>
                      <strong className="text-sm font-semibold text-ink">{r.item}</strong>
                    </div>
                    <div className="mt-1 text-xs text-ink/50">
                      {r.date} • {formatRupiah(r.total || r.total_price || 0)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-semibold shadow-sm ${
                        statusStyle[r.status] || "bg-amber text-ink"
                      }`}
                    >
                      {r.status}
                    </span>

                    {r.status === "Disetujui" && (
                      <Link
                        href={`/user/payment?rentalId=${r.id}`}
                        className="rounded-lg bg-ridge px-3 py-1 text-xs font-semibold text-fog hover:bg-ink transition-colors"
                      >
                        Bayar →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
