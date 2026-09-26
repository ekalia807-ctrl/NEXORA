"use client";

import { useState, useMemo } from "react";
import { useRentalsSync, updateRentalStatus, syncRentalsFromBackend } from "@/lib/stores/rentalsStore";
import { updateRentalAction } from "@/app/actions/rentals";
import { createRentalStatusLogAction } from "@/app/actions/rentalStatusLogs";

import RentalApprovalCard from "./components/RentalApprovalCard";
import PaymentProofModal from "./components/PaymentProofModal";
import ApprovalHeader from "./components/ApprovalHeader";
import ApprovalFilterBar from "./components/ApprovalFilterBar";

export default function AdminApprovalPage() {
  const allRentals = useRentalsSync();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [proofModalUrl, setProofModalUrl] = useState(null);
  const [statusNotes, setStatusNotes] = useState({});
  const [loadingId, setLoadingId] = useState(null);

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

  const filteredRentals = useMemo(() => {
    return allRentals.filter((req) => {
      if (activeTab === "pending" && !(req.status === "Menunggu verifikasi" || req.status === "diajukan" || req.status === "menunggu_verifikasi")) return false;
      if (activeTab === "approved" && !(req.status === "Disetujui" || req.status === "diverifikasi" || req.status === "aktif")) return false;
      if (activeTab === "borrowed" && !(req.status === "Diambil" || req.status === "diambil")) return false;
      if (activeTab === "done" && !(req.status === "Selesai" || req.status === "dikembalikan" || req.status === "selesai")) return false;
      if (activeTab === "rejected" && !(req.status === "Ditolak" || req.status === "ditolak" || req.status === "Dibatalkan")) return false;

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

  async function handleStatusTransition(req, targetStatus, customNote = "") {
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

    updateRentalStatus(req.id, targetStatus, extraPatch, auditEntry);

    const rentalBackendId =
      Number(req.backendId) ||
      (typeof req.id === "number" ? req.id : (!isNaN(Number(req.id)) ? Number(req.id) : null));

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
    });

    try {
      if (rentalBackendId) {
        await updateRentalAction(rentalBackendId, {
          status: backendStatus,
          notes: dbNotesPayload,
        });

        let auditStep = "menunggu_verifikasi";
        if (targetStatus === "Disetujui") auditStep = "diverifikasi";
        else if (targetStatus === "Diambil") auditStep = "diambil";
        else if (targetStatus === "Selesai") auditStep = "dikembalikan";
        else if (targetStatus === "Ditolak") auditStep = "ditolak";
        else if (targetStatus === "Dibatalkan") auditStep = "dibatalkan";

        await createRentalStatusLogAction({
          rental_id: rentalBackendId,
          step: auditStep,
          note: noteText,
        });
      }
    } catch (err) {
      console.warn("Gagal sinkronisasi status ke backend HMIF UNRAM:", err.message);
    } finally {
      setLoadingId(null);
      setStatusNotes((prev) => ({ ...prev, [req.id]: "" }));
    }
  }

  const tabs = [
    { id: "all", label: "Semua", count: counts.all },
    { id: "pending", label: "Menunggu Verifikasi", count: counts.pending },
    { id: "approved", label: "Disetujui / Siap Bayar", count: counts.approved },
    { id: "borrowed", label: "Sedang Dipinjam", count: counts.borrowed },
    { id: "done", label: "Selesai", count: counts.done },
    { id: "rejected", label: "Ditolak / Batal", count: counts.rejected },
  ];

  return (
    <div className="space-y-6">
      <ApprovalHeader onSync={syncRentalsFromBackend} />

      <ApprovalFilterBar
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="space-y-4">
        {filteredRentals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white/60 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-ink/40 font-mono text-sm">
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
          filteredRentals.map((req) => (
            <RentalApprovalCard
              key={req.id}
              req={req}
              isLoading={loadingId === req.id}
              statusNote={statusNotes[req.id] || ""}
              onStatusNoteChange={(val) =>
                setStatusNotes((prev) => ({ ...prev, [req.id]: val }))
              }
              onStatusTransition={handleStatusTransition}
              onOpenProofModal={(url) => setProofModalUrl(url)}
            />
          ))
        )}
      </div>

      <PaymentProofModal
        proofModalUrl={proofModalUrl}
        onClose={() => setProofModalUrl(null)}
      />
    </div>
  );
}