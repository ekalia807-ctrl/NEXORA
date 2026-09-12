"use client";

const history = [
  {
    id: "NX-2309",
    item: "Tenda dome 4 orang + Kompor portable",
    date: "12 – 14 Sep 2026",
    status: "Aktif",
    steps: ["Diajukan", "Diverifikasi", "Diambil", "Dikembalikan"],
    currentStep: 2,
  },
  {
    id: "NX-2287",
    item: "Carrier 60L, Sleeping bag -5°C",
    date: "28 – 30 Agu 2026",
    status: "Menunggu verifikasi",
    steps: ["Diajukan", "Diverifikasi", "Diambil", "Dikembalikan"],
    currentStep: 0,
  },
  {
    id: "NX-2214",
    item: "GPS handheld",
    date: "15 – 17 Jul 2026",
    status: "Selesai",
    steps: ["Diajukan", "Diverifikasi", "Diambil", "Dikembalikan"],
    currentStep: 3,
  },
];

const statusStyle = {
  Aktif: "bg-moss text-fog",
  "Menunggu verifikasi": "bg-amber text-ink",
  Selesai: "bg-line text-ink/60",
};

export default function UserRiwayatPage() {
  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Riwayat & Status</h1>
          <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
            Peminjam
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Semua pengajuan sewa kamu, dari yang masih berjalan sampai yang sudah selesai dikembalikan.
        </p>
      </div>

      <div className="space-y-6">
        {history.map((h) => (
          <div key={h.id} className="border border-line bg-white/40 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono text-xs text-ink/50">{h.id}</div>
                <h2 className="mt-1 font-display text-lg font-semibold text-ink">
                  {h.item}
                </h2>
                <div className="mt-1 text-sm text-ink/60">{h.date}</div>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusStyle[h.status]}`}
              >
                {h.status}
              </span>
            </div>

            <div className="mt-6 flex items-center">
              {h.steps.map((step, i) => (
                <div key={step} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        i <= h.currentStep ? "bg-ridge" : "bg-line"
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        i <= h.currentStep ? "text-ink font-medium" : "text-ink/35"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {i < h.steps.length - 1 && (
                    <span
                      className={`mx-2 h-px flex-1 ${
                        i < h.currentStep ? "bg-ridge" : "bg-line"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
