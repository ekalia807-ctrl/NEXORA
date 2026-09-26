"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/app/actions/auth";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  function validate() {
    const errs = {};
    if (!email.trim()) errs.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Format email tidak valid";
    if (!password) errs.password = "Kata sandi wajib diisi";
    else if (password.length < 6) errs.password = "Kata sandi minimal 6 karakter";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await loginAction({ email, password });

      if (!res.success) {
        setError(res.error || "Email belum terdaftar atau kata sandi tidak cocok. Silakan daftar terlebih dahulu.");
        setLoading(false);
        return;
      }

      // Sinkronisasi status peran ke localStorage untuk reaktivitas UI navbar
      const role = res.user?.role || "user";
      localStorage.setItem("role", role);
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      window.dispatchEvent(new Event("role-changed"));

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push(redirect || "/user/katalog");
      }
    } catch (err) {
      setError(err.message || "Gagal menghubungi server database kampus. Silakan coba lagi.");
      setLoading(false);
    }
  }

  // Quick fill demo accounts
  function fillAccount(role) {
    if (role === "admin") {
      setEmail("admin@hikerent.com");
      setPassword("password123");
    } else {
      setEmail("user@hikerent.com");
      setPassword("password123");
    }
    setError(null);
    setErrors({});
  }

  const registerHref = redirect
    ? `/register?redirect=${encodeURIComponent(redirect)}`
    : "/register";

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-12">
      <div className="border border-line bg-white/40 p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-ink">Masuk</h1>
          <p className="mt-2 text-sm text-ink/65">
            Masuk ke NEXORA menggunakan akun yang terdaftar di basis data.
          </p>
        </div>

        {redirect && (
          <div className="mt-5 rounded-sm border border-amber/40 bg-amber/15 p-3 text-xs text-ink/80">
            Silakan masuk terlebih dahulu untuk melanjutkan pengajuan sewa alat Anda.
          </div>
        )}

        {/* Demo Account Helper */}
        <div className="mt-4 rounded-sm border border-line/60 bg-paper/60 p-3 text-xs">
          <div className="flex items-center justify-between font-semibold text-ink/70 mb-1.5">
            <span>Akun Uji Coba Terdaftar:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => fillAccount("admin")}
              className="rounded border border-line bg-white px-2 py-1 text-[11px] font-medium text-ink hover:border-ridge transition-colors"
            >
              Admin (admin@hikerent.com)
            </button>
            <button
              type="button"
              onClick={() => fillAccount("user")}
              className="rounded border border-line bg-white px-2 py-1 text-[11px] font-medium text-ink hover:border-ridge transition-colors"
            >
              User (user@hikerent.com)
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-sm border border-alert/40 bg-alert/10 p-3 text-xs text-alert flex items-start justify-between"
          >
            <div>
              <p className="font-semibold">Login Gagal</p>
              <p className="mt-0.5">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs opacity-60 hover:opacity-100 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-5 space-y-5">
          <label className="block">
            <span className="text-sm text-ink/70">Email</span>
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="nama@email.com"
              className={`mt-1.5 w-full border bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors ${
                errors.email ? "border-alert focus:border-alert" : "border-line focus:border-ridge"
              } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            />
            {errors.email && <p className="mt-1 text-xs text-alert">{errors.email}</p>}
          </label>

          <label className="block">
            <span className="text-sm text-ink/70">Kata sandi</span>
            <input
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="••••••••"
              className={`mt-1.5 w-full border bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors ${
                errors.password ? "border-alert focus:border-alert" : "border-line focus:border-ridge"
              } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            />
            {errors.password && <p className="mt-1 text-xs text-alert">{errors.password}</p>}
          </label>

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
                <span>Memverifikasi akun...</span>
              </span>
            ) : (
              "Masuk"
            )}
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