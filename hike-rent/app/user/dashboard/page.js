"use client";

import Link from "next/link";

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Selamat datang kembali!</h1>
          <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
            Peminjam
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Kelola status penyewaan alat kemahmu dan perbarui informasi profilmu dengan mudah dari panel ini.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border border-line bg-white/40 p-6">
          <div className="font-mono text-xs text-ink/50">SEWA AKTIF</div>
          <div className="mt-2 font-display text-3xl font-bold text-ink">1 Alat</div>
          <p className="mt-1 text-xs text-ink/60">Tenda dome 4 orang sedang disewa.</p>
        </div>

        <div className="border border-line bg-white/40 p-6">
          <div className="font-mono text-xs text-ink/50">TOTAL PENGAJUAN</div>
          <div className="mt-2 font-display text-3xl font-bold text-ink">3 Riwayat</div>
          <p className="mt-1 text-xs text-ink/60">Semua riwayat peminjaman tercatat.</p>
        </div>
      </div>

      <div className="border border-line bg-white/40 p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Akses Cepat</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link
            href="/user/katalog"
            className="rounded-sm border border-line bg-paper/60 p-4 text-sm font-medium text-ink hover:border-ridge hover:bg-paper transition-all"
          >
            🎒 Cari & Sewa Alat →
          </Link>
          <Link
            href="/user/kalkulator"
            className="rounded-sm border border-line bg-paper/60 p-4 text-sm font-medium text-ink hover:border-ridge hover:bg-paper transition-all"
          >
            🧮 Hitung Biaya Sewa →
          </Link>
          <Link
            href="/user/riwayat"
            className="rounded-sm border border-line bg-paper/60 p-4 text-sm font-medium text-ink hover:border-ridge hover:bg-paper transition-all"
          >
            🕘 Pantau Status Pengajuan →
          </Link>
        </div>
      </div>
    </div>
  );
}
