"use client";

import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils/hitungBiaya";

const PAKET_STORAGE_KEY = "nexora_paket_rekomendasi";

export default function OfficialPackagesView({
  officialPackages,
  packageItems,
  loadingPackages,
  gear,
  onSewaOfficialPackage,
}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-white/70 p-6 shadow-sm backdrop-blur-md">
        <h2 className="font-display text-xl font-bold text-ink">
          Paket Bundling Promo Pendakian
        </h2>
        <p className="mt-1 text-sm text-ink/65">
          Pilihan paket hemat komplit terverifikasi dari basis data NEXORA. Lebih hemat dan tanpa repot memilih satu-per-satu.
        </p>
      </div>

      {loadingPackages ? (
        <div className="rounded-2xl border border-line bg-white/70 p-12 text-center text-sm text-ink/50 shadow-sm backdrop-blur-md">
          Menghubungkan ke API Backend HMIF UNRAM untuk memuat paket bundling...
        </div>
      ) : officialPackages.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white/70 p-12 text-center text-sm text-ink/60 shadow-sm backdrop-blur-md">
          Belum ada paket bundling aktif di database backend.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {officialPackages.map((pkg) => {
            const itemsInPkg = packageItems.filter((it) => it.package_id === pkg.id);

            // Hitung estimasi harga per hari jika alat ditemukan di katalog
            const totalPerHari = itemsInPkg.reduce((sum, it) => {
              const matched = gear.find(
                (g) =>
                  g.id === String(it.gear_id) ||
                  g.name.toLowerCase().includes((it.gear_name || "").toLowerCase())
              );
              return sum + (matched ? matched.price * (it.quantity || 1) : 40000);
            }, 0);

            return (
              <div
                key={pkg.id}
                className="flex flex-col justify-between rounded-2xl border border-line bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-ridge hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-ink/60 bg-paper px-2 py-0.5 rounded border border-line">
                      PAKET #{pkg.id}
                    </span>
                    {pkg.target && (
                      <span className="rounded-full bg-ridge/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ridge">
                        {pkg.target}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-display text-xl font-bold text-ink">
                    {pkg.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink/65">
                    {pkg.description || "Paket bundling peralatan lengkap siap mendaki."}
                  </p>

                  {/* Komposisi Isi Paket */}
                  <div className="mt-4 border-t border-line/60 pt-3">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-ink/50 font-semibold">
                      Komposisi Alat ({itemsInPkg.length} item):
                    </p>
                    {itemsInPkg.length === 0 ? (
                      <p className="mt-2 text-xs italic text-ink/40">
                        Komposisi alat sedang diperbarui oleh admin.
                      </p>
                    ) : (
                      <ul className="mt-2.5 space-y-2">
                        {itemsInPkg.map((it) => (
                          <li
                            key={it.id}
                            className="flex items-center justify-between text-xs text-ink/80 bg-paper/60 px-3 py-2 rounded-xl border border-line/40"
                          >
                            <span className="font-medium">
                              {it.gear_name || `Alat #${it.gear_id}`}
                            </span>
                            <span className="font-mono font-bold text-ridge">
                              × {it.quantity} unit
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-line/60 pt-4">
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-xs text-ink/60">Estimasi Paket:</span>
                    <span className="font-display text-lg font-bold text-ink">
                      {formatRupiah(totalPerHari)}{" "}
                      <span className="text-xs font-normal text-ink/50">/hari</span>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const items = packageItems.filter((it) => it.package_id === pkg.id);
                        if (items.length === 0) {
                          alert("Paket ini belum memiliki item alat.");
                          return;
                        }
                        const paketData = items.map((it) => {
                          const matched = gear.find(
                            (g) =>
                              g.id === String(it.gear_id) ||
                              g.name.toLowerCase().includes((it.gear_name || "").toLowerCase())
                          );
                          return {
                            alatId: matched ? matched.id : String(it.gear_id),
                            jumlah: it.quantity || 1,
                          };
                        });
                        window.localStorage.setItem(PAKET_STORAGE_KEY, JSON.stringify(paketData));
                        router.push("/user/kalkulator?paket=1");
                      }}
                      disabled={itemsInPkg.length === 0}
                      className="flex-1 rounded-xl border border-line bg-paper/60 py-2.5 text-xs font-semibold text-ink hover:bg-paper transition-all disabled:opacity-40"
                    >
                      Hitung Biaya
                    </button>
                    <button
                      type="button"
                      onClick={() => onSewaOfficialPackage(pkg.id)}
                      disabled={itemsInPkg.length === 0}
                      className="flex-1 rounded-xl bg-ridge py-2.5 text-xs font-semibold text-fog hover:bg-ink transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
                    >
                      Ajukan Sewa →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
