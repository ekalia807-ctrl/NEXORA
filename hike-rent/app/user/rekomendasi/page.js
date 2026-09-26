"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCatalog } from "@/lib/stores/catalogStore";
import { buatRekomendasi } from "@/lib/domain/rekomendasi";
import { formatRupiah, hitungBiaya } from "@/lib/utils/hitungBiaya";
import { fetchPackagesAction, fetchPackageItemsAction } from "@/app/actions/packages";

const PAKET_STORAGE_KEY = "nexora_paket_rekomendasi";
const KONDISI_OPTIONS = [{ value: "teknis", label: "Jalur teknis / minim sinyal" }];

function RekomendasiContent() {
  const router = useRouter();
  const gear = useCatalog();

  // Tab State: "bundling" (Paket Resmi dari Database Backend) atau "kustom" (Rekomendasi Cerdas)
  const [activeTab, setActiveTab] = useState("bundling");

  // State untuk Paket Backend (Modul 6 & 7)
  const [officialPackages, setOfficialPackages] = useState([]);
  const [packageItems, setPackageItems] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // State untuk Rekomendasi Kustom
  const [personel, setPersonel] = useState(4);
  const [durasiHari, setDurasiHari] = useState(2);
  const [kondisi, setKondisi] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchLivePackages() {
      const [pRes, iRes] = await Promise.all([
        fetchPackagesAction(),
        fetchPackageItemsAction(),
      ]);
      if (isMounted) {
        if (pRes.success && Array.isArray(pRes.data)) {
          setOfficialPackages(pRes.data);
        }
        if (iRes.success && Array.isArray(iRes.data)) {
          setPackageItems(iRes.data);
        }
        setLoadingPackages(false);
      }
    }
    fetchLivePackages();
    return () => {
      isMounted = false;
    };
  }, []);

  function toggleKondisi(value) {
    setKondisi((prev) =>
      prev.includes(value) ? prev.filter((k) => k !== value) : [...prev, value]
    );
  }

  // Rekomendasi Kustom
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

  function handleSewaPaketKustom() {
    const paket = tersedia.map((r) => ({ alatId: r.alat.id, jumlah: r.jumlah }));
    window.localStorage.setItem(PAKET_STORAGE_KEY, JSON.stringify(paket));
    router.push("/user/kalkulator?paket=1");
  }

  function handleSewaOfficialPackage(pkgId) {
    const items = packageItems.filter((it) => it.package_id === pkgId);
    if (items.length === 0) {
      alert("Paket ini belum memiliki item alat.");
      return;
    }

    // Ubah ke format kalkulator: { alatId, jumlah }
    const paketData = items.map((it) => {
      // Cari alat di katalog berdasarkan nama atau id
      const matchedGear = gear.find(
        (g) =>
          g.id === String(it.gear_id) ||
          g.name.toLowerCase().includes((it.gear_name || "").toLowerCase())
      );
      return {
        alatId: matchedGear ? matchedGear.id : String(it.gear_id),
        jumlah: it.quantity || 1,
      };
    });

    window.localStorage.setItem(PAKET_STORAGE_KEY, JSON.stringify(paketData));
    router.push("/user/kalkulator?paket=1");
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman Rekomendasi */}
      <div className="rounded-2xl border border-line bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
                Panel Peminjam
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Smart Recommendation</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Rekomendasi Rombongan
            </h1>
            <p className="mt-1.5 text-sm text-ink/65 leading-relaxed max-w-2xl">
              Pilih paket bundling promo pendakian siap pakai atau gunakan kalkulator cerdas NEXORA yang menyusun daftar peralatan berdasarkan jumlah personel dan karakteristik trip.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-ridge/10 border border-ridge/20 px-3.5 py-1 font-mono text-xs font-semibold text-ridge">
              {activeTab === "bundling" ? `${officialPackages.length} Paket Promo` : "Mode Dinamis"}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-white/70 p-1.5 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveTab("bundling")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "bundling"
              ? "bg-ridge text-fog shadow-sm"
              : "text-ink/70 hover:bg-paper hover:text-ink"
          }`}
        >
          <span>Paket Bundling Resmi</span>
          {officialPackages.length > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-mono ${
                activeTab === "bundling" ? "bg-white/20 text-fog" : "bg-ridge/10 text-ridge"
              }`}
            >
              {officialPackages.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("kustom")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "kustom"
              ? "bg-ridge text-fog shadow-sm"
              : "text-ink/70 hover:bg-paper hover:text-ink"
          }`}
        >
          <span>Kalkulator Kustom Rombongan</span>
        </button>
      </div>

      {/* TAB 1: PAKET BUNDLING RESMI (LIVE DARI DATABASE BACKEND HMIF UNRAM) */}
      {activeTab === "bundling" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-white/70 p-6 shadow-sm backdrop-blur-md">
            <h2 className="font-display text-xl font-bold text-ink">
              Paket Bundling Promo Pendakian
            </h2>
            <p className="mt-1 text-sm text-ink/65">
              Pilihan paket hemat komplit terverifikasi dari basis data NEXORA. Lebih hemat dan tanpa repot memilih satu-per-satu.
            </p>
          </div>

          {loadingPackages ? (
            <div className="rounded-2xl border border-line bg-white/70 p-12 text-center text-sm text-ink/50 shadow-sm backdrop-blur-md">
              Menghubungkan ke API Backend HMIF UNRAM untuk memuat paket bundling...
            </div>
          ) : officialPackages.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white/70 p-12 text-center text-sm text-ink/60 shadow-sm backdrop-blur-md">
              Belum ada paket bundling aktif di database backend.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {officialPackages.map((pkg) => {
                const itemsInPkg = packageItems.filter((it) => it.package_id === pkg.id);

                // Hitung estimasi harga per hari jika alat ditemukan di katalog
                const totalPerHari = itemsInPkg.reduce((sum, it) => {
                  const matched = gear.find(
                    (g) =>
                      g.id === String(it.gear_id) ||
                      g.name.toLowerCase().includes((it.gear_name || "").toLowerCase())
                  );
                  return sum + (matched ? matched.price * (it.quantity || 1) : 40000);
                }, 0);

                return (
                  <div
                    key={pkg.id}
                    className="flex flex-col justify-between rounded-2xl border border-line bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-ridge hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-ink/60 bg-paper px-2 py-0.5 rounded border border-line">
                          PAKET #{pkg.id}
                        </span>
                        {pkg.target && (
                          <span className="rounded-full bg-ridge/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ridge">
                            {pkg.target}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 font-display text-xl font-bold text-ink">
                        {pkg.name}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-ink/65">
                        {pkg.description || "Paket bundling peralatan lengkap siap mendaki."}
                      </p>

                      {/* Komposisi Isi Paket */}
                      <div className="mt-4 border-t border-line/60 pt-3">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-ink/50 font-semibold">
                          Komposisi Alat ({itemsInPkg.length} item):
                        </p>
                        {itemsInPkg.length === 0 ? (
                          <p className="mt-2 text-xs italic text-ink/40">
                            Komposisi alat sedang diperbarui oleh admin.
                          </p>
                        ) : (
                          <ul className="mt-2.5 space-y-2">
                            {itemsInPkg.map((it) => (
                              <li
                                key={it.id}
                                className="flex items-center justify-between text-xs text-ink/80 bg-paper/60 px-3 py-2 rounded-xl border border-line/40"
                              >
                                <span className="font-medium">
                                  {it.gear_name || `Alat #${it.gear_id}`}
                                </span>
                                <span className="font-mono font-bold text-ridge">
                                  × {it.quantity} unit
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-line/60 pt-4">
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="text-xs text-ink/60">Estimasi Paket:</span>
                        <span className="font-display text-lg font-bold text-ink">
                          {formatRupiah(totalPerHari)}{" "}
                          <span className="text-xs font-normal text-ink/50">/hari</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSewaOfficialPackage(pkg.id)}
                        disabled={itemsInPkg.length === 0}
                        className="w-full rounded-xl bg-ridge py-3 text-xs font-semibold text-fog hover:bg-ink transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
                      >
                        Sewa Paket Ini (Kalkulasi) →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REKOMENDASI KUSTOM (ENGINE ATURAN ROMBONGAN) */}
      {activeTab === "kustom" && (
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

            <button
              onClick={handleSewaPaketKustom}
              disabled={tersedia.length === 0}
              className="mt-6 w-full rounded-xl bg-ridge px-5 py-3.5 text-sm font-semibold text-fog transition-all duration-200 hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
            >
              Sewa Paket Ini (Kalkulator) →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RekomendasiPage() {
  return <RekomendasiContent />;
}
