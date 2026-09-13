"use client";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import RequireAuth from "@/app/components/shared/RequireAuth";
import DashboardSidebar from "@/app/components/user/DashboardSidebar";
import { useCatalog } from "@/lib/catalogStore";
import {
  formatRupiah,
  hitungDurasiHari,
  hitungBiaya,
  validasiTanggal,
} from "@/lib/hitungBiaya";

const PAKET_STORAGE_KEY = "nexora_paket_rekomendasi";

function KalkulatorContent() {
  const searchParams = useSearchParams();
  const alatIdFromQuery = searchParams.get("alatId");
  const isPaketMode = searchParams.get("paket") === "1";

  const gear = useCatalog();
  
  // Inisialisasi state alatId secara aman tanpa useEffect
  const [alatId, setAlatId] = useState(() => {
    if (alatIdFromQuery) return alatIdFromQuery;
    if (!isPaketMode && gear.length > 0) return gear[0].id;
    return "";
  });

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
    const alat = gear.find((item) => item.id === alatId);
    return alat ? [{ alat, jumlah: Number(jumlah) || 1 }] : [];
  }, [isPaketMode, paket, gear, alatId, jumlah]);

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
    <div className="border border-line bg-white/40 p-6 print:border-black/20 print:bg-white">
      <h1 className="font-display text-2xl font-bold text-ink print:text-black">
        Kalkulator Biaya Sewa
      </h1>
      <p className="mt-2 text-sm text-ink/65 print:text-black">
        {isPaketMode
          ? "Estimasi biaya untuk paket rekomendasi yang kamu pilih."
          : "Pilih alat dan tanggal sewa untuk melihat estimasi biaya."}
      </p>

      {!isPaketMode && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-ink/70 print:text-black">
            Alat
            <select
              value={alatId}
              onChange={(e) => setAlatId(e.target.value)}
              className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-ridge"
            >
              {gear.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {formatRupiah(item.price)}/
                  {item.unit.replace("per ", "")}
                </option>
              ))}
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
    <RequireAuth allow={["user"]}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:flex-row">
        <DashboardSidebar />
        <main className="min-w-0 flex-1">
          <Suspense fallback={null}>
            <KalkulatorContent />
          </Suspense>
        </main>
      </div>
    </RequireAuth>
  );
}