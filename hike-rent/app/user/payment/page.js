"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRentalsSync, updateRentalStatus } from "@/lib/stores/rentalsStore";
import { createRentalStatusLogAction } from "@/app/actions/rentalStatusLogs";
import { updateRentalAction } from "@/app/actions/rentals";
import { formatRupiah } from "@/lib/utils/hitungBiaya";
import {
  BillingSummary,
  PaymentMethodTabs,
  QrisView,
  BrivaView,
  ProofUploader,
} from "@/components/features/payment";

function compressImage(file, maxWidth = 600, quality = 0.6) {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.FileReader) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const rentalIdParam = searchParams.get("rentalId") || "";
  const rentals = useRentalsSync();

  // Cari rental yang dipilih atau fallback ke rental berstatus Disetujui/diverifikasi
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

  // Method state: "qris" atau "briva"
  const [method, setMethod] = useState("qris");

  // File upload state
  const [proofFile, setProofFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const proofPreview = uploadedPreview || selectedRental?.payment_proof || null;

  const [userNotes, setUserNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedManually, setSubmittedManually] = useState(false);
  const submittedSuccess = submittedManually || Boolean(selectedRental?.payment_proof);
  const [copied, setCopied] = useState(false);

  // Generate nomor VA dummy berdasarkan rental ID
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

    // 3. Update catatan di tabel rentals backend dengan data JSON lengkap (bukti bayar, metode, tanggal)
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
      <div className="rounded-2xl border border-line bg-white/70 p-8 text-center shadow-sm backdrop-blur-md sm:p-12">
        <span
          className="status-dot bg-moss mx-auto block"
          style={{ width: 16, height: 16 }}
        />

        <h1 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-ink">
          Bukti Pembayaran Berhasil Dikirim!
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink/65">
          Bukti transfer pembayaran kamu telah tersimpan di sistem. Tim admin NEXORA akan segera memverifikasi transaksi ini. Setelah pembayaran diverifikasi, kamu dapat mengambil peralatan di basecamp sesuai jadwal peminjaman.
        </p>

        <div className="mx-auto mt-6 max-w-md space-y-2 rounded-xl border border-line bg-paper/60 p-5 text-left text-xs text-ink/80 shadow-sm">
          <div className="flex justify-between border-b border-line/40 pb-2">
            <span className="text-ink/50">ID Transaksi:</span>
            <span className="font-mono font-semibold text-ink">{selectedRental.id}</span>
          </div>
          <div className="flex justify-between border-b border-line/40 pb-2">
            <span className="text-ink/50">Peralatan Sewa:</span>
            <span className="font-semibold text-ink">{selectedRental.item}</span>
          </div>
          <div className="flex justify-between border-b border-line/40 pb-2">
            <span className="text-ink/50">Metode Pembayaran:</span>
            <span className="font-medium text-ink">
              {method === "qris" ? "QRIS NEXORA" : "BRIVA (BRI Virtual Account)"}
            </span>
          </div>
          <div className="flex justify-between border-b border-line/40 pb-2">
            <span className="text-ink/50">Total Pembayaran:</span>
            <span className="font-mono font-bold text-ink">
              {formatRupiah(selectedRental.total || selectedRental.total_price || 0)}
            </span>
          </div>
          <div className="flex justify-between pt-0.5">
            <span className="text-ink/50">Status Transaksi:</span>
            <span className="rounded-full bg-moss/15 px-2.5 py-0.5 text-[11px] font-semibold text-moss">
              ● Menunggu Verifikasi Admin
            </span>
          </div>

          {proofPreview && (
            <div className="mt-3 border-t border-line/40 pt-3">
              <span className="block text-[11px] text-ink/50 mb-1.5">Foto Bukti Terunggah:</span>
              <img
                src={proofPreview}
                alt="Bukti Transfer"
                className="max-h-44 mx-auto rounded-lg border border-line object-contain bg-paper/50 p-1"
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/user/riwayat"
            className="rounded-xl bg-ridge px-6 py-2.5 text-xs font-semibold text-fog shadow-sm transition-all hover:bg-ink"
          >
            Lihat Status di Riwayat →
          </Link>
          <button
            type="button"
            onClick={() => setSubmittedManually(false)}
            className="rounded-xl border border-line bg-paper/60 px-5 py-2.5 text-xs font-semibold text-ink transition-all hover:bg-paper"
          >
            Ubah / Perbarui Bukti
          </button>
          <Link
            href="/user/katalog"
            className="rounded-xl border border-line bg-white px-5 py-2.5 text-xs font-semibold text-ink/70 transition-all hover:bg-paper"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

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
