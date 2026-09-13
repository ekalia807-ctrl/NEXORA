"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/app/components/shared/RequireAuth";
import DashboardSidebar from "@/app/components/user/DashboardSidebar";
import { useCatalog } from "@/lib/catalogStore";
import { buatRekomendasi } from "@/lib/rekomendasi";
import { formatRupiah, hitungBiaya } from "@/lib/hitungBiaya";

const PAKET_STORAGE_KEY = "nexora_paket_rekomendasi";

const KONDISI_OPTIONS = [{ value: "teknis", label: "Jalur teknis / minim sinyal" }];

function RekomendasiContent() {
  const router = useRouter();
  const gear = useCatalog();
  const [personel, setPersonel] = useState(4);
  const [durasiHari, setDurasiHari] = useState(2);
  const [kondisi, setKondisi] = useState([]);

  function toggleKondisi(value) {
    setKondisi((prev) =>
      prev.includes(value) ? prev.filter((k) => k !== value) : [...prev, value]
    );
  }

  const rekomendasi = useMemo(
    () => buatRekomendasi({ personel, durasiHari, kondisi }, gear),
    [personel, durasiHari, kondisi, gear]
  );

  const tersedia = rekomendasi.filter((r) => r.alat);
  const tidakDitemukan = rekomendasi.filter((r) => !r.alat);
  const stokHabis = tersedia.filter((r) => r.alat.stock === "merah");

  const totalEstimasi = tersedia.reduce(
    (sum, r) => sum + hitungBiaya({ hargaPerHari: r.alat.price, jumlah: r.jumlah, durasiHari }),
    0
  );

  function handleSewaPaket() {
    const paket = tersedia.map((r) => ({ alatId: r.alat.id, jumlah: r.jumlah }));
    window.localStorage.setItem(PAKET_STORAGE_KEY, JSON.stringify(paket));
    router.push("/user/kalkulator?paket=1");
  }

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <h1 className="font-display text-2xl font-bold text-ink">
          Rekomendasi Perlengkapan Rombongan
        </h1>
        <p className="mt-2 text-sm text-ink/65">
          Masukkan jumlah personel dan karakteristik trip, kami susunkan daftar
          alat yang sebaiknya dibawa.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-ink/70">
            Jumlah personel
            <input
              type="number"
              min={1}
              value={personel}
              onChange={(e) => setPersonel(e.target.value)}
              className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-ridge"
            />
          </label>
          <label className="block text-sm text-ink/70">
            Durasi trip (hari)
            <input
              type="number"
              min={1}
              value={durasiHari}
              onChange={(e) => setDurasiHari(e.target.value)}
              className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-ridge"
            />
          </label>
        </div>

        <div className="mt-5">
          <p className="text-sm text-ink/70">Karakteristik medan</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {KONDISI_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleKondisi(opt.value)}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                  kondisi.includes(opt.value)
                    ? "border-ridge bg-ridge text-fog"
                    : "border-line text-ink/70 hover:border-ink/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-line bg-white/40 p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Paket yang disarankan</h2>
        <ul className="mt-4 space-y-3">
          {tersedia.map((r) => (
            <li
              key={r.alat.id}
              className="flex items-center justify-between border-b border-line pb-3 last:border-none last:pb-0"
            >
              <div>
                <p className="text-sm text-ink/90">
                  {r.alat.name} × {r.jumlah}
                  {r.alat.stock === "merah" && (
                    <span className="ml-2 rounded-full bg-alert px-2 py-0.5 text-[10px] text-fog">
                      Stok habis
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink/45">{r.alasan}</p>
              </div>
              <span className="text-sm text-ink/70">
                {formatRupiah(hitungBiaya({ hargaPerHari: r.alat.price, jumlah: r.jumlah, durasiHari }))}
              </span>
            </li>
          ))}
        </ul>

        {tidakDitemukan.length > 0 && (
          <p className="mt-4 text-xs text-ink/40">
            Sebagian alat rujukan tidak ditemukan di katalog (mungkin sudah diubah/dihapus admin).
          </p>
        )}
        {stokHabis.length > 0 && (
          <p className="mt-2 text-xs text-alert">
            {stokHabis.length} alat di paket ini sedang habis stok — koordinasikan ulang
            jadwal sebelum mengajukan sewa.
          </p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="font-display text-lg font-semibold text-ink">
            Estimasi total ({durasiHari} hari)
          </span>
          <span className="font-display text-2xl font-bold text-ink">
            {formatRupiah(totalEstimasi)}
          </span>
        </div>

        <button
          onClick={handleSewaPaket}
          disabled={tersedia.length === 0}
          className="mt-6 w-full rounded-sm bg-ridge px-5 py-3 text-sm font-medium text-fog transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sewa Paket Ini
        </button>
      </div>
    </div>
  );
}

export default function RekomendasiPage() {
  return (
    <RequireAuth allow={["user"]}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:flex-row">
        <DashboardSidebar />
        <main className="min-w-0 flex-1">
          <RekomendasiContent />
        </main>
      </div>
    </RequireAuth>
  );
}
