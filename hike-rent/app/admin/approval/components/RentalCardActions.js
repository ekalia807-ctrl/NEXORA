"use client";

export default function RentalCardActions({
  req,
  isLoading,
  isPending,
  isApproved,
  isBorrowed,
  isFinished,
  isRejected,
  hasPaymentProof,
  waUrl,
  onStatusTransition,
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Tahap 1: Approval */}
        {isPending && (
          <>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onStatusTransition(req, "Disetujui")}
              className="rounded-xl bg-ridge px-4 py-2 text-xs font-semibold text-fog shadow-sm hover:bg-ink transition-all disabled:opacity-50"
            >
              ✓ Setujui Pengajuan
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onStatusTransition(req, "Ditolak")}
              className="rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-xs font-semibold text-alert hover:border-alert/40 hover:bg-alert/10 transition-all disabled:opacity-50"
            >
              ✕ Tolak
            </button>
          </>
        )}

        {/* Tahap 2: Menunggu Pembayaran -> Diambil */}
        {isApproved && (
          <>
            {hasPaymentProof ? (
              <button
                type="button"
                disabled={isLoading}
                onClick={() =>
                  onStatusTransition(
                    req,
                    "Diambil",
                    "Pembayaran terverifikasi oleh Admin. Alat diserahkan kepada peminjam."
                  )
                }
                className="rounded-xl bg-ridge px-4 py-2 text-xs font-semibold text-fog shadow-sm hover:bg-ink transition-all disabled:opacity-50"
              >
                📦 Konfirmasi Bayar & Serahkan Alat (Diambil)
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    alert(
                      "⚠️ PERINGATAN: Peminjam belum mengonfirmasi pembayaran atau mengunggah bukti transfer!\n\nAdmin tidak dapat menyerahkan alat atau mengubah status ke 'Diambil' sebelum peminjam mengunggah foto bukti bayar."
                    );
                  }}
                  className="cursor-pointer rounded-xl bg-amber/15 border border-amber/40 px-4 py-2 text-xs font-semibold text-amber-950 shadow-xs hover:bg-amber/25 transition-all flex items-center gap-1.5"
                  title="Klik untuk melihat status terkunci"
                >
                  <span>🔒</span>
                  <span>Serahkan Alat (Terkunci: Belum Ada Bukti Bayar)</span>
                </button>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-line bg-paper px-3 py-2 text-xs font-medium text-ink/70 hover:bg-white hover:text-ink transition-all"
                >
                  💬 Ingatkan via WA
                </a>
              </div>
            )}
            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                onStatusTransition(req, "Dibatalkan", "Pengajuan dibatalkan oleh Admin.")
              }
              className="rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-xs font-semibold text-alert hover:border-alert/40 hover:bg-alert/10 transition-all disabled:opacity-50"
            >
              Batalkan
            </button>
          </>
        )}

        {/* Tahap 3: Sedang Dipinjam -> Selesai / Dikembalikan */}
        {isBorrowed && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() =>
              onStatusTransition(
                req,
                "Selesai",
                "Peralatan telah dikembalikan ke basecamp dalam kondisi baik. Peminjaman selesai."
              )
            }
            className="rounded-xl bg-moss px-4 py-2 text-xs font-semibold text-fog shadow-sm hover:bg-[#3d593c] transition-all disabled:opacity-50"
          >
            ✓ Alat Dikembalikan (Selesaikan Transaksi)
          </button>
        )}

        {/* Transaksi Selesai */}
        {isFinished && (
          <span className="rounded-xl bg-paper px-3 py-1.5 font-mono text-xs text-ink/60 border border-line">
            ✓ Transaksi Selesai & Ditutup
          </span>
        )}

        {/* Transaksi Ditolak */}
        {isRejected && (
          <span className="rounded-xl bg-alert/10 px-3 py-1.5 font-mono text-xs text-alert border border-alert/20">
            ✕ Pengajuan Ditolak / Dibatalkan
          </span>
        )}
      </div>

      {/* Tombol Hubungi WhatsApp */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-xl border border-ridge/40 bg-paper/60 px-3.5 py-2 text-xs font-semibold text-ridge hover:bg-ridge hover:text-fog transition-all shadow-sm"
      >
        <span>💬</span>
        <span>Chat WhatsApp</span>
      </a>
    </div>
  );
}
