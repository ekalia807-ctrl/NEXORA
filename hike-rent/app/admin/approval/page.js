"use client";

import { useRentalsSync, updateRentalStatus } from "@/lib/rentalsStore";
import { updateRentalAction } from "@/app/actions/rentals";
import { createRentalStatusLogAction } from "@/app/actions/rentalStatusLogs";

export default function AdminApprovalPage() {
  const allRentals = useRentalsSync();
  const pendingRequests = allRentals.filter(
    (req) => req.status === "Menunggu verifikasi" || req.status === "diajukan"
  );

  async function handleAction(id, newStatus, backendId) {
    // 1. Perbarui state reaktif store
    updateRentalStatus(id, newStatus);

    // 2. Kirim update ke backend jika ada backendId
    if (backendId) {
      try {
        await updateRentalAction(backendId, {
          status: newStatus === "Disetujui" ? "diverifikasi" : "ditolak",
        });
      } catch (err) {
        console.warn("Update rental backend deferred:", err.message);
      }
    }

    // 3. Rekam audit trail status history log
    try {
      await createRentalStatusLogAction({
        rental_id: backendId || 1,
        status: newStatus === "Disetujui" ? "diverifikasi" : newStatus.toLowerCase(),
        notes: `Admin memverifikasi status pesanan ${id} menjadi ${newStatus}.`,
        changed_by: "Admin Rental",
      });
    } catch (err) {
      console.warn("Audit status log deferred:", err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Approval Pengajuan</h1>
          <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
            Panel Admin
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Daftar pengajuan sewa alat masuk yang memerlukan verifikasi dokumen KTP dan persetujuan.
        </p>
      </div>

      <div className="space-y-6">
        {pendingRequests.length === 0 ? (
          <div className="border border-line bg-white/40 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-ink/40 font-mono text-sm">
              0
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">
              Tidak Ada Pengajuan Menunggu Verifikasi
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
              Semua pengajuan sewa telah diproses atau belum ada pengajuan baru dari peminjam saat ini.
            </p>
          </div>
        ) : (
          pendingRequests.map((req) => {
            const cleanWa = (req.whatsapp || "").replace(/^0/, "62").replace(/\D/g, "");
            const waMessage = encodeURIComponent(
              `Halo ${req.name}, terkait pengajuan sewa NEXORA dengan ID ${req.id} (${req.item}), status verifikasi kamu saat ini adalah: ${req.status}.`
            );
            const waUrl = `https://wa.me/${cleanWa || "6281234567890"}?text=${waMessage}`;

            return (
              <div key={req.id} className="border border-line bg-white/40 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-mono text-xs text-ink/50">{req.id}</div>
                    <h2 className="mt-1 font-display text-lg font-semibold text-ink">
                      {req.name}
                    </h2>
                    <div className="mt-1 text-sm text-ink/70">
                      WhatsApp: <span className="font-mono">{req.whatsapp}</span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-ink">
                      Alat: {req.item}
                    </div>
                    <div className="mt-1 text-xs text-ink/50">Jadwal: {req.date}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full px-3 py-1 text-xs font-medium bg-amber text-ink">
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between border-t border-line pt-4 gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleAction(req.id, "Disetujui", req.backendId)}
                      className="rounded-sm bg-ridge px-4 py-2 text-xs font-medium text-fog hover:bg-ink transition-colors shadow-sm"
                    >
                      Setujui Pengajuan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(req.id, "Ditolak", req.backendId)}
                      className="rounded-sm border border-line px-4 py-2 text-xs font-medium text-ink hover:border-ink/40 transition-colors"
                    >
                      Tolak
                    </button>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm border border-ridge px-4 py-2 text-xs font-medium text-ridge hover:bg-ridge hover:text-fog transition-colors"
                  >
                    Chat Penyewa via WhatsApp
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}