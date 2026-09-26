"use client";

import Image from "next/image";
import { normalizeGearImage, slugify } from "@/lib/stores/catalogStore";
import { stockLabel } from "@/constants/gearStock";

export default function GearTable({
  filteredGear,
  confirmDeleteId,
  setConfirmDeleteId,
  openEditForm,
  handleDelete,
  searchQuery,
  selectedCategoryFilter,
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-line bg-white/70 shadow-sm backdrop-blur-md">
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper/50 text-xs uppercase font-semibold text-ink/60">
              <th className="px-5 py-3.5">Foto & Nama Alat</th>
              <th className="px-5 py-3.5">Kategori</th>
              <th className="px-5 py-3.5">Harga Sewa</th>
              <th className="px-5 py-3.5">Stok (Tersedia / Total)</th>
              <th className="px-5 py-3.5">Status Indikator</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {filteredGear.map((item) => {
              const total = Number(item.totalStock ?? item.total_stock ?? 5);
              const avail = Number(item.availableStock ?? item.available_stock ?? 5);
              const imgUrl = item.imageUrl || item.image || item.image_url;

              return (
                <tr key={item.id} className="hover:bg-white/60 transition-colors">
                  {/* 1. Foto & Nama Alat */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-line bg-paper flex items-center justify-center shadow-xs">
                        {imgUrl ? (
                          <Image
                            src={normalizeGearImage(imgUrl)}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-base opacity-40">⛺</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink">{item.name}</span>
                          {item.backendId && (
                            <span className="font-mono text-[10px] rounded-md bg-ridge/10 px-1.5 py-0.5 text-ridge border border-ridge/20 font-semibold">
                              #{item.backendId}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-xs text-ink/40 mt-0.5">
                          /{item.slug || slugify(item.name)}
                        </div>
                        {item.note && (
                          <div className="text-xs text-ink/55 mt-0.5 line-clamp-1 max-w-xs">
                            {item.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. Kategori */}
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-ink/80">{item.category}</div>
                    <div className="font-mono text-[11px] text-ink/40">
                      ID: {item.categoryId || item.category_id || "-"}
                    </div>
                  </td>

                  {/* 3. Harga Sewa */}
                  <td className="px-5 py-3.5 font-mono">
                    <span className="font-semibold text-ink">
                      Rp{Number(item.price).toLocaleString("id-ID")}
                    </span>
                    <span className="ml-1 text-xs font-normal text-ink/50">
                      /{item.unit || "hari"}
                    </span>
                  </td>

                  {/* 4. Stok (Tersedia / Total) */}
                  <td className="px-5 py-3.5 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink text-sm">
                        {avail} / {total} unit
                      </span>
                    </div>
                    <div className="mt-1 w-24 h-1.5 rounded-full bg-paper overflow-hidden border border-line/60">
                      <div
                        className={`h-full transition-all ${
                          avail === 0
                            ? "bg-alert"
                            : avail <= 2
                            ? "bg-amber"
                            : "bg-moss"
                        }`}
                        style={{
                          width: `${total > 0 ? Math.min(100, Math.round((avail / total) * 100)) : 0}%`,
                        }}
                      />
                    </div>
                  </td>

                  {/* 5. Status Indikator */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        item.stock === "hijau"
                          ? "bg-moss/15 text-moss"
                          : item.stock === "kuning"
                          ? "bg-amber/20 text-amber"
                          : "bg-alert/15 text-alert"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {stockLabel[item.stock] || item.stock}
                    </span>
                  </td>

                  {/* 6. Aksi */}
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(item)}
                        className="rounded-lg border border-line bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink hover:border-ridge hover:bg-white shadow-xs transition-all"
                      >
                        Ubah
                      </button>
                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg bg-alert px-3 py-1.5 text-xs font-semibold text-fog shadow-xs"
                          >
                            Yakin?
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs text-ink/60"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="rounded-lg border border-alert/30 px-3 py-1.5 text-xs font-semibold text-alert hover:bg-alert hover:text-fog transition-all"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredGear.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-ink/50 font-mono">
                  {searchQuery || selectedCategoryFilter !== "Semua"
                    ? "Tidak ada alat yang sesuai dengan filter pencarian."
                    : "Belum ada alat di katalog basis data."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
