"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchPackagesAction,
  fetchPackageItemsAction,
  createPackageAction,
  deletePackageAction,
  addPackageItemAction,
  removePackageItemAction,
} from "@/app/actions/packages";
import { useCatalogSync } from "@/lib/stores/catalogStore";

export default function AdminPackagesPage() {
  const gear = useCatalogSync();
  const [packages, setPackages] = useState([]);
  const [packageItems, setPackageItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", target: "4 orang" });
  const [selectedPkgId, setSelectedPkgId] = useState(null);
  const [itemForm, setItemForm] = useState({ gear_id: 1, quantity: 1 });
  const [toast, setToast] = useState(null);

  async function loadData() {
    setLoading(true);
    const pRes = await fetchPackagesAction();
    const iRes = await fetchPackageItemsAction();
    if (pRes.success) setPackages(pRes.data);
    if (iRes.success) setPackageItems(iRes.data);
    setLoading(false);
  }

  useEffect(() => {
    let ignore = false;
    async function init() {
      const [pRes, iRes] = await Promise.all([
        fetchPackagesAction(),
        fetchPackageItemsAction(),
      ]);
      if (!ignore) {
        if (pRes.success) setPackages(pRes.data);
        if (iRes.success) setPackageItems(iRes.data);
        setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleCreatePackage(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const res = await createPackageAction(form);
    if (res.success) {
      setToast({ type: "success", text: "Paket pendakian berhasil dibuat!" });
      setForm({ name: "", description: "", target: "4 orang" });
      loadData();
    } else {
      setToast({ type: "error", text: res.error || "Gagal membuat paket." });
    }
  }

  async function handleDeletePackage(id) {
    if (!confirm("Hapus paket ini dari database?")) return;
    const res = await deletePackageAction(id);
    if (res.success) {
      setToast({ type: "success", text: "Paket berhasil dihapus." });
      loadData();
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (!selectedPkgId) return;

    const res = await addPackageItemAction({
      package_id: selectedPkgId,
      gear_id: Number(itemForm.gear_id),
      quantity: Number(itemForm.quantity),
    });

    if (res.success) {
      setToast({ type: "success", text: "Alat berhasil ditambahkan ke dalam paket!" });
      loadData();
    } else {
      setToast({ type: "error", text: res.error || "Gagal menambahkan item." });
    }
  }

  async function handleRemoveItem(itemId) {
    const res = await removePackageItemAction(itemId);
    if (res.success) {
      setToast({ type: "success", text: "Item dikeluarkan dari paket." });
      loadData();
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Standar Admin */}
      <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 lg:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
                Panel Admin
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Bundling & Hemat</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Kelola Paket Bundling Pendakian
            </h1>
            <p className="mt-1.5 text-sm text-ink/65 max-w-2xl">
              Kelola paket hemat rombongan yang tersimpan di basis data backend HMIF UNRAM dan otomatis terhubung ke sistem rekomendasi peminjam.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="rounded-xl border border-line bg-white/70 px-4 py-2 text-xs font-semibold text-ink hover:border-ridge/40 hover:bg-white shadow-sm transition-all"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {toast && (
        <div
          className={`rounded-xl border p-4 text-xs font-medium flex items-center justify-between shadow-sm ${
            toast.type === "success"
              ? "border-moss/40 bg-moss/10 text-moss"
              : "border-alert/40 bg-alert/10 text-alert"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <span>{toast.type === "success" ? "✓ [Sukses]" : "✕ [Gagal]"}</span>
            <span>{toast.text}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Grid: Form Buat Paket & List Paket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Buat Paket Baru */}
        <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 shadow-sm backdrop-blur-md h-fit">
          <div className="border-b border-line/60 pb-3 mb-4">
            <h2 className="font-display text-lg font-bold text-ink">
              + Tambah Paket Baru
            </h2>
            <p className="mt-0.5 text-xs text-ink/55">Simpan bundel baru ke server backend</p>
          </div>
          <form onSubmit={handleCreatePackage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">Nama Paket</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Paket Lengkap Rinjani 4P"
                className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">Target Rombongan</label>
              <input
                type="text"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                placeholder="Contoh: 4 Orang / Solo"
                className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">Deskripsi Paket</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Rincian peruntukan jalur dan perlengkapan..."
                className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-ridge py-2.5 text-sm font-semibold text-fog hover:bg-ink shadow-sm transition-all"
            >
              Simpan Paket ke Database
            </button>
          </form>
        </div>

        {/* Daftar Paket Aktif */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">
              Daftar Paket di Database ({packages.length})
            </h2>
            <span className="font-mono text-xs text-ink/50">Tersinkronisasi</span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-line bg-white/70 p-10 text-center text-sm text-ink/50 font-mono shadow-sm">
              Memuat data paket bundling...
            </div>
          ) : packages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white/50 p-10 text-center text-sm text-ink/60 shadow-sm">
              Belum ada paket pendakian. Tambahkan paket pertama melalui formulir di samping.
            </div>
          ) : (
            packages.map((pkg) => {
              const itemsInPkg = packageItems.filter((it) => it.package_id === pkg.id);

              return (
                <div key={pkg.id} className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 shadow-sm backdrop-blur-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs rounded-md bg-ridge/10 px-1.5 py-0.5 text-ridge border border-ridge/20 font-semibold">
                          #{pkg.id}
                        </span>
                        <h3 className="font-display text-base font-bold text-ink">{pkg.name}</h3>
                        {pkg.target && (
                          <span className="rounded-full bg-amber/20 text-amber px-2.5 py-0.5 font-mono text-[11px] font-semibold">
                            {pkg.target}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-ink/65 leading-relaxed">{pkg.description || "Tidak ada rincian deskripsi."}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedPkgId(selectedPkgId === pkg.id ? null : pkg.id)}
                        className="rounded-lg border border-line bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink hover:border-ridge hover:bg-white shadow-xs transition-all"
                      >
                        {selectedPkgId === pkg.id ? "Tutup Kelola" : "+ Tambah Alat"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="rounded-lg border border-alert/30 px-3 py-1.5 text-xs font-semibold text-alert hover:bg-alert hover:text-fog shadow-xs transition-all"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  {/* Form Tambah Item jika paket dipilih */}
                  {selectedPkgId === pkg.id && (
                    <form onSubmit={handleAddItem} className="mt-4 rounded-xl border border-line/70 bg-paper/60 p-4 flex flex-wrap items-end gap-3 shadow-inner">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">Pilih Alat Inventaris</label>
                        <select
                          value={itemForm.gear_id}
                          onChange={(e) => setItemForm({ ...itemForm, gear_id: e.target.value })}
                          className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-ridge"
                        >
                          {gear.map((g) => {
                            const val = g.backendId || (Number(g.id) ? Number(g.id) : g.id);
                            return (
                              <option key={g.id} value={val}>
                                {g.name} {g.backendId ? `(#${g.backendId})` : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="w-24">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">Jumlah</label>
                        <input
                          type="number"
                          min={1}
                          value={itemForm.quantity}
                          onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                          className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-ridge font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="rounded-xl bg-ridge px-4 py-2 text-xs font-semibold text-fog hover:bg-ink shadow-sm transition-all"
                      >
                        Sematkan
                      </button>
                    </form>
                  )}

                  {/* Rincian Komposisi Alat dalam Paket */}
                  <div className="mt-4 border-t border-line/60 pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">
                      Komposisi Alat dalam Paket ({itemsInPkg.length} Item):
                    </p>
                    {itemsInPkg.length === 0 ? (
                      <p className="mt-1 text-xs text-ink/40 italic">
                        Belum ada alat di paket ini. Klik &quot;+ Tambah Alat&quot; untuk menyematkan peralatan pendakian.
                      </p>
                    ) : (
                      <ul className="mt-2 divide-y divide-line/40 text-xs">
                        {itemsInPkg.map((it) => (
                          <li key={it.id} className="py-2 flex items-center justify-between">
                            <span className="font-medium text-ink flex items-center gap-1.5">
                              <span className="text-amber">●</span>
                              <span>{it.gear_name || `Alat #${it.gear_id}`}</span>
                              <span className="font-mono text-ink/60">× {it.quantity} unit</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(it.id)}
                              className="text-xs font-medium text-alert hover:underline"
                            >
                              Keluarkan
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
