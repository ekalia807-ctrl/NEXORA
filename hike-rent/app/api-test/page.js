import { apiFetch } from "@/lib/api";
import Link from "next/link";

export const metadata = {
  title: "API Backend Test — NEXORA",
};

export default async function ApiTestPage() {
  let categories = [];
  let error = null;

  try {
    categories = await apiFetch("/categories");
  } catch (err) {
    error = err.message;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">
            Status Koneksi Backend (API Test)
          </h1>
          <Link
            href="/"
            className="rounded-sm border border-line px-3 py-1.5 text-xs font-medium text-ink hover:border-ink/50"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Halaman ini khusus untuk memverifikasi data API dari backend HMIF UNRAM tanpa mengganggu tampilan beranda utama NEXORA.
        </p>
      </div>

      <div className="mt-6 border border-line bg-paper p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink/70">
          Endpoint: /categories
        </h2>

        {error ? (
          <div className="mt-4 rounded-sm border border-alert/30 bg-alert/10 p-4 text-sm text-alert">
            Terjadi kesalahan: {error}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-sm border border-line bg-white/60 p-4">
              <span className="text-xs font-mono text-moss font-semibold">
                ● STATUS: Terhubung & Berhasil Mengambil Data
              </span>
              <ul className="mt-3 divide-y divide-line/40 text-sm">
                {Array.isArray(categories) &&
                  categories.map((c) => (
                    <li key={c.id} className="py-2 flex items-center justify-between">
                      <span className="font-medium text-ink">{c.name}</span>
                      <span className="font-mono text-xs text-ink/50">{c.slug}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <p className="text-xs text-ink/50 mb-2">Data JSON Mentah:</p>
              <pre className="rounded-sm bg-gray-900 p-4 text-xs font-mono text-green-400 overflow-x-auto">
                {JSON.stringify(categories, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
