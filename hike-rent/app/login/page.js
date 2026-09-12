"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  function handleLogin(e) {
    e.preventDefault();

    if (email.includes("admin")) {
      localStorage.setItem("role", "admin");
      window.dispatchEvent(new Event("role-changed"));
      router.push("/admin/dashboard");
    } else {
      localStorage.setItem("role", "user");
      window.dispatchEvent(new Event("role-changed"));
      router.push(redirect || "/user/dashboard");
    }
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
            Masuk ke NEXORA. Gunakan email dengan kata <span className="font-mono font-bold">&quot;admin&quot;</span> untuk admin.
          </p>
        </div>

        {redirect && (
          <div className="mt-5 rounded-sm border border-amber/40 bg-amber/15 p-3 text-xs text-ink/80">
            Silakan masuk terlebih dahulu untuk melanjutkan pengajuan sewa alat Anda.
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm text-ink/70">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </label>

          <label className="block">
            <span className="text-sm text-ink/70">Kata sandi</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-sm bg-ridge py-2.5 text-center text-sm font-medium text-fog hover:bg-ink transition-colors"
          >
            Masuk
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/60">
          Belum punya akun?{" "}
          <Link href={registerHref} className="font-medium text-ink underline underline-offset-4">
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