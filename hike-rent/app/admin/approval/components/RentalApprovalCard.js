"use client";

import { statusStyle } from "@/constants/rentalStatus";
import { formatRupiah } from "@/lib/utils/hitungBiaya";
import RentalCardActions from "./RentalCardActions";
import RentalCardAuditTrail from "./RentalCardAuditTrail";

export default function RentalApprovalCard({
  req,
  isLoading,
  statusNote,
  onStatusNoteChange,
  onStatusTransition,
  onOpenProofModal,
}) {
  const cleanWa = (req.whatsapp || "").replace(/^0/, "62").replace(/\D/g, "");
  const waMessage = encodeURIComponent(
    `Halo ${req.name}, terkait transaksi sewa NEXORA ${req.id} (${req.item}), status saat ini adalah: "${req.status}".`
  );
  const waUrl = `https://wa.me/${cleanWa || "6281234567890"}?text=${waMessage}`;

  const isPending =
    req.status === "Menunggu verifikasi" ||
    req.status === "diajukan" ||
    req.status === "menunggu_verifikasi";
  const isApproved =
    req.status === "Disetujui" ||
    req.status === "diverifikasi" ||
    req.status === "aktif";
  const isBorrowed = req.status === "Diambil" || req.status === "diambil";
  const isFinished =
    req.status === "Selesai" ||
    req.status === "dikembalikan" ||
    req.status === "selesai";
  const isRejected =
    req.status === "Ditolak" ||
    req.status === "ditolak" ||
    req.status === "Dibatalkan";
  const hasPaymentProof = Boolean(
    req.payment_proof && String(req.payment_proof).trim().length > 10
  );

  return (
    <div className="rounded-2xl border border-line bg-white/80 p-6 shadow-sm transition-all duration-200 hover:shadow-md backdrop-blur-sm">
      {/* Header Card: ID, Nama, Status Badge */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-ink/60 bg-paper px-2 py-0.5 rounded-md border border-line">
              {req.id}
            </span>
            <span className="text-xs text-ink/40 font-mono">
              {req.created_at ? new Date(req.created_at).toLocaleDateString("id-ID") : "-"}
            </span>
          </div>

          <h2 className="mt-2 font-display text-xl font-bold text-ink">{req.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink/70">
            <span>
              WhatsApp: <strong className="font-mono text-ink">{req.whatsapp}</strong>
            </span>
            {req.ktp_number && (
              <span>
                KTP: <strong className="font-mono text-ink">{req.ktp_number}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3.5 py-1 text-xs font-semibold shadow-sm ${
              statusStyle[req.status] || "bg-amber text-ink"
            }`}
          >
            ● {req.status}
          </span>

          {/* Badge Status Pembayaran */}
          {req.payment_status && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                req.payment_status === "terverifikasi"
                  ? "bg-moss/10 border-moss/30 text-moss"
                  : req.payment_status === "menunggu_verifikasi"
                  ? "bg-amber/20 border-amber/40 text-ink font-semibold"
                  : "bg-paper border-line text-ink/60"
              }`}
            >
              {req.payment_status === "terverifikasi" && "✓ Bayar Terverifikasi"}
              {req.payment_status === "menunggu_verifikasi" && "💳 Bukti Bayar Diunggah (Perlu Dicek)"}
              {req.payment_status === "menunggu_pembayaran" && "⏳ Menunggu Pembayaran User"}
              {req.payment_status === "belum_tersedia" && "Pembayaran Belum Dibuka"}
            </span>
          )}
        </div>
      </div>

      {/* Detail Alat & Biaya */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-paper/50 p-4 border border-line/60 text-xs text-ink/75">
        <div>
          <span className="font-mono text-[10px] uppercase text-ink/50 block">Peralatan Sewa</span>
          <strong className="text-sm font-semibold text-ink mt-0.5 block">{req.item}</strong>
          {Array.isArray(req.items) && req.items.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {req.items.map((it, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md bg-white border border-line/60 px-1.5 py-0.5 text-[10px] text-ink/75 font-medium shadow-2xs"
                >
                  {it.gear_name || it.name} × {it.quantity || it.jumlah || 1}
                </span>
              ))}
            </div>
          )}
          <span className="text-ink/60 mt-1 block">Kategori: {req.category || "Peralatan"}</span>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase text-ink/50 block">
            Jadwal Pengambilan & Durasi
          </span>
          <strong className="text-sm font-semibold text-ink mt-0.5 block">{req.date}</strong>
          <span className="text-ink/60">Durasi: {req.total_days || req.nights || 1} hari sewa</span>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase text-ink/50 block">Total Biaya Sewa</span>
          <strong className="text-base font-bold text-ink mt-0.5 block">
            {formatRupiah(req.total || req.total_price || 0)}
          </strong>
          <span className="text-ink/60">Metode: {req.payment_method || "Simulasi Transfer"}</span>
        </div>
      </div>

      {/* Catatan Penyewa */}
      {req.note && (
        <div className="mt-3 rounded-lg bg-white p-3 border border-line/50 text-xs text-ink/75">
          <strong className="text-ink">Catatan Peminjam:</strong> {req.note}
        </div>
      )}

      {/* Bukti Bayar Preview & Lightbox Trigger */}
      {req.payment_proof && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber/30 bg-amber/10 p-3.5">
          <div className="flex items-center gap-3">
            <img
              src={req.payment_proof}
              alt="Bukti Transfer"
              onClick={() => onOpenProofModal(req.payment_proof)}
              className="h-12 w-12 cursor-pointer rounded-lg border border-line object-cover shadow-sm hover:scale-105 transition-transform"
            />
            <div>
              <div className="text-xs font-semibold text-ink">Bukti Pembayaran Diunggah</div>
              <div className="text-[11px] text-ink/60">
                {req.payment_notes ? `"${req.payment_notes}" • ` : ""}
                {req.payment_date || "Menunggu verifikasi"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenProofModal(req.payment_proof)}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink border border-line shadow-sm hover:bg-paper transition-all"
          >
            🔍 Perbesar Bukti Bayar
          </button>
        </div>
      )}

      {/* Warning Banner Jika Belum Ada Bukti Pembayaran */}
      {isApproved && !hasPaymentProof && (
        <div className="mt-3.5 flex items-start gap-3 rounded-xl border border-amber/50 bg-amber/15 p-3.5 text-xs text-amber-950">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <div>
            <strong className="block font-semibold text-amber-950">
              Peminjam Belum Konfirmasi Pembayaran
            </strong>
            <p className="mt-0.5 text-[11px] text-amber-850/90 leading-relaxed">
              Peminjam belum mengunggah bukti transfer atau struk pembayaran. Tombol penyerahan alat (
              <strong className="font-mono text-amber-950">&quot;Diambil&quot;</strong>) dikunci untuk
              mencegah penyerahan barang sebelum pembayaran diselesaikan.
            </p>
          </div>
        </div>
      )}

      {/* Input Catatan Petugas */}
      {!isFinished && !isRejected && (
        <div className="mt-4">
          <input
            type="text"
            value={statusNote || ""}
            onChange={(e) => onStatusNoteChange(e.target.value)}
            placeholder="Tambahkan catatan petugas/audit untuk perubahan status ini (opsional)..."
            className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-xs text-ink placeholder:text-ink/40 outline-none focus:border-ridge focus:bg-white"
          />
        </div>
      )}

      {/* Status Action Buttons */}
      <RentalCardActions
        req={req}
        isLoading={isLoading}
        isPending={isPending}
        isApproved={isApproved}
        isBorrowed={isBorrowed}
        isFinished={isFinished}
        isRejected={isRejected}
        hasPaymentProof={hasPaymentProof}
        waUrl={waUrl}
        onStatusTransition={onStatusTransition}
      />

      {/* Linimasa Audit Trail Status History Logs */}
      <RentalCardAuditTrail statusLogs={req.status_logs} />
    </div>
  );
}
