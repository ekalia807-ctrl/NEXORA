"use client";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCatalogSync } from "@/lib/stores/catalogStore";
import {
  formatRupiah,
  hitungDurasiHari,
  hitungBiaya,
  validasiTanggal,
  validasiTanggalTerpisah,
  getTodayString,
} from "@/lib/utils/hitungBiaya";
import CalculatorDateInputs from "./components/CalculatorDateInputs";
import CalculatorCostSummary from "./components/CalculatorCostSummary";

const PAKET_STORAGE_KEY = "nexora_paket_rekomendasi";

function KalkulatorContent() {
  const searchParams = useSearchParams();
  const alatIdFromQuery = searchParams.get("alatId");
  const isPaketMode = searchParams.get("paket") === "1";

  const gear = useCatalogSync();
  const todayStr = getTodayString();

  const [alatId, setAlatId] = useState(() => {
    if (alatIdFromQuery) return alatIdFromQuery;
    return "";
  });

  const activeAlatId = alatId || (gear.length > 0 ? gear[0].id : "");

  const [jumlah, setJumlah] = useState(1);
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [copied, setCopied] = useState(false);

  const [paket] = useState(() => {
    if (!isPaketMode || typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(PAKET_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const { startError, endError, isValid: isDateValid } = validasiTanggalTerpisah(tanggalMulai, tanggalSelesai);
  const generalError = (!tanggalMulai || !tanggalSelesai) ? null : validasiTanggal(tanggalMulai, tanggalSelesai);
  const durasiHari = isDateValid ? hitungDurasiHari(tanggalMulai, tanggalSelesai) : 0;

  const checkoutUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (isPaketMode) {
      params.set("paket", "1");
    } else if (activeAlatId) {
      params.set("alatId", activeAlatId);
      params.set("jumlah", String(jumlah || 1));
    }
    if (tanggalMulai) params.set("startDate", tanggalMulai);
    if (tanggalSelesai) params.set("endDate", tanggalSelesai);
    return `/user/checkout?${params.toString()}`;
  }, [isPaketMode, activeAlatId, jumlah, tanggalMulai, tanggalSelesai]);

  const baris = useMemo(() => {
    if (isPaketMode) {
      return paket
        .map((p) => {
          const alat = gear.find((item) => item.id === p.alatId);
          return alat ? { alat, jumlah: p.jumlah } : null;
        })
        .filter(Boolean);
    }
    const alat = gear.find((item) => item.id === activeAlatId);
    return alat ? [{ alat, jumlah: Number(jumlah) || 1 }] : [];
  }, [isPaketMode, paket, gear, activeAlatId, jumlah]);

  const totalBiaya = durasiHari
    ? baris.reduce(
      (sum, b) =>
        sum +
        hitungBiaya({
          hargaPerHari: b.alat.price,
          jumlah: b.jumlah,
          durasiHari,
        }),
      0
    )
    : 0;

  function buatRingkasanTeks() {
    const lines = [
      "Ringkasan Estimasi Sewa — NEXORA",
      `Tanggal: ${tanggalMulai || "-"} s/d ${tanggalSelesai || "-"} (${durasiHari} hari)`,
      "",
      ...baris.map(
        (b) =>
          `- ${b.alat.name} x${b.jumlah} = ${formatRupiah(
            hitungBiaya({
              hargaPerHari: b.alat.price,
              jumlah: b.jumlah,
              durasiHari,
            })
          )}`
      ),
      "",
      `Total: ${formatRupiah(totalBiaya)}`,
    ];
    return lines.join("\n");
  }

  async function handleSalin() {
    try {
      await navigator.clipboard.writeText(buatRingkasanTeks());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur-md print:border-black/20 print:bg-white space-y-6">
      <div className="border-b border-line/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
            Estimasi Biaya
          </span>
          <span className="h-1 w-1 rounded-full bg-ink/30" />
          <span className="font-mono text-[11px] text-ink/50">Kalkulator Sewa</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink print:text-black">
          Kalkulator Biaya Sewa
        </h1>
        <p className="mt-1.5 text-sm text-ink/65 print:text-black">
          {isPaketMode
            ? "Estimasi biaya untuk paket rekomendasi rombongan yang kamu pilih."
            : "Pilih alat, jumlah unit, dan tanggal sewa untuk menghitung estimasi biaya secara otomatis."}
        </p>
      </div>

      {!isPaketMode && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70 print:text-black">
            Peralatan Sewa
            <select
              value={activeAlatId}
              onChange={(e) => setAlatId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white"
            >
              {gear.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {formatRupiah(item.price)}/
                  {item.unit.replace("per ", "")}
                </option>
              ))}
              {gear.length === 0 && (
                <option value="">Tidak ada alat tersedia di katalog</option>
              )}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70 print:text-black">
            Jumlah unit
            <input
              type="number"
              min={1}
              value={jumlah}
              onChange={(e) => setJumlah(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
            />
          </label>
        </div>
      )}

      <CalculatorDateInputs
        todayStr={todayStr}
        tanggalMulai={tanggalMulai}
        setTanggalMulai={setTanggalMulai}
        tanggalSelesai={tanggalSelesai}
        setTanggalSelesai={setTanggalSelesai}
        startError={startError}
        endError={endError}
        generalError={generalError}
      />

      {isDateValid && durasiHari > 0 && baris.length > 0 && (
        <CalculatorCostSummary
          durasiHari={durasiHari}
          baris={baris}
          totalBiaya={totalBiaya}
          copied={copied}
          onSalin={handleSalin}
          checkoutUrl={checkoutUrl}
        />
      )}

      {isPaketMode && baris.length === 0 && (
        <p className="mt-6 text-sm text-ink/50">
          Belum ada paket tersimpan. Kembali ke halaman{" "}
          <Link href="/user/rekomendasi" className="text-rust underline">
            rekomendasi perlengkapan
          </Link>{" "}
          untuk membuat paket dulu.
        </p>
      )}
    </div>
  );
}

export default function KalkulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-line bg-white/70 p-12 text-center text-sm text-ink/50 font-mono">
          Memuat kalkulator biaya...
        </div>
      }
    >
      <KalkulatorContent />
    </Suspense>
  );
}