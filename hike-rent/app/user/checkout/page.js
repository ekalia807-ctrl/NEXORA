"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import RequireAuth from "@/components/shared/RequireAuth";

import { createRentalAction } from "@/app/actions/rentals";
import { addRental } from "@/lib/rentalsStore";

function CheckoutForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        return u.name || "";
      } catch (e) {}
    }
    return "";
  });

  const [whatsapp, setWhatsapp] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        return u.whatsapp || "";
      } catch (e) {}
    }
    return "";
  });

  const [startDate, setStartDate] = useState("2026-09-20");
  const [endDate, setEndDate] = useState("2026-09-23");
  const [loading, setLoading] = useState(false);
  const [ktp, setKtp] = useState(null);
  const [ktpPreview, setKtpPreview] = useState("");

  const searchParams = useSearchParams();
  const alat = searchParams.get("alat") || "";

  function handleKtpChange(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setKtp(null);
      setKtpPreview("");
      return;
    }
    setKtp(file);
    const preview = URL.createObjectURL(file);
    setKtpPreview(preview);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const diffDays = Math.max(
      1,
      Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    const estimatedPrice = diffDays * 50000;

    const payload = {
      start_date: startDate,
      end_date: endDate,
      total_days: diffDays,
      total_price: estimatedPrice,
      status: "diajukan",
      note: `Pengajuan sewa alat: ${alat || "Peralatan Pendakian"}`,
      ktp_number: "5201012304950001",
    };

    let backendResult = null;
    try {
      const res = await createRentalAction(payload);
      if (res && res.success && res.data) {
        backendResult = res.data;
      }
    } catch (err) {
      console.warn("Backend rental creation deferred to local sync:", err.message);
    }

    // Rekam ke rental store client-side
    addRental({
      id: backendResult?.id ? String(backendResult.id) : undefined,
      backendId: backendResult?.id || null,
      item: alat || "Paket Tenda Dome 4P + Matras + Kompor",
      name: name || "Peminjam",
      whatsapp: whatsapp || "081234567890",
      date: `${startDate} s/d ${endDate}`,
      start_date: startDate,
      end_date: endDate,
      total_days: diffDays,
      total_price: estimatedPrice,
      status: "Menunggu verifikasi",
    });

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-line bg-white/70 p-8 text-center sm:p-12 shadow-sm backdrop-blur-md">
        <span
          className="status-dot bg-moss mx-auto block"
          style={{ width: 16, height: 16 }}
        />

        <h1 className="mt-5 font-display text-3xl font-bold text-ink">
          Pengajuan Sewa Berhasil Dikirim!
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm text-ink/65 leading-relaxed">
          Pengajuan sewa peralatan pendakian kamu telah tercatat. Tim admin NEXORA akan segera meninjau permohonanmu. Setelah disetujui, kamu dapat langsung melanjutkan ke pembayaran.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/user/riwayat"
            className="rounded-xl bg-ridge px-6 py-2.5 text-xs font-semibold text-fog hover:bg-ink transition-all shadow-sm"
          >
            Lihat Status di Riwayat →
          </Link>
          <Link
            href="/user/katalog"
            className="rounded-xl border border-line bg-paper/60 px-5 py-2.5 text-xs font-semibold text-ink hover:bg-paper transition-all"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
                Langkah Transaksi
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Formulir Sewa</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Checkout Pengajuan Sewa
            </h1>
            <p className="mt-1.5 text-sm text-ink/65">
              Lengkapi data peminjaman dan konfirmasi perlengkapan yang ingin kamu sewa sebelum diproses oleh penyedia.
            </p>
          </div>

          <span className="rounded-full bg-ridge px-3.5 py-1 font-mono text-xs font-medium text-fog shadow-sm">
            Panel Peminjam
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white/80 p-6 sm:p-8 shadow-sm backdrop-blur-sm max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wide">
              Alat yang Dipilih
            </label>
            <input
              type="text"
              readOnly
              value={alat || "Tenda Dome Borneo 4 Person + Matras + Kompor"}
              className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm font-medium text-ink/90 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wide">
                Tanggal Mulai Sewa
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wide">
                Tanggal Selesai Sewa
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wide">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap sesuai KTP"
              className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wide">
              Nomor WhatsApp Aktif
            </label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="081234567890"
              className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wide">
              Unggah Foto KTP / Identitas
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleKtpChange}
              className="mt-1.5 w-full cursor-pointer text-xs text-ink/70 file:mr-4 file:rounded-xl file:border-0 file:bg-ridge file:px-4 file:py-2 file:text-xs file:font-semibold file:text-fog hover:file:bg-ink"
            />

            {ktpPreview && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-ink/50">
                  Pratinjau KTP Terunggah:
                </p>
                <img
                  src={ktpPreview}
                  alt="Pratinjau KTP"
                  className="max-h-56 w-full rounded-xl border border-line object-contain bg-paper/60 p-2 shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-ridge py-3 text-center text-xs font-bold text-fog shadow-sm hover:bg-ink transition-all disabled:opacity-50"
            >
              {loading ? "Memproses Pengajuan..." : "Kirim Pengajuan Sewa →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserCheckoutPage() {
  return (
    <RequireAuth allow={["user"]}>
      <Suspense
        fallback={
          <div className="p-6 text-sm text-ink/50">
            Memuat checkout...
          </div>
        }
      >
        <CheckoutForm />
      </Suspense>
    </RequireAuth>
  );
}