"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { validateRegisterForm, Spinner } from "./utils/registerValidation";
import RegisterFields from "./components/RegisterFields";

function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "";
  const safeRedirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : null;

  function updateField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function handleBlur(field) {
    const errs = validateRegisterForm(form);
    setErrors((prev) => ({ ...prev, [field]: errs[field] || "" }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    const errs = validateRegisterForm(form);
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      setToast({ type: "error", message: "Mohon periksa kembali kolom yang belum sesuai." });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const res = await registerAction({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (!res.success) {
        setToast({ type: "error", message: res.error || "Pendaftaran gagal. Silakan coba lagi." });
        setLoading(false);
        return;
      }

      if (res.autoLogin) {
        const role = res.user?.role || "user";
        localStorage.setItem("role", role);
        if (res.user) {
          localStorage.setItem("user", JSON.stringify(res.user));
        }
        window.dispatchEvent(new Event("role-changed"));

        setToast({ type: "success", message: res.message || "Pendaftaran dan login berhasil! Mengalihkan..." });
        setTimeout(() => router.push(safeRedirect || "/user/katalog"), 600);
      } else {
        setToast({ type: "success", message: res.message || "Pendaftaran akun berhasil. Mengalihkan ke halaman masuk..." });
        setTimeout(() => router.push(loginHref), 1200);
      }
    } catch (err) {
      setToast({ type: "error", message: err.message || "Terjadi kesalahan saat pendaftaran." });
      setLoading(false);
    }
  }

  const loginHref = safeRedirect ? `/login?redirect=${encodeURIComponent(safeRedirect)}` : "/login";

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 sm:px-6 py-12">
      <div className="rounded-2xl border border-line bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur-md">
        <div className="text-center">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Daftar
          </h1>
          <p className="mt-1.5 text-sm text-ink/65 leading-relaxed">
            Buat akun untuk mulai menyewa perlengkapan pendakian di NEXORA.
          </p>
        </div>

        {safeRedirect && !toast && (
          <div className="mt-5 rounded-xl border border-amber/40 bg-amber/15 p-3.5 text-xs text-ink/80 font-medium flex items-start gap-2">
            <span>Daftar akun baru untuk melanjutkan proses pengajuan sewa alat Anda.</span>
          </div>
        )}

        {toast && (
          <div
            role="alert"
            className={`mt-5 rounded-xl border p-3.5 text-xs flex items-center justify-between shadow-2xs ${
              toast.type === "success"
                ? "border-moss/40 bg-moss/10 text-moss font-semibold"
                : "border-alert/40 bg-alert/10 text-alert font-medium"
            }`}
          >
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} className="text-xs opacity-60 hover:opacity-100 ml-2 font-bold">
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleRegister} noValidate className="mt-6 space-y-4">
          <RegisterFields
            form={form}
            loading={loading}
            errors={errors}
            showPw={showPw}
            setShowPw={setShowPw}
            showConfirmPw={showConfirmPw}
            setShowConfirmPw={setShowConfirmPw}
            updateField={updateField}
            handleBlur={handleBlur}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl bg-ridge py-3 text-center text-sm font-semibold text-fog shadow-sm transition-all ${
              loading ? "opacity-75 cursor-not-allowed" : "hover:bg-ink active:scale-[0.99]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                <span>Mendaftarkan akun...</span>
              </span>
            ) : (
              "Daftar & Masuk Otomatis"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/65">
          Sudah punya akun?{" "}
          <Link href={loginHref} className="font-semibold text-ink underline underline-offset-4 hover:text-amber transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm text-ink/50">Memuat formulir daftar...</div>}>
      <RegisterForm />
    </Suspense>
  );
}