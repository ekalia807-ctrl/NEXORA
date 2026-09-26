"use client";

export default function CustomerInfoFields({
  startDate,
  endDate,
  name,
  whatsapp,
  todayStr,
  errors,
  startDateInputRef,
  endDateInputRef,
  nameInputRef,
  whatsappInputRef,
  handleStartDateChange,
  handleEndDateChange,
  handleNameChange,
  handleWhatsappChange,
  handleWhatsappKeyDown,
  handleWhatsappPaste,
  handleWhatsappBlur,
}) {
  return (
    <div className="space-y-5">
      {/* Tanggal Mulai & Selesai */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
            Tanggal Mulai Sewa
          </label>
          <input
            ref={startDateInputRef}
            type="date"
            required
            min={todayStr}
            value={startDate}
            onChange={handleStartDateChange}
            className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm text-ink outline-none transition-all ${
              errors.startDate
                ? "border-alert bg-alert/5 focus:border-alert focus:bg-white focus:ring-2 focus:ring-alert/20"
                : "border-line bg-paper/60 focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
            }`}
          />
          {errors.startDate && (
            <p id="startDate-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-alert">
              <svg className="h-3.5 w-3.5 shrink-0 text-alert" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errors.startDate}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
            Tanggal Selesai Sewa
          </label>
          <input
            ref={endDateInputRef}
            type="date"
            required
            min={startDate || todayStr}
            value={endDate}
            onChange={handleEndDateChange}
            className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm text-ink outline-none transition-all ${
              errors.endDate
                ? "border-alert bg-alert/5 focus:border-alert focus:bg-white focus:ring-2 focus:ring-alert/20"
                : "border-line bg-paper/60 focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
            }`}
          />
          {errors.endDate && (
            <p id="endDate-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-alert">
              <svg className="h-3.5 w-3.5 shrink-0 text-alert" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errors.endDate}</span>
            </p>
          )}
        </div>
      </div>

      {/* Nama Lengkap */}
      <div>
        <label htmlFor="checkout-name" className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
          Nama Lengkap Sesuai KTP
        </label>
        <input
          ref={nameInputRef}
          id="checkout-name"
          type="text"
          required
          value={name}
          onChange={handleNameChange}
          placeholder="Masukkan nama lengkap sesuai KTP"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm text-ink outline-none transition-all ${
            errors.name
              ? "border-alert bg-alert/5 focus:border-alert focus:bg-white focus:ring-2 focus:ring-alert/20"
              : "border-line bg-paper/60 focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          }`}
        />
        {errors.name && (
          <p id="name-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-alert">
            <svg className="h-3.5 w-3.5 shrink-0 text-alert" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errors.name}</span>
          </p>
        )}
      </div>

      {/* WhatsApp */}
      <div>
        <label htmlFor="checkout-whatsapp" className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
          Nomor WhatsApp Aktif
          <span className="ml-1 font-normal normal-case text-ink/40">(opsional)</span>
        </label>
        <input
          ref={whatsappInputRef}
          id="checkout-whatsapp"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="tel"
          maxLength={15}
          value={whatsapp}
          onChange={handleWhatsappChange}
          onKeyDown={handleWhatsappKeyDown}
          onPaste={handleWhatsappPaste}
          onBlur={handleWhatsappBlur}
          placeholder="Contoh: 081234567890"
          aria-invalid={errors.whatsapp ? "true" : "false"}
          aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
          className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 font-mono text-sm text-ink outline-none transition-all ${
            errors.whatsapp
              ? "border-alert bg-alert/5 focus:border-alert focus:bg-white focus:ring-2 focus:ring-alert/20"
              : "border-line bg-paper/60 focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          }`}
        />
        <p className="mt-1.5 text-[11px] text-ink/45">
          Nomor WhatsApp digunakan untuk konfirmasi status persetujuan dari tim admin.
        </p>
        {errors.whatsapp && (
          <p id="whatsapp-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-alert">
            <svg className="h-3.5 w-3.5 shrink-0 text-alert" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errors.whatsapp}</span>
          </p>
        )}
      </div>
    </div>
  );
}
