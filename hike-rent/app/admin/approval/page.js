"use client";

import { useState } from "react";

const initialRequests = [
  {
    id: "NX-2309",
    name: "Rian Pratama",
    whatsapp: "6281234567890",
    item: "Tenda dome 4 orang + Kompor portable",
    date: "12 – 14 Sep 2026",
    status: "Menunggu verifikasi",
  },
  {
    id: "NX-2287",
    name: "Siti Aminah",
    whatsapp: "6289876543210",
    item: "Carrier 60L, Sleeping bag -5°C",
    date: "28 – 30 Agu 2026",
    status: "Menunggu verifikasi",
  },
];

export default function AdminApprovalPage() {
  const [requests, setRequests] = useState(initialRequests);

  function handleAction(id, newStatus) {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
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
        {requests.length === 0 ? (
          <div className="border border-line bg-white/40 p-8 text-center text-sm text-ink/60">
            Tidak ada pengajuan yang menunggu verifikasi saat ini.
          </div>
        ) : (
          requests.map((req) => {
            const waMessage = encodeURIComponent(
              `Halo ${req.name}, terkait pengajuan sewa NEXORA dengan ID ${req.id} (${req.item}), status verifikasi kamu saat ini adalah: ${req.status}.`
            );
            const waUrl = `https://wa.me/${req.whatsapp}?text=${waMessage}`;

            return (
              <div key={req.id} className="border border-line bg-white/40 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-mono text-xs text-ink/50">{req.id}</div>
                    <h2 className="mt-1 font-display text-lg font-semibold text-ink">
                      {req.name}
                    </h2>
                    <div className="mt-1 text-sm text-ink/70">
                      WhatsApp: <span className="font-mono">+{req.whatsapp}</span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-ink">
                      Alat: {req.item}
                    </div>
                    <div className="mt-1 text-xs text-ink/50">Jadwal: {req.date}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        req.status === "Menunggu verifikasi"
                          ? "bg-amber text-ink"
                          : req.status === "Disetujui"
                          ? "bg-ridge text-fog"
                          : "bg-line text-ink/60"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between border-t border-line pt-4 gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleAction(req.id, "Disetujui")}
                      className="rounded-sm bg-ridge px-4 py-2 text-xs font-medium text-fog hover:bg-ink transition-colors"
                    >
                      Setujui Pengajuan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(req.id, "Ditolak")}
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