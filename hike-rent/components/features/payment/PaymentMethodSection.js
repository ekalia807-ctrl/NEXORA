"use client";

import { PaymentMethodTabs } from "./PaymentMethodTabs";
import { QrisView } from "./QrisView";
import { BrivaView } from "./BrivaView";
import { ProofUploader } from "./ProofUploader";

export default function PaymentMethodSection({
  method,
  setMethod,
  selectedRental,
  brivaNumber,
  copied,
  onCopyVA,
  proofFile,
  proofPreview,
  userNotes,
  submitting,
  submittedSuccess,
  onFileChange,
  setUserNotes,
  onSubmitProof,
}) {
  const totalAmount = selectedRental?.total || selectedRental?.total_price || 0;

  return (
    <div className="rounded-2xl border border-line bg-white/80 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="font-display text-xl font-bold text-ink">
        Pilih Metode Pembayaran
      </h2>
      <p className="mt-1 text-xs text-ink/60">
        Pilih salah satu metode pembayaran simulasi di bawah ini untuk menyelesaikan transaksi.
      </p>

      {/* Selector Tabs: QRIS vs BRIVA */}
      <div className="mt-5">
        <PaymentMethodTabs method={method} onSelectMethod={setMethod} />
      </div>

      {/* Tampilan Visual QRIS */}
      {method === "qris" && (
        <QrisView totalAmount={totalAmount} />
      )}

      {/* Tampilan Visual BRIVA */}
      {method === "briva" && (
        <BrivaView
          brivaNumber={brivaNumber}
          totalAmount={totalAmount}
          copied={copied}
          onCopy={onCopyVA}
        />
      )}

      {/* Form Unggah Bukti Bayar */}
      <ProofUploader
        proofFile={proofFile}
        proofPreview={proofPreview}
        userNotes={userNotes}
        submitting={submitting}
        submittedSuccess={submittedSuccess}
        onFileChange={onFileChange}
        onNotesChange={setUserNotes}
        onSubmit={onSubmitProof}
      />
    </div>
  );
}
