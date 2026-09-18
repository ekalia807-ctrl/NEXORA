"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/shared/RequireAuth";
import DashboardSidebar from "@/components/user/DashboardSidebar";
import { useCatalog } from "@/lib/catalogStore";
import { buatRekomendasi } from "@/lib/rekomendasi";
import { formatRupiah, hitungBiaya } from "@/lib/hitungBiaya";
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
      {/* Tab Switcher */}
      <div className="flex border-b border-line bg-white/40">
        <button
          type="button"
          onClick={() => setActiveTab("bundling")}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors ${
            activeTab === "bundling"
              ? "border-b-2 border-ridge text-ridge bg-paper/60"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          <span>Paket Bundling Resmi</span>
          {officialPackages.length > 0 && (
            <span className="rounded-full bg-ridge/10 px-2 py-0.5 text-[11px] font-mono text-ridge">
              {officialPackages.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("kustom")}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors ${
            activeTab === "kustom"
              ? "border-b-2 border-ridge text-ridge bg-paper/60"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          <span>Kalkulator Kustom Rombongan</span>
        </button>
      </div>

      {/* TAB 1: PAKET BUNDLING RESMI (LIVE DARI DATABASE BACKEND HMIF UNRAM) */}
      {activeTab === "bundling" && (
        <div className="space-y-6">
          <div className="border border-line bg-white/40 p-6">
            <h1 className="font-display text-2xl font-bold text-ink">
              Paket Bundling Promo Pendakian
            </h1>
            <p className="mt-1 text-sm text-ink/65">
              Pilihan paket hemat komplit terverifikasi dari backend NEXORA. Lebih hemat dan tanpa repot memilih satu-per-satu.
            </p>
          </div>

          {loadingPackages ? (
            <div className="border border-line bg-white/40 p-8 text-center text-sm text-ink/50">
              Menghubungkan ke API Backend HMIF UNRAM untuk memuat paket bundling...
            </div>
          ) : officialPackages.length === 0 ? (
            <div className="border border-line bg-white/40 p-8 text-center text-sm text-ink/60">
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
                    className="flex flex-col justify-between border border-line bg-white/50 p-6 shadow-sm transition hover:border-ridge"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs text-ink/40">PAKET #{pkg.id}</span>
                        {pkg.target && (
                          <span className="rounded-full bg-ridge/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ridge">
                            {pkg.target}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 font-display text-xl font-bold text-ink">
                        {pkg.name}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-ink/65">
                        {pkg.description || "Paket bundling peralatan lengkap siap mendaki."}
                      </p>

                      {/* Komposisi Isi Paket */}
                      <div className="mt-4 border-t border-line pt-3">
                        <p className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
                          Komposisi Alat ({itemsInPkg.length} item):
                        </p>
                        {itemsInPkg.length === 0 ? (
                          <p className="mt-2 text-xs italic text-ink/40">
                            Komposisi alat sedang diperbarui oleh admin.
                          </p>
                        ) : (
                          <ul className="mt-2 space-y-2">
                            {itemsInPkg.map((it) => (
                              <li
                                key={it.id}
                                className="flex items-center justify-between text-xs text-ink/80 bg-paper/70 px-2.5 py-1.5 rounded"
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

                    <div className="mt-6 border-t border-line pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-ink/60">Estimasi Paket:</span>
                        <span className="font-display text-base font-bold text-ink">
                          {formatRupiah(totalPerHari)} <span className="text-xs font-normal text-ink/50">/hari</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSewaOfficialPackage(pkg.id)}
                        disabled={itemsInPkg.length === 0}
                        className="w-full rounded-sm bg-ridge py-2.5 text-xs font-semibold text-fog hover:bg-ink transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
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
          <div className="border border-line bg-white/40 p-6">
            <h1 className="font-display text-2xl font-bold text-ink">
              Rekomendasi Perlengkapan Rombongan
            </h1>
            <p className="mt-2 text-sm text-ink/65">
              Masukkan jumlah personel dan karakteristik trip, algoritma NEXORA akan menyusun daftar
              alat yang sebaiknya dibawa secara dinamis.
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
              onClick={handleSewaPaketKustom}
              disabled={tersedia.length === 0}
              className="mt-6 w-full rounded-sm bg-ridge px-5 py-3 text-sm font-medium text-fog transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
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
