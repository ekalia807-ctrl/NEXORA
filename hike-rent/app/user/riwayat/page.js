"use client";

import Link from "next/link";
import { useMyRentalsSync, statusStyle } from "@/lib/stores/rentalsStore";
import { formatRupiah } from "@/lib/utils/hitungBiaya";

export default function UserRiwayatPage() {
  const history = useMyRentalsSync();

  return (
    <div className="space-y-6">
      {/* Header Halaman Riwayat */}
      <div className="rounded-2xl border border-line bg-white/70 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
                Panel Peminjam
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Aktivitas Sewa</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Riwayat & Status Peminjaman
            </h1>
            <p className="mt-1.5 text-sm text-ink/65">
              Pantau linimasa pengajuan sewa, selesaikan pembayaran, dan cek status verifikasi pengembalian alat.
            </p>
          </div>

          <span className="rounded-full bg-ridge px-3.5 py-1 font-mono text-xs font-medium text-fog shadow-sm">
            {history.length} Transaksi
          </span>
        </div>
      </div>

      {/* Konten Riwayat */}
      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white/50 p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper border border-line text-xl font-mono text-ink/40">
            0
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">
            Belum Ada Riwayat Pengajuan
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
            Kamu belum pernah mengajukan sewa peralatan pendakian. Jelajahi katalog alat kami dan ajukan peminjaman pertama kamu.
          </p>
          <div className="mt-6">
            <Link
              href="/user/katalog"
              className="inline-block rounded-xl bg-ridge px-5 py-2.5 text-xs font-semibold text-fog shadow-sm hover:bg-ink transition-all"
            >
              Jelajahi Katalog Alat →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((h) => {
            const isApproved = h.status === "Disetujui";
            const isBorrowed = h.status === "Diambil";
            const isFinished = h.status === "Selesai";
            const isPending = h.status === "Menunggu verifikasi";
            const hasProof = Boolean(h.payment_proof);

            const cleanWa = (h.whatsapp || "").replace(/^0/, "62").replace(/\D/g, "");
            const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(
              `Halo Admin NEXORA, saya ingin konfirmasi terkait pengajuan sewa ${h.id} (${h.item}) dengan status "${h.status}".`
            )}`;

            return (
              <div
                key={h.id}
                className="rounded-2xl border border-line bg-white/80 p-6 shadow-sm transition-all duration-200 hover:shadow-md backdrop-blur-sm"
              >
                {/* Header Card: ID, Nama Alat, Status Badge */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ink/60 bg-paper px-2 py-0.5 rounded-md border border-line">
                        {h.id}
                      </span>
                      <span className="text-xs text-ink/40 font-mono">
                        {h.created_at ? new Date(h.created_at).toLocaleDateString("id-ID") : "-"}
                      </span>
                    </div>

                    <h2 className="mt-2 font-display text-xl font-bold text-ink">
                      {h.item}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink/65">
                      <span>Jadwal: <strong className="text-ink">{h.date}</strong></span>
                      <span>Durasi: <strong>{h.total_days || 1} Hari</strong></span>
                      <span>Total: <strong className="text-ink">{formatRupiah(h.total || h.total_price || 0)}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3.5 py-1 text-xs font-semibold shadow-sm ${
                        statusStyle[h.status] || "bg-amber text-ink"
                      }`}
                    >
                      ● {h.status}
                    </span>

                    {/* Badge Pembayaran (Task 3 & 7) */}
                    {isApproved && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                          hasProof
                            ? "bg-amber/20 border-amber/40 text-ink font-semibold"
                            : "bg-alert/15 border-alert/30 text-alert font-bold"
                        }`}
                      >
                        {hasProof
                          ? "💳 Bukti Diunggah (Menunggu Verifikasi Admin)"
                          : "⚠️ Menunggu Pembayaran"}
                      </span>
                    )}

                    {isBorrowed && (
                      <span className="rounded-full bg-moss/15 border border-moss/30 px-2.5 py-0.5 text-[11px] font-semibold text-moss">
                        ✓ Bayar Terverifikasi & Barang Diambil
                      </span>
                    )}

                    {isFinished && (
                      <span className="rounded-full bg-paper border border-line px-2.5 py-0.5 text-[11px] font-medium text-ink/60">
                        ✓ Selesai & Dikembalikan
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Tracker (4 Tahap: Diajukan -> Disetujui -> Diambil -> Dikembalikan) */}
                <div className="mt-6">
                  <div className="flex items-center">
                    {(h.steps || ["Diajukan", "Disetujui", "Diambil", "Dikembalikan"]).map(
                      (step, i) => (
                        <div key={step} className="flex flex-1 items-center last:flex-none">
                          <div className="flex flex-col items-center gap-1.5 text-center">
                            <span
                              className={`h-3.5 w-3.5 rounded-full transition-colors ${
                                i <= h.currentStep
                                  ? "bg-ridge ring-4 ring-ridge/15"
                                  : "bg-line"
                              }`}
                            />
                            <span
                              className={`text-xs ${
                                i <= h.currentStep
                                  ? "text-ink font-semibold"
                                  : "text-ink/40"
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                          {i < (h.steps || []).length - 1 && (
                            <span
                              className={`mx-2 h-0.5 flex-1 transition-colors ${
                                i < h.currentStep ? "bg-ridge" : "bg-line"
                              }`}
                            />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Bagian Aksi Pembayaran Khusus Pengajuan Disetujui (Task 3 & 7) */}
                {isApproved && (
                  <div className="mt-6 rounded-xl border border-amber/30 bg-amber/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <strong className="text-sm font-display font-bold text-ink">
                          {hasProof
                            ? "Bukti Pembayaran Sedang Diverifikasi"
                            : "Pengajuan Disetujui! Silakan Lakukan Pembayaran"}
                        </strong>
                        <p className="mt-0.5 text-xs text-ink/70">
                          {hasProof
                            ? "Bukti pembayaran kamu sudah kami terima dan sedang ditinjau admin. Silakan datang ke basecamp sesuai jadwal."
                            : "Pilih metode pembayaran (QRIS / BRIVA) dan unggah bukti transfer sebelum mengambil peralatan."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/user/payment?rentalId=${h.id}`}
                          className="rounded-xl bg-ridge px-4 py-2 text-xs font-semibold text-fog shadow-sm hover:bg-ink transition-all"
                        >
                          {hasProof ? "Lihat / Ubah Bukti Bayar →" : "Bayar Sekarang (QRIS / VA) →"}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Informasi & Kontak Admin */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/50 pt-4 text-xs text-ink/60">
                  <span>
                    Catatan peminjam: {h.note || "Tidak ada catatan khusus."}
                  </span>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-medium text-ridge hover:underline transition-colors"
                  >
                    <span>💬</span>
                    <span>Tanya Admin seputar pesanan ini</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
