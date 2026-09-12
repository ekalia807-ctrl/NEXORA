"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// 1. Fungsi validasi tunggal (DRY - dipakai untuk submit & blur)
function validateLoginForm({ email, password }) {
  const errs = {};
  const cleanEmail = email.trim();

  if (!cleanEmail) {
    errs.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    errs.email = "Format email tidak valid (contoh: nama@email.com)";
  }

  if (!password) {
    errs.password = "Kata sandi wajib diisi";
  } else if (password.length < 6) {
    errs.password = "Kata sandi minimal 6 karakter";
  }

  return errs;
}

// 2. Helper icon mata (reusable, tidak mengotori JSX form)
function EyeIcon({ open }) {
  return open ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

// 3. Helper loading spinner
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-fog" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "";

  // Cegah open-redirect
  const safeRedirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : null;

  // Validasi onBlur tinggal panggil fungsi validasi tunggal
  function handleBlur(field) {
    const errs = validateLoginForm({ email, password });
    setErrors((prev) => ({ ...prev, [field]: errs[field] || "" }));
  }

  function handleLogin(e) {
    e.preventDefault();
    const errs = validateLoginForm({ email, password });
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      setToast({ type: "error", message: "Mohon periksa kembali kolom yang belum sesuai." });
      return;
    }

    setLoading(true);
    setToast(null);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const isAdmin = cleanEmail.includes("admin");
      localStorage.setItem("role", isAdmin ? "admin" : "user");
      window.dispatchEvent(new Event("role-changed"));

      setToast({ type: "success", message: `Berhasil masuk sebagai ${isAdmin ? "Admin" : "Peminjam"}!` });
      setTimeout(() => router.push(isAdmin ? "/admin/dashboard" : (safeRedirect || "/user/dashboard")), 600);
    }, 500);
  }

  const registerHref = safeRedirect ? `/register?redirect=${encodeURIComponent(safeRedirect)}` : "/register";

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <div className="border border-line bg-white/40 p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-ink">Masuk</h1>
          <p className="mt-2 text-sm text-ink/65">
            Masuk ke NEXORA. Gunakan email mengandung kata <span className="font-mono font-bold text-amber">&quot;admin&quot;</span> untuk panel admin.
          </p>
        </div>

        {safeRedirect && !toast && (
          <div className="mt-5 rounded-sm border border-amber/40 bg-amber/15 p-3 text-xs text-ink/80 flex items-start gap-2">
            <span>💡 Silakan masuk terlebih dahulu untuk melanjutkan pengajuan sewa.</span>
          </div>
        )}

        {toast && (
          <div
            role="alert"
            className={`mt-5 rounded-sm border px-3.5 py-2.5 text-xs flex items-center justify-between ${
              toast.type === "success" ? "border-moss/40 bg-moss/10 text-moss font-medium" : "border-alert/40 bg-alert/10 text-alert"
            }`}
          >
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} className="text-xs opacity-60 hover:opacity-100 ml-2">✕</button>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate className="mt-6 space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-ink/75">Email</label>
            <input
              id="login-email"
              type="email"
              autoFocus
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="nama@email.com"
              className={`mt-1.5 w-full border bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors ${
                errors.email ? "border-alert focus:border-alert" : "border-line focus:border-ridge"
              } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            />
            {errors.email && <p className="mt-1 text-xs text-alert flex items-center gap-1"><span>⚠</span><span>{errors.email}</span></p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-ink/75">Kata Sandi</label>
            <div className="relative mt-1.5">
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="••••••••"
                className={`w-full border bg-paper px-3 py-2 pr-10 text-sm text-ink outline-none transition-colors ${
                  errors.password ? "border-alert focus:border-alert" : "border-line focus:border-ridge"
                } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                disabled={loading}
                aria-label={showPw ? "Sembunyikan sandi" : "Lihat sandi"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-ink/50 hover:text-ink focus:outline-none"
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-alert flex items-center gap-1"><span>⚠</span><span>{errors.password}</span></p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-sm bg-ridge py-2.5 text-center text-sm font-medium text-fog transition-all ${
              loading ? "opacity-75 cursor-not-allowed" : "hover:bg-ink active:scale-[0.99]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                <span>Memproses...</span>
              </span>
            ) : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/60">
          Belum punya akun?{" "}
          <Link href={registerHref} className="font-medium text-ink underline underline-offset-4 hover:text-amber">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm text-ink/50">Memuat formulir masuk...</div>}>
      <LoginForm />
    </Suspense>
  );
}