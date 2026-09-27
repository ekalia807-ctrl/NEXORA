"use client";

import { Suspense } from "react";
import Link from "next/link";
import RequireAuth from "@/components/shared/RequireAuth";

import { useCheckoutForm } from "./hooks/useCheckoutForm";
import CustomerInfoFields from "./components/CustomerInfoFields";
import KtpUploader from "./components/KtpUploader";
import CheckoutOrderSummary from "./components/CheckoutOrderSummary";
import CheckoutSuccessModal from "./components/CheckoutSuccessModal";

function CheckoutForm() {
  const {
    submitted,
    name,
    whatsapp,
    startDate,
    endDate,
    todayStr,
    loading,
    ktpPreview,
    errors,
    paketItems,
    diffDays,
    totalPaketHarga,
    refs,
    handlers,
  } = useCheckoutForm();

  if (paketItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white/60 p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line bg-paper text-2xl">
          🎒
        </div>
        <h1 className="mt-4 font-display text-xl font-bold text-ink">
          Belum Ada Alat yang Dipilih
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/65">
          Silakan pilih alat dari Katalog atau paket dari Rekomendasi
          Rombongan terlebih dahulu sebelum melanjutkan ke checkout.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/user/katalog"
            className="rounded-xl bg-ridge px-6 py-2.5 text-xs font-semibold text-fog shadow-sm transition-all hover:bg-ink"
          >
            Ke Katalog Alat →
          </Link>
          <Link
            href="/user/rekomendasi"
            className="rounded-xl border border-line bg-paper/60 px-5 py-2.5 text-xs font-semibold text-ink transition-all hover:bg-paper"
          >
            Lihat Rekomendasi Rombongan
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <CheckoutSuccessModal
        name={name}
        whatsapp={whatsapp}
        paketItems={paketItems}
        startDate={startDate}
        endDate={endDate}
        totalPaketHarga={totalPaketHarga}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-white/70 p-6 shadow-sm backdrop-blur-md sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber">
                Langkah Transaksi
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Formulir Sewa</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Checkout Pengajuan Sewa
            </h1>
            <p className="mt-1.5 text-sm text-ink/65">
              Lengkapi data peminjaman dan konfirmasi perlengkapan yang ingin
              kamu sewa sebelum diproses oleh penyedia.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/user/katalog"
              className="rounded-xl border border-line bg-paper/60 px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition-all"
            >
              ← Kembali ke Katalog
            </Link>
            <span className="rounded-full bg-ridge px-3.5 py-1 font-mono text-xs font-medium text-fog shadow-sm">
              Panel Peminjam
            </span>
          </div>
        </div>
      </div>

      <form noValidate onSubmit={handlers.handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Jadwal & Data Peminjam */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-line bg-white/80 p-5 sm:p-6 lg:p-7 shadow-sm backdrop-blur-sm space-y-5">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                1. Jadwal & Data Peminjam
              </h2>
              <p className="mt-0.5 text-xs text-ink/65">
                Pastikan tanggal peminjaman dan identitas sesuai untuk verifikasi basecamp.
              </p>
            </div>

            {/* Input Data Diri & Tanggal */}
            <CustomerInfoFields
              startDate={startDate}
              endDate={endDate}
              name={name}
              whatsapp={whatsapp}
              todayStr={todayStr}
              errors={errors}
              startDateInputRef={refs.startDateInputRef}
              endDateInputRef={refs.endDateInputRef}
              nameInputRef={refs.nameInputRef}
              whatsappInputRef={refs.whatsappInputRef}
              handleStartDateChange={handlers.handleStartDateChange}
              handleEndDateChange={handlers.handleEndDateChange}
              handleNameChange={handlers.handleNameChange}
              handleWhatsappChange={handlers.handleWhatsappChange}
              handleWhatsappKeyDown={handlers.handleWhatsappKeyDown}
              handleWhatsappPaste={handlers.handleWhatsappPaste}
              handleWhatsappBlur={handlers.handleWhatsappBlur}
            />

            {/* KTP Uploader */}
            <KtpUploader
              ktpInputRef={refs.ktpInputRef}
              ktpPreview={ktpPreview}
              errors={errors}
              onChange={handlers.handleKtpChange}
              onRemove={handlers.handleRemoveKtp}
              onUseSampleKtp={handlers.handleUseSampleKtp}
            />
          </div>
        </div>

        {/* Kolom Kanan: Ringkasan Pesanan & Konfirmasi */}
        <CheckoutOrderSummary
          paketItems={paketItems}
          diffDays={diffDays}
          totalPaketHarga={totalPaketHarga}
          loading={loading}
        />
      </form>
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
