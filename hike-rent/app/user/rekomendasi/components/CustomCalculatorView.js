"use client";

import { useRouter } from "next/navigation";
import { formatRupiah, hitungBiaya } from "@/lib/utils/hitungBiaya";

const PAKET_STORAGE_KEY = "nexora_paket_rekomendasi";

export default function CustomCalculatorView({
  personel,
  setPersonel,
  durasiHari,
  setDurasiHari,
  kondisi,
  toggleKondisi,
  KONDISI_OPTIONS,
  tersedia,
  tidakDitemukan,
  stokHabis,
  totalEstimasi,
  onSewaPaketKustom,
}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur-md">
        <h2 className="font-display text-xl font-bold text-ink">
          Atur Rombongan & Karakteristik Trip
        </h2>
        <p className="mt-1 text-sm text-ink/65">
          Masukkan jumlah personel dan karakteristik trip, algoritma cerdas NEXORA akan menyusun rekomendasi alat secara otomatis.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
            Jumlah personel
            <input
              type="number"
              min={1}
              value={personel}
              onChange={(e) => setPersonel(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white"
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
            Durasi trip (hari)
            <input
              type="number"
              min={1}
              value={durasiHari}
              onChange={(e) => setDurasiHari(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white"
            />
          </label>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Karakteristik medan & rute
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {KONDISI_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleKondisi(opt.value)}
                className={`rounded-xl border px-4 py-2 text-xs font-medium transition-all ${
                  kondisi.includes(opt.value)
                    ? "border-ridge bg-ridge text-fog shadow-sm"
                    : "border-line bg-paper/40 text-ink/70 hover:border-ink/40 hover:bg-paper"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-line/60 pb-3">
          <h2 className="font-display text-lg font-bold text-ink">
            Paket Rekomendasi Cerdas
          </h2>
          <span className="font-mono text-xs text-ink/50">
            {tersedia.length} Item Direkomendasikan
          </span>
        </div>

        <ul className="mt-4 divide-y divide-line/60">
          {tersedia.map((r) => (
            <li
              key={r.alat.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3.5"
            >
              <div>
                <p className="text-sm font-semibold text-ink">
                  {r.alat.name}{" "}
                  <span className="font-mono text-ridge">× {r.jumlah}</span>
                  {r.alat.stock === "merah" && (
                    <span className="ml-2 rounded-full bg-alert px-2 py-0.5 text-[10px] font-semibold text-fog">
                      Stok habis
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-ink/50">{r.alasan}</p>
              </div>
              <span className="font-mono text-sm font-semibold text-ink">
                {formatRupiah(
                  hitungBiaya({
                    hargaPerHari: r.alat.price,
                    jumlah: r.jumlah,
                    durasiHari,
                  })
                )}
              </span>
            </li>
          ))}
        </ul>

        {tidakDitemukan.length > 0 && (
          <p className="mt-4 rounded-xl border border-line/60 bg-paper/50 p-3 text-xs text-ink/50">
            Sebagian alat rujukan tidak ditemukan di katalog (mungkin sudah diubah atau dihapus oleh admin).
          </p>
        )}
        {stokHabis.length > 0 && (
          <p className="mt-3 rounded-xl border border-alert/30 bg-alert/10 p-3 text-xs text-alert font-medium">
            {stokHabis.length} alat di paket ini sedang habis stok — koordinasikan ulang jadwal atau hubungi admin sebelum mengajukan sewa.
          </p>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-line/60 pt-4">
          <span className="font-display text-base font-semibold text-ink">
            Estimasi Total ({durasiHari} hari):
          </span>
          <span className="font-display text-2xl font-bold text-ink">
            {formatRupiah(totalEstimasi)}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              const paket = tersedia.map((r) => ({ alatId: r.alat.id, jumlah: r.jumlah }));
              window.localStorage.setItem(PAKET_STORAGE_KEY, JSON.stringify(paket));
              router.push("/user/kalkulator?paket=1");
            }}
            disabled={tersedia.length === 0}
            className="flex-1 rounded-xl border border-line bg-paper/60 px-5 py-3 text-xs sm:text-sm font-semibold text-ink transition-all hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            Hitung di Kalkulator
          </button>
          <button
            type="button"
            onClick={onSewaPaketKustom}
            disabled={tersedia.length === 0}
            className="flex-1 rounded-xl bg-ridge px-5 py-3 text-xs sm:text-sm font-semibold text-fog transition-all duration-200 hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
          >
            Ajukan Sewa Paket Ini →
          </button>
        </div>
      </div>
    </div>
  );
}
