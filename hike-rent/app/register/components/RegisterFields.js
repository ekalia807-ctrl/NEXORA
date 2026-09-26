"use client";

import { EyeIcon } from "../utils/registerValidation";

export default function RegisterFields({
  form,
  loading,
  errors,
  showPw,
  setShowPw,
  showConfirmPw,
  setShowConfirmPw,
  updateField,
  handleBlur,
}) {
  return (
    <>
      {/* Nama */}
      <div>
        <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
          Nama Lengkap
        </label>
        <input
          id="reg-name"
          type="text"
          autoFocus
          disabled={loading}
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          placeholder="Contoh: Rian Anggara"
          className={`mt-1.5 w-full rounded-xl border bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all ${
            errors.name
              ? "border-alert focus:border-alert focus:ring-2 focus:ring-alert/10"
              : "border-line focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        />
        {errors.name && <p className="mt-1 text-xs text-alert font-medium">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
          Alamat Email
        </label>
        <input
          id="reg-email"
          type="email"
          disabled={loading}
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          placeholder="nama@email.com"
          className={`mt-1.5 w-full rounded-xl border bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all ${
            errors.email
              ? "border-alert focus:border-alert focus:ring-2 focus:ring-alert/10"
              : "border-line focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        />
        {errors.email && <p className="mt-1 text-xs text-alert font-medium">{errors.email}</p>}
      </div>

      {/* Kata Sandi */}
      <div>
        <label htmlFor="reg-password" className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
          Kata Sandi
        </label>
        <div className="relative mt-1.5">
          <input
            id="reg-password"
            type={showPw ? "text" : "password"}
            disabled={loading}
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            placeholder="Minimal 6 karakter"
            className={`w-full rounded-xl border bg-paper/60 px-4 py-2.5 pr-10 text-sm text-ink outline-none transition-all ${
              errors.password
                ? "border-alert focus:border-alert focus:ring-2 focus:ring-alert/10"
                : "border-line focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
            } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            disabled={loading}
            aria-label={showPw ? "Sembunyikan sandi" : "Lihat sandi"}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-ink/50 hover:text-ink focus:outline-none"
          >
            <EyeIcon open={showPw} />
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-alert font-medium">{errors.password}</p>}
      </div>

      {/* Konfirmasi Kata Sandi */}
      <div>
        <label htmlFor="reg-confirm-password" className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
          Konfirmasi Kata Sandi
        </label>
        <div className="relative mt-1.5">
          <input
            id="reg-confirm-password"
            type={showConfirmPw ? "text" : "password"}
            disabled={loading}
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            placeholder="Ulangi kata sandi"
            className={`w-full rounded-xl border bg-paper/60 px-4 py-2.5 pr-10 text-sm text-ink outline-none transition-all ${
              errors.confirmPassword
                ? "border-alert focus:border-alert focus:ring-2 focus:ring-alert/10"
                : "border-line focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
            } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPw(!showConfirmPw)}
            disabled={loading}
            aria-label={showConfirmPw ? "Sembunyikan konfirmasi sandi" : "Lihat konfirmasi sandi"}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-ink/50 hover:text-ink focus:outline-none"
          >
            <EyeIcon open={showConfirmPw} />
          </button>
        </div>
        {errors.confirmPassword && <p className="mt-1 text-xs text-alert font-medium">{errors.confirmPassword}</p>}
      </div>
    </>
  );
}
