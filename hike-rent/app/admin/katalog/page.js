"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useCatalogSync,
  addCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  syncCatalogFromBackend,
  slugify,
} from "@/lib/stores/catalogStore";
import {
  categories as defaultCategories,
  stockLabel,
} from "@/constants/gearStock";
import {
  createGearAction,
  updateGearAction,
  deleteGearAction,
} from "@/app/actions/gear";

const stockOptions = Object.keys(stockLabel); // hijau, kuning, merah

const emptyForm = {
  name: "",
  category: "Tenda Camping",
  price: "",
  unit: "per hari",
  stock: "hijau",
  provider: "",
  note: "",
};

export default function AdminCatalogPage() {
  const gear = useCatalogSync();
  const [backendCategories, setBackendCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Ambil daftar kategori live dari backend
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setBackendCategories(data);
          }
        }
      } catch {
        // Fallback hening ke defaultCategories jika offline
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Opsi kategori dinamis gabungan backend & statis
  const categoryOptions = useMemo(() => {
    const set = new Set();
    backendCategories.forEach((c) => {
      if (c.name) set.add(c.name);
    });
    defaultCategories.forEach((c) => {
      if (c !== "Semua") set.add(c);
    });
    return Array.from(set);
  }, [backendCategories]);

  function openAddForm() {
    setForm({
      ...emptyForm,
      category: categoryOptions[0] || "Tenda Camping",
    });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(item) {
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      unit: item.unit,
      stock: item.stock,
      provider: item.provider,
      note: item.note,
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleManualSync() {
    setSyncing(true);
    try {
      await syncCatalogFromBackend();
      setToast({
        type: "success",
        text: "Katalog berhasil disinkronkan dengan basis data backend kampus!",
      });
    } catch (err) {
      setToast({
        type: "error",
        text: `Gagal sinkronisasi: ${err.message}`,
      });
    } finally {
      setSyncing(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const priceNum = Number(form.price) || 0;
    const stockQty =
      form.stock === "hijau" ? 10 : form.stock === "kuning" ? 2 : 0;

    // Tentukan category_id yang sesuai
    let catId = 1;
    const matchedCat = backendCategories.find(
      (c) => c.name.toLowerCase() === form.category.toLowerCase()
    );
    if (matchedCat) {
      catId = matchedCat.id;
    } else if (form.category.toLowerCase().includes("carrier")) {
      catId = 2;
    } else if (
      form.category.toLowerCase().includes("tidur") ||
      form.category.toLowerCase().includes("sleeping")
    ) {
      catId = 3;
    }

    const backendPayload = {
      category_id: catId,
      name: form.name.trim(),
      slug: slugify(form.name),
      price_per_day: priceNum,
      total_stock: stockQty,
      available_stock: stockQty,
      stock_status: form.stock,
      unit: form.unit || "per hari",
      note: form.note || "",
      provider: form.provider || "Basecamp NEXORA",
    };

    if (editingId) {
      const oldItem = gear.find((g) => g.id === editingId);
      const targetBackendId = oldItem?.backendId || (Number(editingId) || null);

      // Optimistic update lokal
      updateCatalogItem(editingId, { ...form, price: priceNum, categoryId: catId });
      closeForm();

      if (targetBackendId) {
        const res = await updateGearAction(targetBackendId, backendPayload);
        if (res.success) {
          setToast({
            type: "success",
            text: `Data alat "${form.name}" berhasil diperbarui di backend & katalog!`,
          });
        } else {
          setToast({
            type: "info",
            text: `Alat diperbarui di cache lokal. (Server notice: ${res.error || "Sesi login admin diperlukan"})`,
          });
        }
      } else {
        setToast({
          type: "success",
          text: `Alat "${form.name}" diperbarui di katalog!`,
        });
      }
    } else {
      // Tambah alat baru
      const localItem = {
        ...form,
        price: priceNum,
        categoryId: catId,
      };
      addCatalogItem(localItem);
      closeForm();

      const res = await createGearAction(backendPayload);
      if (res.success && res.data) {
        const newBackendId = res.data.gear?.id || res.data.id;
        if (newBackendId) {
          updateCatalogItem(localItem.id || slugify(form.name), {
            backendId: newBackendId,
            id: String(newBackendId),
          });
        }
        setToast({
          type: "success",
          text: `Alat "${form.name}" berhasil ditambahkan ke database backend HMIF UNRAM!`,
        });
      } else {
        setToast({
          type: "info",
          text: `Alat ditambahkan ke cache lokal. (Server notice: ${res.error || "Sesi login admin diperlukan"})`,
        });
      }
    }
    setSubmitting(false);
  }

  async function handleDelete(id) {
    const itemToDelete = gear.find((g) => g.id === id);
    const targetBackendId = itemToDelete?.backendId || (Number(id) || null);

    // Hapus dari store lokal seketika
    deleteCatalogItem(id);
    setConfirmDeleteId(null);

    if (targetBackendId) {
      const res = await deleteGearAction(targetBackendId);
      if (res.success) {
        setToast({
          type: "success",
          text: "Alat berhasil dihapus dari basis data backend HMIF UNRAM & katalog.",
        });
      } else {
        setToast({
          type: "info",
          text: `Alat dihapus dari katalog lokal. (Server notice: ${res.error || "Belum terhapus di backend"})`,
        });
      }
    } else {
      setToast({
        type: "success",
        text: "Alat berhasil dihapus dari katalog.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-white/40 p-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-ink">Katalog Alat</h1>
            <span className="rounded-full bg-moss/15 px-2.5 py-0.5 text-[11px] font-semibold text-moss border border-moss/20">
              Live Backend Connected
            </span>
          </div>
          <p className="mt-1 text-sm text-ink/65">
            Kelola inventaris alat pendakian. Perubahan tersinkronisasi langsung ke
            basis data backend HMIF UNRAM dan tampil di halaman peminjam.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={syncing}
            onClick={handleManualSync}
            className="shrink-0 rounded-sm border border-line bg-white/60 px-3.5 py-2.5 text-xs font-medium text-ink hover:border-ridge transition-colors"
          >
            {syncing ? "Menyinkronkan..." : "Sinkronkan Data"}
          </button>
          <button
            type="button"
            onClick={openAddForm}
            className="shrink-0 rounded-sm bg-ridge px-4 py-2.5 text-sm font-medium text-fog hover:bg-ink transition-colors shadow-sm"
          >
            + Tambah Alat
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`rounded border p-3.5 text-xs flex items-center justify-between ${
            toast.type === "success"
              ? "border-moss/40 bg-moss/10 text-moss font-semibold"
              : toast.type === "info"
              ? "border-sky-500/40 bg-sky-500/10 text-sky-800"
              : "border-alert/40 bg-alert/10 text-alert"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {toast.type === "success" ? "[Sukses]" : toast.type === "info" ? "[Info]" : "[Pemberitahuan]"}
            </span>
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="opacity-60 hover:opacity-100 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 border border-line bg-white/40 p-6 sm:grid-cols-2"
        >
          <h2 className="font-display text-lg font-semibold text-ink sm:col-span-2">
            {editingId ? "Ubah Alat" : "Tambah Alat Baru ke Database Backend"}
          </h2>

          <label className="block">
            <span className="text-sm text-ink/70">Nama alat</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </label>

          <label className="block">
            <span className="text-sm text-ink/70">Kategori</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-ink/70">Harga per hari (Rp)</span>
            <input
              type="number"
              min="0"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </label>

          <label className="block">
            <span className="text-sm text-ink/70">Satuan</span>
            <input
              type="text"
              placeholder="per hari / per malam"
              required
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </label>

          <label className="block">
            <span className="text-sm text-ink/70">Status stok</span>
            <select
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            >
              {stockOptions.map((s) => (
                <option key={s} value={s}>{stockLabel[s]}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-ink/70">Penyedia / Basecamp</span>
            <input
              type="text"
              required
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm text-ink/70">Catatan & Kondisi Fisik</span>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </label>

          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-sm bg-ridge px-5 py-2.5 text-sm font-medium text-fog hover:bg-ink transition-colors shadow-sm"
            >
              {submitting
                ? "Menyimpan..."
                : editingId
                ? "Simpan Perubahan ke Database"
                : "Simpan Alat ke Database"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-sm border border-line px-5 py-2.5 text-sm text-ink hover:border-ink/40 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border border-line bg-white/40">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase text-ink/50">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Harga</th>
              <th className="px-4 py-3 font-medium">Stok</th>
              <th className="px-4 py-3 font-medium">Penyedia</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {gear.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{item.name}</span>
                    {item.backendId && (
                      <span className="font-mono text-[10px] rounded bg-ridge/10 px-1.5 py-0.5 text-ridge border border-ridge/20">
                        #{item.backendId}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink/50">{item.note}</div>
                </td>
                <td className="px-4 py-3 text-ink/70">{item.category}</td>
                <td className="px-4 py-3 font-mono text-ink/80">
                  Rp{Number(item.price).toLocaleString("id-ID")}
                  <span className="ml-1 text-xs text-ink/50">{item.unit}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-line px-2.5 py-1 text-xs text-ink/70">
                    {stockLabel[item.stock] || item.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/70">{item.provider}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(item)}
                      className="rounded-sm border border-line px-3 py-1.5 text-xs text-ink hover:border-ink/40 transition-colors"
                    >
                      Ubah
                    </button>
                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-sm bg-alert px-3 py-1.5 text-xs text-fog"
                        >
                          Yakin?
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-sm border border-line px-2 py-1.5 text-xs text-ink/60"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="rounded-sm border border-alert px-3 py-1.5 text-xs text-alert hover:bg-alert hover:text-fog transition-colors"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {gear.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink/50">
                  Belum ada alat di katalog.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

