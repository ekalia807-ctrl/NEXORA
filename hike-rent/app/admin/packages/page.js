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
import CreatePackageForm from "./components/CreatePackageForm";
import PackageCardItem from "./components/PackageCardItem";

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
        <CreatePackageForm
          form={form}
          setForm={setForm}
          onSubmit={handleCreatePackage}
        />

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
            packages.map((pkg) => (
              <PackageCardItem
                key={pkg.id}
                pkg={pkg}
                packageItems={packageItems}
                gear={gear}
                isSelected={selectedPkgId === pkg.id}
                onToggleSelect={() => setSelectedPkgId(selectedPkgId === pkg.id ? null : pkg.id)}
                onDeletePackage={handleDeletePackage}
                itemForm={itemForm}
                setItemForm={setItemForm}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
