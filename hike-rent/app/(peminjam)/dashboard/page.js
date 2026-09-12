export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Selamat datang kembali!</h1>
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
    </div>
  );
}