"use client";

import { useState } from "react";
import {
  useCatalog,
  categories,
  stockLabel,
  addCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
} from "@/lib/catalogStore";

const categoryOptions = categories.filter((c) => c !== "Semua");
const stockOptions = Object.keys(stockLabel); // hijau, kuning, merah

const emptyForm = {
  name: "",
  category: categoryOptions[0],
  price: "",
  unit: "per hari",
  stock: "hijau",
  provider: "",
  note: "",
};

export default function AdminCatalogPage() {
  const gear = useCatalog();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function openAddForm() {
    setForm(emptyForm);
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

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price) || 0 };

    if (editingId) {
      updateCatalogItem(editingId, payload);
    } else {
      addCatalogItem(payload);
    }
    closeForm();
  }

  function handleDelete(id) {
    deleteCatalogItem(id);
    setConfirmDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-white/40 p-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Katalog Alat</h1>
          <p className="mt-1 text-sm text-ink/65">
            Tambah, ubah, atau hapus alat yang tersedia untuk disewa. Perubahan langsung
            tampil di halaman katalog peminjam.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="shrink-0 rounded-sm bg-ridge px-4 py-2.5 text-sm font-medium text-fog hover:bg-ink transition-colors"
        >
          + Tambah Alat
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 border border-line bg-white/40 p-6 sm:grid-cols-2"
        >
          <h2 className="font-display text-lg font-semibold text-ink sm:col-span-2">
            {editingId ? "Ubah Alat" : "Tambah Alat Baru"}
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
            <span className="text-sm text-ink/70">Harga (Rp)</span>
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
            <span className="text-sm text-ink/70">Penyedia</span>
            <input
              type="text"
              required
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm text-ink/70">Catatan</span>
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
              className="rounded-sm bg-ridge px-5 py-2.5 text-sm font-medium text-fog hover:bg-ink transition-colors"
            >
              {editingId ? "Simpan Perubahan" : "Tambah Alat"}
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
                  <div className="font-medium text-ink">{item.name}</div>
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
