"use client";

export default function KtpUploader({
  ktpInputRef,
  ktpPreview,
  errors,
  onChange,
  onRemove,
}) {
  return (
    <div className="border-t border-line/50 pt-4">
      <label
        htmlFor="checkout-ktp"
        className="block text-xs font-semibold uppercase tracking-wide text-ink/70"
      >
        2. Unggah Foto KTP / Kartu Identitas
      </label>

      <div
        className={`mt-2 rounded-xl border p-3 transition-all ${
          errors?.ktp
            ? "border-alert bg-alert/5 ring-2 ring-alert/10"
            : "border-line bg-paper/60"
        }`}
      >
        <input
          ref={ktpInputRef}
          id="checkout-ktp"
          type="file"
          accept="image/*"
          onChange={onChange}
          aria-invalid={errors?.ktp ? "true" : "false"}
          aria-describedby={errors?.ktp ? "ktp-error" : undefined}
          className="w-full cursor-pointer text-xs text-ink/70 file:mr-4 file:rounded-xl file:border-0 file:bg-ridge file:px-4 file:py-2 file:text-xs file:font-semibold file:text-fog hover:file:bg-ink focus:outline-none"
        />
      </div>

      <p className="mt-1.5 text-[11px] text-ink/45">
        Foto KTP wajib diunggah sebagai jaminan identitas peminjaman peralatan luar ruangan.
      </p>

      {errors?.ktp && (
        <p
          id="ktp-error"
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-alert"
        >
          <svg
            className="h-3.5 w-3.5 shrink-0 text-alert"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errors.ktp}</span>
        </p>
      )}

      {ktpPreview && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-ink/50">Pratinjau KTP Terunggah:</p>
            <button
              type="button"
              onClick={onRemove}
              className="text-[11px] font-medium text-alert hover:underline"
            >
              Hapus / Ganti Foto
            </button>
          </div>

          <img
            src={ktpPreview}
            alt="Pratinjau KTP"
            className="max-h-60 w-full rounded-xl border border-line bg-paper/60 object-contain p-2 shadow-sm"
          />
        </div>
      )}
    </div>
  );
}
