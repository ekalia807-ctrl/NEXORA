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
} from "@/lib/utils/hitungBiaya";

const PAKET_STORAGE_KEY = "nexora_paket_rekomendasi";

function KalkulatorContent() {
  const searchParams = useSearchParams();
  const alatIdFromQuery = searchParams.get("alatId");
  const isPaketMode = searchParams.get("paket") === "1";

  const gear = useCatalogSync();
  
  // Inisialisasi state alatId secara aman tanpa useEffect
  const [alatId, setAlatId] = useState(() => {
    if (alatIdFromQuery) return alatIdFromQuery;
    return "";
  });

  const activeAlatId = alatId || (gear.length > 0 ? gear[0].id : "");

  const [jumlah, setJumlah] = useState(1);
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [copied, setCopied] = useState(false);

  // Lazy initialization untuk paket dari localStorage
  const [paket] = useState(() => {
    if (!isPaketMode || typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(PAKET_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const error = validasiTanggal(tanggalMulai, tanggalSelesai);
  const durasiHari = error ? 0 : hitungDurasiHari(tanggalMulai, tanggalSelesai);

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
          <label className="block text-sm text-ink/70 print:text-black">
            Jumlah unit
            <input
              type="number"
              min={1}
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-ridge"
            />
          </label>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-ink/70 print:text-black">
          Tanggal mulai
          <input
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
            className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-ridge"
          />
        </label>
        <label className="block text-sm text-ink/70 print:text-black">
          Tanggal selesai
          <input
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
            className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-ridge"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-alert">{error}</p>}

      {!error && durasiHari > 0 && baris.length > 0 && (
        <div className="mt-6 border-t border-line pt-6 print:border-black/20">
          <p className="text-sm text-ink/50 print:text-black/60">
            Durasi sewa: {durasiHari} hari
          </p>
          <ul className="mt-3 space-y-2">
            {baris.map((b) => (
              <li
                key={b.alat.id}
                className="flex items-center justify-between text-sm text-ink/80 print:text-black"
              >
                <span>
                  {b.alat.name} × {b.jumlah}
                </span>
                <span>
                  {formatRupiah(
                    hitungBiaya({
                      hargaPerHari: b.alat.price,
                      jumlah: b.jumlah,
                      durasiHari,
                    })
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4 print:border-black/20">
            <span className="font-display text-lg font-semibold text-ink print:text-black">
              Total
            </span>
            <span className="font-display text-2xl font-bold text-ink print:text-black">
              {formatRupiah(totalBiaya)}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <button
              onClick={handleSalin}
              className="border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/50"
            >
              {copied ? "Tersalin!" : "Salin ringkasan"}
            </button>
            <button
              onClick={() => window.print()}
              className="border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/50"
            >
              Cetak / simpan PDF
            </button>
            <Link
              href="/user/checkout"
              className="rounded-sm bg-ridge px-5 py-2.5 text-sm font-medium text-fog transition-colors hover:bg-ink"
            >
              Lanjutkan ke pengajuan sewa
            </Link>
          </div>
        </div>
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