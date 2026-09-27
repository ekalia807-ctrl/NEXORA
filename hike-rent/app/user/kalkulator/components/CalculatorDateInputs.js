"use client";

export default function CalculatorDateInputs({
  todayStr,
  tanggalMulai,
  setTanggalMulai,
  tanggalSelesai,
  setTanggalSelesai,
  startError,
  endError,
  generalError,
}) {
  return (
    <>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70 print:text-black">
            Tanggal mulai sewa
            <input
              type="date"
              min={todayStr}
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm text-ink outline-none transition-all ${
                tanggalMulai && startError
                  ? "border-alert bg-alert/5 focus:border-alert focus:bg-white focus:ring-2 focus:ring-alert/20"
                  : "border-line bg-paper/60 focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              }`}
            />
          </label>
          {tanggalMulai && startError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-alert">
              <svg className="h-3.5 w-3.5 shrink-0 text-alert" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{startError}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70 print:text-black">
            Tanggal selesai sewa
            <input
              type="date"
              min={tanggalMulai || todayStr}
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm text-ink outline-none transition-all ${
                tanggalSelesai && endError
                  ? "border-alert bg-alert/5 focus:border-alert focus:bg-white focus:ring-2 focus:ring-alert/20"
                  : "border-line bg-paper/60 focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              }`}
            />
          </label>
          {tanggalSelesai && endError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-alert">
              <svg className="h-3.5 w-3.5 shrink-0 text-alert" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{endError}</span>
            </p>
          )}
        </div>
      </div>

      {generalError && !startError && !endError && (
        <div className="mt-4 rounded-xl border border-alert/30 bg-alert/10 p-3.5 text-xs text-alert font-medium">
          {generalError}
        </div>
      )}
    </>
  );
}
