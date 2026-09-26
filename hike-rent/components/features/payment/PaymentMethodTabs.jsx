"use client";

export default function PaymentMethodTabs({ method, onSelectMethod }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onSelectMethod("qris")}
        className={`rounded-xl border p-4 text-left transition-all ${
          method === "qris"
            ? "border-ridge bg-ridge/5 ring-2 ring-ridge/20 shadow-sm"
            : "border-line bg-paper/50 hover:bg-paper"
        }`}
      >
        <div className="flex items-center justify-between">
          <strong className="font-display text-sm text-ink">QRIS</strong>
          <span className="rounded-md bg-paper px-2 py-0.5 text-[10px] font-bold text-ink/70 border border-line">
            Instant
          </span>
        </div>
        <p className="mt-1 text-xs text-ink/60">
          Scan via GoPay, BCA, OVO, ShopeePay, Dana, dll.
        </p>
      </button>

      <button
        type="button"
        onClick={() => onSelectMethod("briva")}
        className={`rounded-xl border p-4 text-left transition-all ${
          method === "briva"
            ? "border-ridge bg-ridge/5 ring-2 ring-ridge/20 shadow-sm"
            : "border-line bg-paper/50 hover:bg-paper"
        }`}
      >
        <div className="flex items-center justify-between">
          <strong className="font-display text-sm text-ink">BRIVA</strong>
          <span className="rounded-md bg-paper px-2 py-0.5 text-[10px] font-bold text-ink/70 border border-line">
            Virtual Account
          </span>
        </div>
        <p className="mt-1 text-xs text-ink/60">
          Transfer via BRImo, ATM BRI, atau Bank Lain.
        </p>
      </button>
    </div>
  );
}
