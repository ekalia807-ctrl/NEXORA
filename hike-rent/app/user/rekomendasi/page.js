"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCatalog } from "@/lib/stores/catalogStore";
import { buatRekomendasi } from "@/lib/domain/rekomendasi";
import { hitungBiaya } from "@/lib/utils/hitungBiaya";
import { fetchPackagesAction, fetchPackageItemsAction } from "@/app/actions/packages";

import OfficialPackagesView from "./components/OfficialPackagesView";
import CustomCalculatorView from "./components/CustomCalculatorView";

const PAKET_STORAGE_KEY = "nexora_paket_rekomendasi";
const KONDISI_OPTIONS = [{ value: "teknis", label: "Jalur teknis / minim sinyal" }];

function RekomendasiContent() {
  const router = useRouter();
  const gear = useCatalog();

  // Tab State: "bundling" (Paket Resmi dari Database Backend) atau "kustom" (Rekomendasi Cerdas)
  const [activeTab, setActiveTab] = useState("bundling");

  // State untuk Paket Backend
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
    router.push("/user/checkout?paket=1");
  }

  function handleSewaOfficialPackage(pkgId) {
    const items = packageItems.filter((it) => it.package_id === pkgId);
    if (items.length === 0) {
      alert("Paket ini belum memiliki item alat.");
      return;
    }

    const paketData = items.map((it) => {
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
    router.push("/user/checkout?paket=1");
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

      {/* TAB 1: PAKET BUNDLING RESMI */}
      {activeTab === "bundling" && (
        <OfficialPackagesView
          officialPackages={officialPackages}
          packageItems={packageItems}
          loadingPackages={loadingPackages}
          gear={gear}
          onSewaOfficialPackage={handleSewaOfficialPackage}
        />
      )}

      {/* TAB 2: REKOMENDASI KUSTOM */}
      {activeTab === "kustom" && (
        <CustomCalculatorView
          personel={personel}
          setPersonel={setPersonel}
          durasiHari={durasiHari}
          setDurasiHari={setDurasiHari}
          kondisi={kondisi}
          toggleKondisi={toggleKondisi}
          KONDISI_OPTIONS={KONDISI_OPTIONS}
          tersedia={tersedia}
          tidakDitemukan={tidakDitemukan}
          stokHabis={stokHabis}
          totalEstimasi={totalEstimasi}
          onSewaPaketKustom={handleSewaPaketKustom}
        />
      )}
    </div>
  );
}

export default function RekomendasiPage() {
  return <RekomendasiContent />;
}
