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
    <div className="space-y-8">
      {/* Header */}
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Kelola Paket Bundling Pendakian
            </h1>
            <p className="mt-1 text-sm text-ink/65">
              Kelola paket hemat rombongan yang tersimpan di basis data backend HMIF UNRAM.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="rounded border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:border-ridge transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {toast && (
        <div
          className={`rounded border p-3 text-xs flex items-center justify-between ${
            toast.type === "success"
              ? "border-moss/40 bg-moss/10 text-moss font-semibold"
              : "border-alert/40 bg-alert/10 text-alert"
          }`}
        >
          <span>{toast.text}</span>
          <button type="button" onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Grid: Form Buat Paket & List Paket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Buat Paket Baru */}
        <div className="border border-line bg-white/40 p-6">
          <h2 className="font-display text-lg font-bold text-ink mb-4">
            + Tambah Paket Baru
          </h2>
          <form onSubmit={handleCreatePackage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink/70">Nama Paket</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Paket Lengkap Rinjani 4P"
                className="mt-1 w-full border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-ridge"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink/70">Target Rombongan</label>
              <input
                type="text"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                placeholder="Contoh: 4 Orang / Solo"
                className="mt-1 w-full border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-ridge"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink/70">Deskripsi Paket</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Rincian peruntukan jalur dan perlengkapan..."
                className="mt-1 w-full border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-ridge"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-sm bg-ridge py-2 text-xs font-medium text-fog hover:bg-ink transition-colors shadow-sm"
            >
              Simpan Paket ke Database
            </button>
          </form>
        </div>

        {/* Daftar Paket Aktif */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-lg font-bold text-ink">
            Daftar Paket di Database ({packages.length})
          </h2>

          {loading ? (
            <div className="border border-line bg-white/40 p-8 text-center text-xs text-ink/50">
              Memuat data paket...
            </div>
          ) : packages.length === 0 ? (
            <div className="border border-line bg-white/40 p-8 text-center text-xs text-ink/50">
              Belum ada paket pendakian. Tambahkan paket pertama di samping.
            </div>
          ) : (
            packages.map((pkg) => {
              const itemsInPkg = packageItems.filter((it) => it.package_id === pkg.id);

              return (
                <div key={pkg.id} className="border border-line bg-white/40 p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-ink/50">#{pkg.id}</span>
                        <h3 className="font-display text-base font-bold text-ink">{pkg.name}</h3>
                        {pkg.target && (
                          <span className="rounded-full bg-ridge px-2 py-0.5 font-mono text-[10px] text-fog">
                            {pkg.target}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-ink/65">{pkg.description || "Tidak ada deskripsi."}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPkgId(selectedPkgId === pkg.id ? null : pkg.id)}
                        className="rounded border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink hover:border-ridge transition-colors"
                      >
                        {selectedPkgId === pkg.id ? "Tutup Kelola" : "+ Tambah Alat"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="rounded border border-alert/30 px-2.5 py-1 text-xs font-medium text-alert hover:bg-alert/10 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  {/* Form Tambah Item jika paket dipilih */}
                  {selectedPkgId === pkg.id && (
                    <form onSubmit={handleAddItem} className="mt-4 border-t border-line pt-4 flex flex-wrap items-end gap-3 bg-paper/50 p-3 rounded">
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-[11px] font-semibold text-ink/70">Pilih Alat</label>
                        <select
                          value={itemForm.gear_id}
                          onChange={(e) => setItemForm({ ...itemForm, gear_id: e.target.value })}
                          className="mt-1 w-full border border-line bg-white px-2 py-1.5 text-xs text-ink outline-none"
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
                        <label className="block text-[11px] font-semibold text-ink/70">Jumlah</label>
                        <input
                          type="number"
                          min={1}
                          value={itemForm.quantity}
                          onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                          className="mt-1 w-full border border-line bg-white px-2 py-1.5 text-xs text-ink outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="rounded-sm bg-ridge px-3 py-1.5 text-xs font-medium text-fog hover:bg-ink"
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
                        Belum ada alat di paket ini. Klik &quot;+ Tambah Alat&quot; untuk memasukkan alat.
                      </p>
                    ) : (
                      <ul className="mt-2 divide-y divide-line/40 text-xs">
                        {itemsInPkg.map((it) => (
                          <li key={it.id} className="py-1.5 flex items-center justify-between">
                            <span className="font-medium text-ink">
                              • {it.gear_name || `Alat #${it.gear_id}`} × {it.quantity} unit
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(it.id)}
                              className="text-[11px] text-alert hover:underline"
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
