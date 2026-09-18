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

  const searchParams = useSearchParams();
  const alat = searchParams.get("alat") || "";

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
      <div className="border border-line bg-white/40 p-8 text-center sm:p-12">
        <span className="status-dot bg-amber mx-auto block" style={{ width: 14, height: 14 }} />
        <h1 className="mt-6 font-display text-3xl font-bold text-ink">
          Pengajuan Sewa Terkirim
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink/65">
          Pengajuan Anda telah berhasil dicatat. Tim penyedia akan memverifikasi dokumen kamu. Pantau perkembangan statusnya di halaman riwayat.
        </p>
        <Link
          href="/user/riwayat"
          className="mt-8 inline-block rounded-sm bg-ridge px-6 py-3 text-sm font-medium text-fog hover:bg-ink transition-colors shadow-sm"
        >
          Lihat Status Pengajuan →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Checkout Pengajuan Sewa</h1>
          <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
            Peminjam
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Lengkapi data diri dan konfirmasi perlengkapan yang ingin kamu sewa sebelum diproses oleh pihak penyedia.
        </p>
      </div>

      <div className="border border-line bg-white/40 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink/70">Alat yang Dipilih</label>
            <input
              type="text"
              readOnly
              value={alat || "Tenda Dome Borneo 4 Person + Matras + Kompor"}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink/80 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink/70">Tanggal Mulai Sewa</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70">Tanggal Selesai Sewa</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap sesuai identitas"
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Nomor WhatsApp Aktif</label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="081234567890"
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Unggah Foto KTP (Simulasi)</label>
            <input
              type="file"
              className="mt-1.5 w-full text-sm text-ink/70 file:mr-4 file:rounded-sm file:border-0 file:bg-ridge file:px-4 file:py-2 file:text-xs file:font-medium file:text-fog hover:file:bg-ink cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-ridge py-3 text-center text-sm font-medium text-fog hover:bg-ink transition-colors shadow-sm"
          >
            {loading ? "Memproses..." : "Kirim Pengajuan Sewa"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function UserCheckoutPage() {
  return (
    <RequireAuth allow={["user"]}>
      <Suspense fallback={<div className="p-6 text-sm text-ink/50">Memuat checkout...</div>}>
        <CheckoutForm />
      </Suspense>
    </RequireAuth>
  );
}