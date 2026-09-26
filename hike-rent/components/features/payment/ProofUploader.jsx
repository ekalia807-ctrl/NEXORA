"use client";

export default function ProofUploader({
  proofFile,
  proofPreview,
  userNotes,
  submitting,
  submittedSuccess,
  onFileChange,
  onNotesChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 border-t border-line/60 pt-6 space-y-4">
      <div>
        <h3 className="font-display text-base font-bold text-ink">
          Unggah Bukti Pembayaran
        </h3>
        <p className="mt-0.5 text-xs text-ink/60">
          Wajib mengunggah screenshot atau foto struk transfer sebelum admin dapat memverifikasi dan menyerahkan alat.
        </p>
      </div>

      {/* File Upload Drop Area */}
      <div className="relative rounded-2xl border-2 border-dashed border-line bg-paper/30 p-6 text-center hover:bg-paper/50 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center">
          <span className="text-3xl">📷</span>
          <p className="mt-2 text-xs font-semibold text-ink">
            {proofFile ? proofFile.name : "Klik atau seret foto bukti transfer di sini"}
          </p>
          <p className="mt-1 text-[11px] text-ink/50">
            Format: JPG, PNG, atau WEBP (Maks 5MB)
          </p>
        </div>
      </div>

      {/* Preview Bukti yang Diunggah */}
      {proofPreview && (
        <div className="rounded-xl border border-line bg-paper/40 p-4">
          <span className="text-xs font-semibold text-ink block mb-2">
            Pratinjau Bukti Transfer:
          </span>
          <div className="max-w-xs mx-auto overflow-hidden rounded-xl border border-line shadow-sm">
            <img
              src={proofPreview}
              alt="Pratinjau Bukti"
              className="w-full max-h-56 object-cover"
            />
          </div>
        </div>
      )}

      {/* Catatan Tambahan */}
      <div>
        <label className="block text-xs font-semibold text-ink/75 mb-1">
          Catatan Pembayaran (Opsional):
        </label>
        <input
          type="text"
          value={userNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Contoh: Transfer atas nama Budi Santoso via BCA Mobile"
          className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ridge focus:bg-white"
        />
      </div>

      {/* Tombol Kirim Bukti */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || !proofPreview}
          className="rounded-xl bg-ridge px-6 py-2.5 text-xs font-semibold text-fog shadow-sm hover:bg-ink transition-all disabled:opacity-50"
        >
          {submitting
            ? "Mengirim..."
            : submittedSuccess
            ? "Perbarui Bukti Pembayaran"
            : "Kirim Bukti Pembayaran"}
        </button>

        {submittedSuccess && (
          <span className="rounded-full bg-moss/15 px-3 py-1 text-xs font-semibold text-moss">
            ✓ Bukti pembayaran telah tersimpan
          </span>
        )}
      </div>
    </form>
  );
}
