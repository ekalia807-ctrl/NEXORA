"use client";

import Link from "next/link";
import { useRentalsSync, statusStyle } from "@/lib/rentalsStore";

export default function UserRiwayatPage() {
  const history = useRentalsSync();

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

      {history.length === 0 ? (
        <div className="border border-line bg-white/40 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-ink/40 font-mono text-sm">
            0
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">
            Belum Ada Riwayat Pengajuan
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
            Kamu belum memiliki riwayat pengajuan sewa peralatan pendakian. Jelajahi katalog alat dan ajukan sewa pertama kamu.
          </p>
          <div className="mt-6">
            <Link
              href="/user/katalog"
              className="inline-block rounded-sm bg-ridge px-5 py-2.5 text-xs font-medium text-fog hover:bg-ink transition-colors shadow-sm"
            >
              Jelajahi Katalog Alat →
            </Link>
          </div>
        </div>
      ) : (
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
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    statusStyle[h.status] || "bg-amber text-ink"
                  }`}
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
      )}
    </div>
  );
}
