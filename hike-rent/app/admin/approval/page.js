"use client";

import { useState, useMemo } from "react";
import { useRentalsSync, updateRentalStatus, syncRentalsFromBackend } from "@/lib/stores/rentalsStore";
import { statusStyle } from "@/constants/rentalStatus";
import { updateRentalAction } from "@/app/actions/rentals";
import { createRentalStatusLogAction } from "@/app/actions/rentalStatusLogs";
import { formatRupiah } from "@/lib/utils/hitungBiaya";

export default function AdminApprovalPage() {
  const allRentals = useRentalsSync();

  // Tab & search states
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  // Modal bukti bayar
  const [proofModalUrl, setProofModalUrl] = useState(null);

  // Status notes input state per rental id
  const [statusNotes, setStatusNotes] = useState({});

  // Loading state per action
  const [loadingId, setLoadingId] = useState(null);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: allRentals.length,
      pending: allRentals.filter((r) => r.status === "Menunggu verifikasi" || r.status === "diajukan" || r.status === "menunggu_verifikasi").length,
      approved: allRentals.filter((r) => r.status === "Disetujui" || r.status === "diverifikasi" || r.status === "aktif").length,
      borrowed: allRentals.filter((r) => r.status === "Diambil" || r.status === "diambil").length,
      done: allRentals.filter((r) => r.status === "Selesai" || r.status === "dikembalikan" || r.status === "selesai").length,
      rejected: allRentals.filter((r) => r.status === "Ditolak" || r.status === "ditolak" || r.status === "Dibatalkan").length,
    };
  }, [allRentals]);

  // Filter list
  const filteredRentals = useMemo(() => {
    return allRentals.filter((req) => {
      // Filter tab
      if (activeTab === "pending" && !(req.status === "Menunggu verifikasi" || req.status === "diajukan" || req.status === "menunggu_verifikasi")) return false;
      if (activeTab === "approved" && !(req.status === "Disetujui" || req.status === "diverifikasi" || req.status === "aktif")) return false;
      if (activeTab === "borrowed" && !(req.status === "Diambil" || req.status === "diambil")) return false;
      if (activeTab === "done" && !(req.status === "Selesai" || req.status === "dikembalikan" || req.status === "selesai")) return false;
      if (activeTab === "rejected" && !(req.status === "Ditolak" || req.status === "ditolak" || req.status === "Dibatalkan")) return false;

      // Filter search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (req.name || req.user || "").toLowerCase().includes(q);
        const matchId = (req.id || "").toLowerCase().includes(q);
        const matchItem = (req.item || "").toLowerCase().includes(q);
        const matchWa = (req.whatsapp || "").toLowerCase().includes(q);
        if (!matchName && !matchId && !matchItem && !matchWa) return false;
      }

      return true;
    });
  }, [allRentals, activeTab, search]);

  /**
   * Mengubah status peminjaman dengan validasi urutan (Task 2)
   * Urutan valid: Menunggu verifikasi -> Disetujui -> Diambil -> Selesai
   */
  async function handleStatusTransition(req, targetStatus, customNote = "") {
    // Validasi urutan status
    const current = req.status;

    if (current === "Menunggu verifikasi" || current === "diajukan" || current === "menunggu_verifikasi") {
      if (targetStatus !== "Disetujui" && targetStatus !== "Ditolak") {
        alert("Validasi: Pengajuan yang masih menunggu verifikasi hanya dapat disetujui atau ditolak!");
        return;
      }
    } else if (current === "Disetujui" || current === "diverifikasi" || current === "aktif") {
      if (targetStatus === "Diambil" || targetStatus === "diambil") {
        const hasProof = Boolean(req.payment_proof && String(req.payment_proof).trim().length > 10);
        if (!hasProof) {
          alert(
            "⚠️ PERINGATAN: Peminjam belum mengonfirmasi pembayaran atau mengunggah bukti transfer!\n\nAdmin tidak dapat menyerahkan alat / mengubah status ke 'Diambil' sebelum peminjam mengunggah bukti bayar."
          );
          return;
        }
      }
      if (targetStatus !== "Diambil" && targetStatus !== "diambil" && targetStatus !== "Ditolak" && targetStatus !== "ditolak" && targetStatus !== "Dibatalkan") {
        alert("Validasi: Dari status Disetujui, tahap berikutnya adalah Diambil (setelah verifikasi pembayaran) atau Dibatalkan!");
        return;
      }
    } else if (current === "Diambil" || current === "diambil") {
      if (targetStatus !== "Selesai" && targetStatus !== "Dibatalkan") {
        alert("Validasi: Dari status Diambil, tahap berikutnya adalah Selesai (saat barang dikembalikan)!");
        return;
      }
    } else if (current === "Selesai" || current === "Ditolak" || current === "dikembalikan" || current === "ditolak") {
      alert("Pengajuan ini sudah berstatus final dan tidak dapat diubah lagi.");
      return;
    }

    setLoadingId(req.id);
    const noteText =
      customNote ||
      statusNotes[req.id] ||
      `Admin mengubah status dari "${current}" menjadi "${targetStatus}".`;

    // Map ke nilai enum skema database backend: menunggu_verifikasi | aktif | selesai | ditolak
    let backendStatus = "menunggu_verifikasi";
    if (targetStatus === "Disetujui" || targetStatus === "Diambil") backendStatus = "aktif";
    else if (targetStatus === "Selesai") backendStatus = "selesai";
    else if (targetStatus === "Ditolak" || targetStatus === "Dibatalkan") backendStatus = "ditolak";

    const extraPatch = {};
    if (targetStatus === "Diambil") {
      extraPatch.payment_status = "terverifikasi";
    }

    const auditEntry = {
      notes: noteText,
      changed_by: "Admin Rental (NEXORA)",
    };

    // 1. Update reactive local store
    updateRentalStatus(req.id, targetStatus, extraPatch, auditEntry);

    // Cari ID integer backend (jika req.backendId kosong tapi req.id angka/ditemukan)
    const rentalBackendId =
      Number(req.backendId) ||
      (typeof req.id === "number" ? req.id : (!isNaN(Number(req.id)) ? Number(req.id) : null));

    // Pertahankan payment proof dan data JSON yang tersimpan di DB
    let baseOrderNote = req.item || "";
    let existingProof = req.payment_proof || "";
    let existingMethod = req.payment_method || "";
    let existingDate = req.payment_date || "";
    let existingUserNotes = req.payment_notes || "";

    const rawNotes = req.notes || req.note || "";
    try {
      if (typeof rawNotes === "string" && rawNotes.trim().startsWith("{") && rawNotes.trim().endsWith("}")) {
        const parsed = JSON.parse(rawNotes.trim());
        if (parsed.order_note) baseOrderNote = parsed.order_note;
        if (parsed.payment_proof && !existingProof) existingProof = parsed.payment_proof;
        if (parsed.payment_method && !existingMethod) existingMethod = parsed.payment_method;
        if (parsed.payment_date && !existingDate) existingDate = parsed.payment_date;
        if (parsed.payment_notes && !existingUserNotes) existingUserNotes = parsed.payment_notes;
      }
    } catch { }

    let subStatus = "disetujui";
    if (targetStatus === "Diambil") subStatus = "diambil";
    else if (targetStatus === "Selesai") subStatus = "selesai";
    else if (targetStatus === "Ditolak" || targetStatus === "Dibatalkan") subStatus = "ditolak";
    else if (targetStatus === "Menunggu verifikasi") subStatus = "diajukan";

    const dbNotesPayload = JSON.stringify({
      order_note: baseOrderNote || `Pengajuan sewa: ${req.item}`,
      sub_status: subStatus,
      payment_proof: existingProof,
      payment_method: existingMethod,
      payment_status: targetStatus === "Diambil" || targetStatus === "Selesai" ? "terverifikasi" : (req.payment_status || "menunggu_verifikasi"),
      payment_date: existingDate || new Date().toLocaleString("id-ID"),
      payment_notes: existingUserNotes,
      admin_note: noteText,
      updated_at: new Date().toISOString(),
    });

    // 2. Update backend rental table jika rentalBackendId valid
    if (rentalBackendId) {
      try {
        await updateRentalAction(rentalBackendId, {
          status: backendStatus,
          notes: dbNotesPayload,
        });
      } catch (err) {
        console.warn("Update rental backend deferred:", err.message);
      }
    }

    // 3. Record audit trail log ke backend table rental_status_logs
    if (rentalBackendId) {
      try {
        // Petakan ke enum resmi kolom 'step' di database:
        // enum: 'diajukan' | 'diverifikasi' | 'diambil' | 'dikembalikan'
        let stepEnum = "diverifikasi";
        if (targetStatus === "Disetujui") stepEnum = "diverifikasi";
        else if (targetStatus === "Diambil") stepEnum = "diambil";
        else if (targetStatus === "Selesai") stepEnum = "dikembalikan";
        else if (targetStatus === "Menunggu verifikasi") stepEnum = "diajukan";
        else stepEnum = "diverifikasi";

        await createRentalStatusLogAction({
          rental_id: rentalBackendId,
          step: stepEnum,
          note: noteText,
        });
      } catch (err) {
        console.warn("Audit status log deferred:", err.message);
      }
    }

    // 4. Sinkronkan ulang data dari backend agar state lokal selalu akurat
    try {
      await syncRentalsFromBackend();
    } catch { }

    // Reset input note
    setStatusNotes((prev) => ({ ...prev, [req.id]: "" }));
    setLoadingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header Halaman Admin Approval (Apple-like rounded & backdrop blur) */}
      <div className="rounded-2xl border border-line bg-white/70 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
                Panel Admin
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Manajemen Siklus Sewa</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Approval & Kontrol Status Sewa
            </h1>
            <p className="mt-1.5 text-sm text-ink/65">
              Kelola seluruh siklus peminjaman alat: verifikasi pengajuan, konfirmasi pembayaran,
              penyerahan alat, hingga pengembalian selesai.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-ridge px-3.5 py-1 font-mono text-xs font-medium text-fog shadow-sm">
              {allRentals.length} Total Transaksi
            </span>
          </div>
        </div>

        {/* Tab Filter Status */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-line/60 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${activeTab === "all"
              ? "bg-ridge text-fog shadow-sm"
              : "bg-paper/70 text-ink/70 hover:bg-paper hover:text-ink"
              }`}
          >
            Semua ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${activeTab === "pending"
              ? "bg-amber text-ink shadow-sm"
              : "bg-paper/70 text-ink/70 hover:bg-paper hover:text-ink"
              }`}
          >
            Menunggu Verifikasi ({counts.pending})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("approved")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${activeTab === "approved"
              ? "bg-moss text-fog shadow-sm"
              : "bg-paper/70 text-ink/70 hover:bg-paper hover:text-ink"
              }`}
          >
            Disetujui / Bayar ({counts.approved})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("borrowed")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${activeTab === "borrowed"
              ? "bg-ridge text-amber shadow-sm"
              : "bg-paper/70 text-ink/70 hover:bg-paper hover:text-ink"
              }`}
          >
            Sedang Dipinjam ({counts.borrowed})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("done")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${activeTab === "done"
              ? "bg-ink text-fog shadow-sm"
              : "bg-paper/70 text-ink/70 hover:bg-paper hover:text-ink"
              }`}
          >
            Selesai ({counts.done})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rejected")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${activeTab === "rejected"
              ? "bg-alert text-fog shadow-sm"
              : "bg-paper/70 text-ink/70 hover:bg-paper hover:text-ink"
              }`}
          >
            Ditolak ({counts.rejected})
          </button>
        </div>

        {/* Input Pencarian */}
        <div className="mt-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID rental (NX-...), nama penyewa, alat, atau WhatsApp..."
            className="w-full rounded-xl border border-line bg-paper/70 px-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/40 focus:border-ridge focus:bg-white"
          />
        </div>
      </div>

      {/* Daftar Pengajuan Sewa */}
      <div className="space-y-5">
        {filteredRentals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white/50 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-paper border border-line font-mono text-sm text-ink/40">
              0
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">
              Tidak Ada Pengajuan Ditemukan
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
              Tidak ada data transaksi peminjaman pada filter atau kata kunci yang dipilih.
            </p>
          </div>
        ) : (
          filteredRentals.map((req) => {
            const cleanWa = (req.whatsapp || "").replace(/^0/, "62").replace(/\D/g, "");
            const waMessage = encodeURIComponent(
              `Halo ${req.name}, terkait transaksi sewa NEXORA ${req.id} (${req.item}), status saat ini adalah: "${req.status}".`
            );
            const waUrl = `https://wa.me/${cleanWa || "6281234567890"}?text=${waMessage}`;

            const isPending = req.status === "Menunggu verifikasi" || req.status === "diajukan" || req.status === "menunggu_verifikasi";
            const isApproved = req.status === "Disetujui" || req.status === "diverifikasi" || req.status === "aktif";
            const isBorrowed = req.status === "Diambil" || req.status === "diambil";
            const isFinished = req.status === "Selesai" || req.status === "dikembalikan" || req.status === "selesai";
            const isRejected = req.status === "Ditolak" || req.status === "ditolak" || req.status === "Dibatalkan";
            const hasPaymentProof = Boolean(req.payment_proof && String(req.payment_proof).trim().length > 10);
            const isLoading = loadingId === req.id;

            return (
              <div
                key={req.id}
                className="rounded-2xl border border-line bg-white/80 p-6 shadow-sm transition-all duration-200 hover:shadow-md backdrop-blur-sm"
              >
                {/* Header Card: ID, Nama, Status Badge */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ink/60 bg-paper px-2 py-0.5 rounded-md border border-line">
                        {req.id}
                      </span>
                      <span className="text-xs text-ink/40 font-mono">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString("id-ID") : "-"}
                      </span>
                    </div>

                    <h2 className="mt-2 font-display text-xl font-bold text-ink">
                      {req.name}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink/70">
                      <span>WhatsApp: <strong className="font-mono text-ink">{req.whatsapp}</strong></span>
                      {req.ktp_number && (
                        <span>KTP: <strong className="font-mono text-ink">{req.ktp_number}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3.5 py-1 text-xs font-semibold shadow-sm ${statusStyle[req.status] || "bg-amber text-ink"
                        }`}
                    >
                      ● {req.status}
                    </span>

                    {/* Badge Status Pembayaran (Task 3 & 7) */}
                    {req.payment_status && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${req.payment_status === "terverifikasi"
                          ? "bg-moss/10 border-moss/30 text-moss"
                          : req.payment_status === "menunggu_verifikasi"
                            ? "bg-amber/20 border-amber/40 text-ink font-semibold"
                            : "bg-paper border-line text-ink/60"
                          }`}
                      >
                        {req.payment_status === "terverifikasi" && "✓ Bayar Terverifikasi"}
                        {req.payment_status === "menunggu_verifikasi" && "💳 Bukti Bayar Diunggah (Perlu Dicek)"}
                        {req.payment_status === "menunggu_pembayaran" && "⏳ Menunggu Pembayaran User"}
                        {req.payment_status === "belum_tersedia" && "Pembayaran Belum Dibuka"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Detail Alat & Biaya */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-paper/50 p-4 border border-line/60 text-xs text-ink/75">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-ink/50 block">Peralatan Sewa</span>
                    <strong className="text-sm font-semibold text-ink mt-0.5 block">{req.item}</strong>
                    <span className="text-ink/60">Kategori: {req.category || "Peralatan"}</span>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] uppercase text-ink/50 block">Jadwal Pengambilan & Durasi</span>
                    <strong className="text-sm font-semibold text-ink mt-0.5 block">{req.date}</strong>
                    <span className="text-ink/60">Durasi: {req.total_days || req.nights || 1} hari sewa</span>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] uppercase text-ink/50 block">Total Biaya Sewa</span>
                    <strong className="text-base font-bold text-ink mt-0.5 block">
                      {formatRupiah(req.total || req.total_price || 0)}
                    </strong>
                    <span className="text-ink/60">Metode: {req.payment_method || "Simulasi Transfer"}</span>
                  </div>
                </div>

                {/* Catatan Penyewa */}
                {req.note && (
                  <div className="mt-3 rounded-lg bg-white p-3 border border-line/50 text-xs text-ink/75">
                    <strong className="text-ink">Catatan Peminjam:</strong> {req.note}
                  </div>
                )}

                {/* Bukti Bayar Preview & Lightbox Trigger */}
                {req.payment_proof && (
                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber/30 bg-amber/10 p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.payment_proof}
                        alt="Bukti Transfer"
                        onClick={() => setProofModalUrl(req.payment_proof)}
                        className="h-12 w-12 cursor-pointer rounded-lg border border-line object-cover shadow-sm hover:scale-105 transition-transform"
                      />
                      <div>
                        <div className="text-xs font-semibold text-ink">
                          Bukti Pembayaran Diunggah
                        </div>
                        <div className="text-[11px] text-ink/60">
                          {req.payment_notes ? `"${req.payment_notes}" • ` : ""}
                          {req.payment_date || "Menunggu verifikasi"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setProofModalUrl(req.payment_proof)}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink border border-line shadow-sm hover:bg-paper transition-all"
                    >
                      🔍 Perbesar Bukti Bayar
                    </button>
                  </div>
                )}

                {/* Warning Banner Jika Belum Ada Bukti Pembayaran */}
                {isApproved && !hasPaymentProof && (
                  <div className="mt-3.5 flex items-start gap-3 rounded-xl border border-amber/50 bg-amber/15 p-3.5 text-xs text-amber-950">
                    <span className="text-lg leading-none mt-0.5">⚠️</span>
                    <div>
                      <strong className="block font-semibold text-amber-950">
                        Peminjam Belum Konfirmasi Pembayaran
                      </strong>
                      <p className="mt-0.5 text-[11px] text-amber-850/90 leading-relaxed">
                        Peminjam belum mengunggah bukti transfer atau struk pembayaran. Tombol penyerahan alat (<strong className="font-mono text-amber-950">&quot;Diambil&quot;</strong>) dikunci untuk mencegah penyerahan barang sebelum pembayaran diselesaikan.
                      </p>
                    </div>
                  </div>
                )}

                {/* Input Catatan Petugas */}
                {!isFinished && !isRejected && (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={statusNotes[req.id] || ""}
                      onChange={(e) =>
                        setStatusNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                      placeholder="Tambahkan catatan petugas/audit untuk perubahan status ini (opsional)..."
                      className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-xs text-ink placeholder:text-ink/40 outline-none focus:border-ridge focus:bg-white"
                    />
                  </div>
                )}

                {/* Status Action Buttons */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Tahap 1: Approval */}
                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleStatusTransition(req, "Disetujui")}
                          className="rounded-xl bg-ridge px-4 py-2 text-xs font-semibold text-fog shadow-sm hover:bg-ink transition-all disabled:opacity-50"
                        >
                          ✓ Setujui Pengajuan
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleStatusTransition(req, "Ditolak")}
                          className="rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-xs font-semibold text-alert hover:border-alert/40 hover:bg-alert/10 transition-all disabled:opacity-50"
                        >
                          ✕ Tolak
                        </button>
                      </>
                    )}

                    {/* Tahap 2: Menunggu Pembayaran -> Diambil */}
                    {isApproved && (
                      <>
                        {hasPaymentProof ? (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              handleStatusTransition(
                                req,
                                "Diambil",
                                "Pembayaran terverifikasi oleh Admin. Alat diserahkan kepada peminjam."
                              )
                            }
                            className="rounded-xl bg-ridge px-4 py-2 text-xs font-semibold text-fog shadow-sm hover:bg-ink transition-all disabled:opacity-50"
                          >
                            📦 Konfirmasi Bayar & Serahkan Alat (Diambil)
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                alert(
                                  "⚠️ PERINGATAN: Peminjam belum mengonfirmasi pembayaran atau mengunggah bukti transfer!\n\nAdmin tidak dapat menyerahkan alat atau mengubah status ke 'Diambil' sebelum peminjam mengunggah foto bukti bayar."
                                );
                              }}
                              className="cursor-pointer rounded-xl bg-amber/15 border border-amber/40 px-4 py-2 text-xs font-semibold text-amber-950 shadow-xs hover:bg-amber/25 transition-all flex items-center gap-1.5"
                              title="Klik untuk melihat status terkunci"
                            >
                              <span>🔒</span>
                              <span>Serahkan Alat (Terkunci: Belum Ada Bukti Bayar)</span>
                            </button>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-line bg-paper px-3 py-2 text-xs font-medium text-ink/70 hover:bg-white hover:text-ink transition-all"
                            >
                              💬 Ingatkan via WA
                            </a>
                          </div>
                        )}
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleStatusTransition(req, "Dibatalkan", "Pengajuan dibatalkan oleh Admin.")}
                          className="rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-xs font-semibold text-alert hover:border-alert/40 hover:bg-alert/10 transition-all disabled:opacity-50"
                        >
                          Batalkan
                        </button>
                      </>
                    )}

                    {/* Tahap 3: Sedang Dipinjam -> Selesai / Dikembalikan */}
                    {isBorrowed && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          handleStatusTransition(
                            req,
                            "Selesai",
                            "Peralatan telah dikembalikan ke basecamp dalam kondisi baik. Peminjaman selesai."
                          )
                        }
                        className="rounded-xl bg-moss px-4 py-2 text-xs font-semibold text-fog shadow-sm hover:bg-[#3d593c] transition-all disabled:opacity-50"
                      >
                        ✓ Alat Dikembalikan (Selesaikan Transaksi)
                      </button>
                    )}

                    {/* Transaksi Selesai */}
                    {isFinished && (
                      <span className="rounded-xl bg-paper px-3 py-1.5 font-mono text-xs text-ink/60 border border-line">
                        ✓ Transaksi Selesai & Ditutup
                      </span>
                    )}

                    {/* Transaksi Ditolak */}
                    {isRejected && (
                      <span className="rounded-xl bg-alert/10 px-3 py-1.5 font-mono text-xs text-alert border border-alert/20">
                        ✕ Pengajuan Ditolak / Dibatalkan
                      </span>
                    )}
                  </div>

                  {/* Tombol Hubungi WhatsApp */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-ridge/40 bg-paper/60 px-3.5 py-2 text-xs font-semibold text-ridge hover:bg-ridge hover:text-fog transition-all shadow-sm"
                  >
                    <span>💬</span>
                    <span>Chat WhatsApp</span>
                  </a>
                </div>

                {/* Linimasa Audit Trail Status History Logs (Task 2) */}
                {req.status_logs && req.status_logs.length > 0 && (
                  <div className="mt-4 rounded-xl bg-paper/40 p-3.5 border border-line/50 text-xs">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50 font-semibold block mb-2">
                      Rekam Jejak Status (Audit Trail)
                    </span>
                    <div className="space-y-1.5">
                      {req.status_logs.map((log, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-2 text-ink/70">
                          <div>
                            <strong className="text-ink">[{log.status}]</strong> {log.notes}
                            <span className="text-ink/40 ml-1">({log.changed_by})</span>
                          </div>
                          <span className="font-mono text-[10px] text-ink/40 shrink-0">
                            {log.created_at ? new Date(log.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Popup Lightbox Bukti Transfer (Task 7) */}
      {proofModalUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md"
        >
          <div className="relative max-w-lg w-full rounded-2xl bg-white p-5 border border-line shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="font-display font-bold text-ink">Bukti Pembayaran Peminjam</h3>
              <button
                type="button"
                onClick={() => setProofModalUrl(null)}
                className="text-ink/50 hover:text-ink text-sm p-1 rounded-lg"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-line bg-paper">
              <img
                src={proofModalUrl}
                alt="Bukti Transfer Penuh"
                className="w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setProofModalUrl(null)}
                className="rounded-xl bg-ridge px-4 py-2 text-xs font-semibold text-fog hover:bg-ink transition-colors"
              >
                Selesai Meninjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}