"use client";

import { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRentalsSync, updateRentalStatus } from "@/lib/stores/rentalsStore";
import { createRentalStatusLogAction } from "@/app/actions/rentalStatusLogs";
import { updateRentalAction } from "@/app/actions/rentals";
import { formatRupiah } from "@/lib/utils/hitungBiaya";
import { compressImage } from "@/lib/utils/imageCompressor";
import {
  BillingSummary,
  PaymentSuccessView,
  PaymentHeader,
  PaymentMethodSection,
} from "@/components/features/payment";

function PaymentContent() {
  const searchParams = useSearchParams();
  const rentalIdParam = searchParams.get("rentalId") || "";
  const rentals = useRentalsSync();

  const approvedRentals = useMemo(
    () =>
      rentals.filter(
        (r) =>
          r.status === "Disetujui" ||
          r.status === "diverifikasi" ||
          r.status === "aktif"
      ),
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

  const [method, setMethod] = useState("qris");
  const [proofFile, setProofFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const proofPreview = uploadedPreview || selectedRental?.payment_proof || null;

  const [userNotes, setUserNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedManually, setSubmittedManually] = useState(false);
  const submittedSuccess = submittedManually || Boolean(selectedRental?.payment_proof);
  const [copied, setCopied] = useState(false);

  const brivaNumber = useMemo(() => {
    if (!selectedRental) return "12800812345678";
    const numPart = String(selectedRental.id).replace(/\D/g, "") || "9982";
    return `12800${numPart.padStart(6, "0")}91`;
  }, [selectedRental]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar (JPG, PNG, atau screenshot).");
      return;
    }

    setProofFile(file);
    try {
      const compressedDataUrl = await compressImage(file);
      setUploadedPreview(compressedDataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

    // 1. Update state di rentalsStore (dan persistent cache)
    updateRentalStatus(selectedRental.id, "Disetujui", patchData, auditEntry);

    const backendId = selectedRental.backendId || Number(selectedRental.id) || 1;
    const userDbId = selectedRental.user_id ? Number(selectedRental.user_id) : 4;

    // 2. Catat audit status log ke tabel rental_status_logs
    try {
      await createRentalStatusLogAction({
        rental_id: backendId,
        step: "diverifikasi",
        note: auditEntry.notes,
        changed_by: userDbId,
      });
    } catch (err) {
      console.warn("Audit status log deferred:", err.message);
    }

    // 3. Update catatan di tabel rentals backend dengan data JSON lengkap
    try {
      let baseOrderNote = selectedRental.notes || selectedRental.note || "";
      try {
        if (typeof baseOrderNote === "string" && baseOrderNote.startsWith("{") && baseOrderNote.endsWith("}")) {
          const parsed = JSON.parse(baseOrderNote);
          baseOrderNote = parsed.order_note || parsed.note || "";
        }
      } catch { }

      const dbNotesPayload = JSON.stringify({
        order_note: baseOrderNote || `Pengajuan sewa: ${selectedRental.item}`,
        sub_status: "disetujui",
        payment_proof: proofPreview,
        payment_method: paymentMethodLabel,
        payment_status: "menunggu_verifikasi",
        payment_date: new Date().toLocaleString("id-ID"),
        payment_notes: userNotes || "",
      });

      await updateRentalAction(backendId, {
        status: "aktif",
        notes: dbNotesPayload,
      });
    } catch (err) {
      console.warn("Update rental notes in DB deferred:", err.message);
    }

    setSubmitting(false);
    setSubmittedManually(true);
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

  if (submittedManually) {
    return (
      <PaymentSuccessView
        selectedRental={selectedRental}
        method={method}
        userNotes={userNotes}
        proofPreview={proofPreview}
        waUrl={waUrl}
        onResetManual={() => setSubmittedManually(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PaymentHeader />

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
            <PaymentMethodSection
              method={method}
              setMethod={setMethod}
              selectedRental={selectedRental}
              brivaNumber={brivaNumber}
              copied={copied}
              onCopyVA={handleCopyVA}
              proofFile={proofFile}
              proofPreview={proofPreview}
              userNotes={userNotes}
              submitting={submitting}
              submittedSuccess={submittedSuccess}
              onFileChange={handleFileChange}
              setUserNotes={setUserNotes}
              onSubmitProof={handleSubmitProof}
            />
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
