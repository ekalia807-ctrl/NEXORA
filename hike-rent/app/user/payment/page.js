"use client";

import { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRentalsSync, updateRentalStatus } from "@/lib/stores/rentalsStore";
import { createRentalStatusLogAction } from "@/app/actions/rentalStatusLogs";
import { formatRupiah } from "@/lib/utils/hitungBiaya";
import {
  BillingSummary,
  PaymentMethodTabs,
  QrisView,
  BrivaView,
  ProofUploader,
} from "@/components/features/payment";

function PaymentContent() {
  const searchParams = useSearchParams();
  const rentalIdParam = searchParams.get("rentalId") || "";
  const rentals = useRentalsSync();

  // Cari rental yang dipilih atau fallback ke rental berstatus Disetujui
  const approvedRentals = useMemo(
    () => rentals.filter((r) => r.status === "Disetujui"),
    [rentals]
  );

  const selectedRental = useMemo(() => {
    if (rentalIdParam) {
      const match = rentals.find(
        (r) => String(r.id) === String(rentalIdParam) || String(r.order_code) === String(rentalIdParam)
      );
      if (match) return match;
    }
    return approvedRentals[0] || rentals[0] || null;
  }, [rentals, rentalIdParam, approvedRentals]);

  // Method state: "qris" atau "briva"
  const [method, setMethod] = useState("qris");

  // File upload state
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(
    selectedRental?.payment_proof || null
  );
  const [userNotes, setUserNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(
    Boolean(selectedRental?.payment_proof)
  );
  const [copied, setCopied] = useState(false);

  // Generate nomor VA dummy berdasarkan rental ID
  const brivaNumber = useMemo(() => {
    if (!selectedRental) return "12800812345678";
    const numPart = String(selectedRental.id).replace(/\D/g, "") || "9982";
    return `12800${numPart.padStart(6, "0")}91`;
  }, [selectedRental]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar (JPG, PNG, atau screenshot).");
      return;
    }

    setProofFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProofPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleCopyVA() {
    navigator.clipboard.writeText(brivaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleSubmitProof(e) {
    e.preventDefault();
    if (!selectedRental) return;

    if (!proofPreview) {
      alert("Harap unggah bukti pembayaran (screenshot atau foto struk transfer).");
      return;
    }

    setSubmitting(true);

    const paymentMethodLabel = method === "qris" ? "QRIS NEXORA" : "BRIVA (BRI Virtual Account)";
    const patchData = {
      payment_status: "menunggu_verifikasi",
      payment_method: paymentMethodLabel,
      payment_proof: proofPreview,
      payment_date: new Date().toLocaleString("id-ID"),
      payment_notes: userNotes,
    };

    const auditEntry = {
      status: "Disetujui",
      notes: `Peminjam mengunggah bukti pembayaran (${paymentMethodLabel}) sebesar ${formatRupiah(
        selectedRental.total || selectedRental.total_price || 0
      )}. Menunggu konfirmasi admin.`,
      changed_by: selectedRental.name || "Peminjam",
    };

    // 1. Update state di rentalsStore
    updateRentalStatus(selectedRental.id, "Disetujui", patchData, auditEntry);

    // 2. Catat audit status log
    try {
      await createRentalStatusLogAction({
        rental_id: selectedRental.backendId || 1,
        status: "diverifikasi",
        notes: auditEntry.notes,
        changed_by: selectedRental.name || "Peminjam",
      });
    } catch (err) {
      console.warn("Audit status log deferred:", err.message);
    }

    setSubmitting(false);
    setSubmittedSuccess(true);
  }

  // Pesan WhatsApp click-to-chat
  const waMessage = selectedRental
    ? encodeURIComponent(
        `Halo Admin NEXORA, saya sudah melakukan pembayaran untuk peminjaman ${selectedRental.id} (${selectedRental.item}) sebesar ${formatRupiah(
          selectedRental.total || selectedRental.total_price || 0
        )}. Bukti transfer telah saya unggah di sistem. Mohon bantuannya untuk verifikasi agar alat siap diambil. Terima kasih!`
      )
    : "";
  const waUrl = `https://wa.me/6281234567890?text=${waMessage}`;

  return (
    <div className="space-y-6">
      {/* Header Halaman Pembayaran */}
      <div className="rounded-2xl border border-line bg-white/70 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
                Langkah Transaksi
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Pembayaran Sewa</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Pembayaran & Konfirmasi Sewa
            </h1>
            <p className="mt-1.5 text-sm text-ink/65">
              Selesaikan pembayaran untuk pengajuan sewa yang telah disetujui admin sebelum mengambil alat di basecamp.
            </p>
          </div>

          <Link
            href="/user/riwayat"
            className="rounded-xl border border-line bg-paper/60 px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition-all"
          >
            ← Kembali ke Riwayat
          </Link>
        </div>

        {/* Disclaimer Demo */}
        <div className="mt-4 rounded-xl border border-amber/30 bg-amber/10 p-3.5 text-xs text-ink/80 flex items-start gap-2.5">
          <span className="text-base leading-none">ℹ️</span>
          <p>
            <strong>Simulasi Demo:</strong> Metode pembayaran di bawah ini (QRIS & BRIVA) adalah antarmuka simulasi visual untuk keperluan pengujian dan demonstrasi alur sistem NEXORA. Tidak ada pemotongan saldo atau dana riil yang diproses.
          </p>
        </div>
      </div>

      {!selectedRental ? (
        <div className="rounded-2xl border border-dashed border-line bg-white/50 p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper border border-line font-mono text-xl">
            💳
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">
            Tidak Ada Pengajuan yang Memerlukan Pembayaran
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
            Saat ini kamu belum memiliki pengajuan sewa yang telah disetujui oleh admin.
            Silakan ajukan sewa alat terlebih dahulu di katalog.
          </p>
          <div className="mt-6">
            <Link
              href="/user/katalog"
              className="inline-block rounded-xl bg-ridge px-5 py-2.5 text-xs font-semibold text-fog shadow-sm hover:bg-ink transition-all"
            >
              Jelajahi Katalog Alat →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Rincian Tagihan & Informasi Sewa */}
          <div className="lg:col-span-1">
            <BillingSummary rental={selectedRental} waUrl={waUrl} />
          </div>

          {/* Kolom Kanan: Pilihan Metode & Form Upload Bukti Bayar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-line bg-white/80 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold text-ink">
                Pilih Metode Pembayaran
              </h2>
              <p className="mt-1 text-xs text-ink/60">
                Pilih salah satu metode pembayaran simulasi di bawah ini untuk menyelesaikan transaksi.
              </p>

              {/* Selector Tabs: QRIS vs BRIVA */}
              <div className="mt-5">
                <PaymentMethodTabs method={method} onSelectMethod={setMethod} />
              </div>

              {/* Tampilan Visual QRIS */}
              {method === "qris" && (
                <QrisView totalAmount={selectedRental.total || selectedRental.total_price || 0} />
              )}

              {/* Tampilan Visual BRIVA */}
              {method === "briva" && (
                <BrivaView
                  brivaNumber={brivaNumber}
                  totalAmount={selectedRental.total || selectedRental.total_price || 0}
                  copied={copied}
                  onCopy={handleCopyVA}
                />
              )}

              {/* Form Unggah Bukti Bayar */}
              <ProofUploader
                proofFile={proofFile}
                proofPreview={proofPreview}
                userNotes={userNotes}
                submitting={submitting}
                submittedSuccess={submittedSuccess}
                onFileChange={handleFileChange}
                onNotesChange={setUserNotes}
                onSubmit={handleSubmitProof}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-ink/60 font-mono">
            <span className="animate-spin text-xl">⏳</span>
            <span>Memuat halaman pembayaran...</span>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
