"use client";

export default function PaymentProofModal({ proofModalUrl, onClose }) {
  if (!proofModalUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-lg w-full rounded-2xl bg-white p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <span className="font-display text-sm font-semibold text-ink">
            Bukti Pembayaran Peminjam
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-ink/50 hover:bg-paper hover:text-ink text-sm font-bold"
          >
            ✕
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center overflow-hidden rounded-xl bg-paper">
          <img
            src={proofModalUrl}
            alt="Bukti Pembayaran"
            className="max-h-[70vh] w-auto object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
