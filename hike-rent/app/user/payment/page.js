"use client";

import { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRentalsSync, updateRentalStatus } from "@/lib/rentalsStore";
import { createRentalStatusLogAction } from "@/app/actions/rentalStatusLogs";
import { formatRupiah } from "@/lib/hitungBiaya";

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
      const match = rentals.find((r) => String(r.id) === String(rentalIdParam));
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

        {/* Disclaimer Demo Terbuka & Jujur (Task 7) */}
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
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-line bg-white/80 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="font-display text-lg font-bold text-ink border-b border-line/60 pb-3">
                Ringkasan Tagihan
              </h2>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink/60">ID Transaksi:</span>
                  <span className="font-mono font-bold text-ink bg-paper px-2 py-0.5 rounded border border-line">
                    {selectedRental.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60">Nama Peminjam:</span>
                  <strong className="text-ink">{selectedRental.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60">Alat Disewa:</span>
                  <strong className="text-ink">{selectedRental.item}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60">Jadwal Sewa:</span>
                  <span className="text-ink">{selectedRental.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60">Durasi:</span>
                  <span className="text-ink">{selectedRental.total_days || 1} Hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60">Status Pengajuan:</span>
                  <span className="rounded-full bg-moss/15 px-2.5 py-0.5 font-semibold text-moss">
                    ● {selectedRental.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-line/60 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-ink/70">Total Biaya:</span>
                  <span className="font-display text-2xl font-bold text-ink">
                    {formatRupiah(selectedRental.total || selectedRental.total_price || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Hubungi Admin via WhatsApp Click-to-Chat (Task 3) */}
            <div className="rounded-2xl border border-line bg-white/80 p-5 shadow-sm backdrop-blur-sm text-center">
              <h3 className="font-display text-sm font-bold text-ink">Butuh Konfirmasi Cepat?</h3>
              <p className="mt-1 text-xs text-ink/65 leading-relaxed">
                Hubungi pengelola basecamp NEXORA langsung via WhatsApp untuk pertanyaan seputar ketersediaan dan pengambilan alat.
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-moss/40 bg-moss/10 py-2.5 text-xs font-semibold text-moss hover:bg-moss hover:text-fog transition-all shadow-sm"
              >
                <span>💬</span>
                <span>Chat Admin via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Kolom Kanan: Pilihan Metode & Form Upload Bukti Bayar (Task 7) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-line bg-white/80 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="font-display text-xl font-bold text-ink">
                Pilih Metode Pembayaran
              </h2>
              <p className="mt-1 text-xs text-ink/60">
                Pilih salah satu metode pembayaran simulasi di bawah ini untuk menyelesaikan transaksi.
              </p>

              {/* Selector Tabs: QRIS vs BRIVA */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("qris")}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    method === "qris"
                      ? "border-ridge bg-ridge/5 ring-2 ring-ridge/20 shadow-sm"
                      : "border-line bg-paper/50 hover:bg-paper"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="font-display text-sm text-ink">QRIS</strong>
                    <span className="rounded-md bg-paper px-2 py-0.5 text-[10px] font-bold text-ink/70 border border-line">
                      Instant
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink/60">
                    Scan via GoPay, BCA, OVO, ShopeePay, Dana, dll.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod("briva")}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    method === "briva"
                      ? "border-ridge bg-ridge/5 ring-2 ring-ridge/20 shadow-sm"
                      : "border-line bg-paper/50 hover:bg-paper"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="font-display text-sm text-ink">BRIVA</strong>
                    <span className="rounded-md bg-paper px-2 py-0.5 text-[10px] font-bold text-ink/70 border border-line">
                      Virtual Account
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink/60">
                    Transfer via BRImo, ATM BRI, atau Bank Lain.
                  </p>
                </button>
              </div>

              {/* Tampilan Visual QRIS */}
              {method === "qris" && (
                <div className="mt-6 rounded-2xl border border-line bg-paper/40 p-6 text-center">
                  <div className="mx-auto max-w-xs rounded-xl bg-white p-5 border border-line shadow-sm">
                    {/* Header QRIS */}
                    <div className="flex items-center justify-between border-b border-line/60 pb-3">
                      <span className="font-display font-black text-sm tracking-wider text-ink">
                        QRIS
                      </span>
                      <span className="font-mono text-[10px] text-ink/50">
                        NEXORA BASECAMP
                      </span>
                    </div>

                    {/* QR Code Graphic Simulasi */}
                    <div className="my-4 flex items-center justify-center p-3 bg-white">
                      <svg
                        viewBox="0 0 160 160"
                        className="h-44 w-44 rounded-lg border border-line p-2"
                        fill="currentColor"
                      >
                        {/* Motif QR Code Simulasi Otentik */}
                        <rect width="160" height="160" fill="#ffffff" />
                        {/* Finder pattern top-left */}
                        <rect x="10" y="10" width="40" height="40" fill="#171B14" />
                        <rect x="18" y="18" width="24" height="24" fill="#ffffff" />
                        <rect x="24" y="24" width="12" height="12" fill="#171B14" />
                        {/* Finder pattern top-right */}
                        <rect x="110" y="10" width="40" height="40" fill="#171B14" />
                        <rect x="118" y="18" width="24" height="24" fill="#ffffff" />
                        <rect x="124" y="24" width="12" height="12" fill="#171B14" />
                        {/* Finder pattern bottom-left */}
                        <rect x="10" y="110" width="40" height="40" fill="#171B14" />
                        <rect x="18" y="118" width="24" height="24" fill="#ffffff" />
                        <rect x="24" y="124" width="12" height="12" fill="#171B14" />
                        {/* Alignment and data pixels */}
                        <rect x="60" y="20" width="8" height="8" fill="#171B14" />
                        <rect x="76" y="20" width="8" height="8" fill="#171B14" />
                        <rect x="92" y="20" width="8" height="8" fill="#171B14" />
                        <rect x="60" y="40" width="16" height="8" fill="#171B14" />
                        <rect x="84" y="40" width="16" height="8" fill="#171B14" />
                        <rect x="20" y="60" width="8" height="16" fill="#171B14" />
                        <rect x="36" y="60" width="8" height="8" fill="#171B14" />
                        <rect x="60" y="60" width="40" height="40" fill="#171B14" rx="4" />
                        <rect x="116" y="60" width="8" height="16" fill="#171B14" />
                        <rect x="132" y="60" width="8" height="8" fill="#171B14" />
                        <rect x="20" y="84" width="16" height="8" fill="#171B14" />
                        <rect x="124" y="84" width="16" height="8" fill="#171B14" />
                        <rect x="60" y="110" width="8" height="8" fill="#171B14" />
                        <rect x="76" y="110" width="16" height="8" fill="#171B14" />
                        <rect x="100" y="110" width="8" height="16" fill="#171B14" />
                        <rect x="124" y="110" width="16" height="8" fill="#171B14" />
                        <rect x="60" y="130" width="16" height="8" fill="#171B14" />
                        <rect x="84" y="130" width="8" height="16" fill="#171B14" />
                        <rect x="108" y="130" width="16" height="8" fill="#171B14" />
                        <rect x="132" y="130" width="8" height="16" fill="#171B14" />
                      </svg>
                    </div>

                    <div className="text-center">
                      <div className="font-mono text-xs font-semibold text-ink/70">
                        NMKR: 93600128004128
                      </div>
                      <div className="mt-1 font-display text-base font-bold text-ink">
                        {formatRupiah(selectedRental.total || selectedRental.total_price || 0)}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-ink/65 max-w-sm mx-auto">
                    Buka aplikasi e-wallet atau mobile banking favoritmu, scan QR di atas, dan simpan screenshot bukti pembayaran untuk diunggah pada formulir di bawah.
                  </p>
                </div>
              )}

              {/* Tampilan Visual BRIVA */}
              {method === "briva" && (
                <div className="mt-6 rounded-2xl border border-line bg-paper/40 p-6">
                  <div className="max-w-md mx-auto rounded-xl bg-white p-5 border border-line shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-line/60 pb-3">
                      <div>
                        <span className="font-display font-bold text-sm text-ink">
                          BRI Virtual Account (BRIVA)
                        </span>
                        <div className="text-[11px] text-ink/50">Merchant: NEXORA Rent</div>
                      </div>
                      <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                        BRI
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-ink/60">Nomor Virtual Account:</span>
                      <div className="mt-1 flex items-center justify-between gap-2 rounded-xl bg-paper/80 p-3 border border-line">
                        <span className="font-mono text-lg font-bold tracking-wider text-ink">
                          {brivaNumber}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyVA}
                          className="rounded-lg bg-ridge px-3 py-1 text-xs font-semibold text-fog hover:bg-ink transition-colors"
                        >
                          {copied ? "✓ Tersalin!" : "Salin"}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between border-t border-line/60 pt-3">
                      <span className="text-xs text-ink/60">Total Pembayaran:</span>
                      <span className="font-display text-lg font-bold text-ink">
                        {formatRupiah(selectedRental.total || selectedRental.total_price || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 max-w-md mx-auto text-xs text-ink/65 space-y-1">
                    <p className="font-semibold text-ink">Cara Pembayaran via BRImo:</p>
                    <p>1. Buka aplikasi BRImo &gt; Pilih menu <strong>BRIVA</strong>.</p>
                    <p>2. Masukkan nomor Virtual Account di atas &gt; Konfirmasi nama dan nominal tagihan.</p>
                    <p>3. Selesaikan transfer dan simpan tangkapan layar (screenshot) bukti pembayaran.</p>
                  </div>
                </div>
              )}

              {/* Form Unggah Bukti Bayar (Task 7) */}
              <form onSubmit={handleSubmitProof} className="mt-6 border-t border-line/60 pt-6 space-y-4">
                <div>
                  <h3 className="font-display text-base font-bold text-ink">
                    Unggah Bukti Pembayaran
                  </h3>
                  <p className="mt-0.5 text-xs text-ink/60">
                    Wajib mengunggah screenshot atau foto struk transfer sebelum admin dapat memverifikasi dan menyerahkan alat.
                  </p>
                </div>

                {/* File Upload Drop Area */}
                <div className="relative rounded-2xl border-2 border-dashed border-line bg-paper/30 p-6 text-center hover:bg-paper/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-3xl">📷</span>
                    <p className="mt-2 text-xs font-semibold text-ink">
                      {proofFile ? proofFile.name : "Klik atau seret foto bukti transfer di sini"}
                    </p>
                    <p className="mt-1 text-[11px] text-ink/50">
                      Format: JPG, PNG, atau WEBP (Maks 5MB)
                    </p>
                  </div>
                </div>

                {/* Preview Bukti yang Diunggah */}
                {proofPreview && (
                  <div className="rounded-xl border border-line bg-paper/40 p-4">
                    <span className="text-xs font-semibold text-ink block mb-2">
                      Pratinjau Bukti Transfer:
                    </span>
                    <div className="max-w-xs mx-auto overflow-hidden rounded-xl border border-line shadow-sm">
                      <img
                        src={proofPreview}
                        alt="Pratinjau Bukti"
                        className="w-full max-h-56 object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Catatan Tambahan */}
                <div>
                  <label className="block text-xs font-semibold text-ink/75 mb-1">
                    Catatan Pembayaran (Opsional):
                  </label>
                  <input
                    type="text"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Contoh: Transfer atas nama Budi Santoso via BCA Mobile"
                    className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ridge focus:bg-white"
                  />
                </div>

                {/* Tombol Kirim Bukti */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !proofPreview}
                    className="rounded-xl bg-ridge px-6 py-2.5 text-xs font-semibold text-fog shadow-sm hover:bg-ink transition-all disabled:opacity-50"
                  >
                    {submitting ? "Mengirim..." : submittedSuccess ? "Perbarui Bukti Pembayaran" : "Kirim Bukti Pembayaran"}
                  </button>

                  {submittedSuccess && (
                    <span className="rounded-full bg-moss/15 px-3 py-1 text-xs font-semibold text-moss">
                      ✓ Bukti pembayaran telah tersimpan
                    </span>
                  )}
                </div>
              </form>
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
