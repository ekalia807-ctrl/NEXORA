"use client";

import { slugify } from "@/lib/stores/catalogStore";
import GearImageField from "./GearImageField";

export default function GearFormModal({
  showForm,
  form,
  setForm,
  editingId,
  submitting,
  uploadingImage,
  fileInputRef,
  activeCategories,
  stockOptions,
  handleNameChange,
  handleStockNumberChange,
  handleImageFileSelect,
  handleRemoveImage,
  handleSubmit,
  closeForm,
}) {
  if (!showForm) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-white/80 p-5 sm:p-6 lg:p-8 shadow-sm backdrop-blur-md space-y-6"
    >
      <div className="border-b border-line/60 pb-3 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            {editingId ? "Ubah Data Alat di Database" : "Tambah Item Alat Baru ke Database Backend"}
          </h2>
          <p className="text-xs text-ink/60 mt-0.5">
            Mengisi seluruh 11 kolom atribut tabel <code className="font-mono font-semibold">hikerent/gear</code>.
          </p>
        </div>
        <span className="rounded-full bg-paper px-3 py-1 font-mono text-xs font-semibold text-ink/60 border border-line">
          {editingId ? `ID: #${editingId}` : "Alat Baru"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. Nama Alat */}
        <label className="block sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Nama Alat <span className="text-alert">*</span>
          </span>
          <input
            type="text"
            required
            placeholder="Contoh: Tenda Dome 4 Orang"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          />
        </label>

        {/* 2. Slug URL */}
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Slug URL <span className="text-alert">*</span>
          </span>
          <input
            type="text"
            required
            placeholder="tenda-dome-4-orang"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm font-mono text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          />
        </label>

        {/* 3. Kategori (category_id) */}
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Kategori Alat <span className="text-alert">*</span>
          </span>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10 font-medium"
          >
            {activeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (category_id: {c.id})
              </option>
            ))}
          </select>
        </label>

        {/* 4. Harga Sewa Per Hari */}
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Harga Sewa / Hari (Rp) <span className="text-alert">*</span>
          </span>
          <input
            type="number"
            min="0"
            step="1000"
            required
            placeholder="50000"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10 font-mono font-semibold"
          />
        </label>

        {/* 5. Satuan Sewa */}
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Satuan Sewa
          </span>
          <input
            type="text"
            placeholder="per hari / per malam"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          />
        </label>

        {/* 6. Total Stok Fisik */}
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Total Stok Fisik <span className="text-alert">*</span>
          </span>
          <input
            type="number"
            min="0"
            required
            value={form.total_stock}
            onChange={(e) => handleStockNumberChange("total_stock", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10 font-mono font-semibold"
          />
        </label>

        {/* 7. Stok Siap Sewa (Available Stock) */}
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Stok Siap Sewa (Tersedia) <span className="text-alert">*</span>
          </span>
          <input
            type="number"
            min="0"
            max={form.total_stock}
            required
            value={form.available_stock}
            onChange={(e) => handleStockNumberChange("available_stock", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10 font-mono font-semibold"
          />
        </label>

        {/* 8. Status Stok (Enum) */}
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Status Ketersediaan (Enum) <span className="text-alert">*</span>
          </span>
          <select
            value={form.stock_status}
            onChange={(e) => setForm({ ...form, stock_status: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10 font-medium"
          >
            {stockOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {/* 9. Upload & URL Foto Alat + Live Preview */}
        <GearImageField
          form={form}
          setForm={setForm}
          uploadingImage={uploadingImage}
          fileInputRef={fileInputRef}
          handleImageFileSelect={handleImageFileSelect}
          handleRemoveImage={handleRemoveImage}
        />

        {/* 10. Catatan Alat */}
        <label className="block sm:col-span-2 lg:col-span-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            Catatan / Deskripsi Kondisi Alat (note)
          </span>
          <textarea
            rows={2}
            placeholder="Catatan kondisi fisik alat, kelengkapan pasak, tali, dsb."
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          />
        </label>
      </div>

      <div className="flex gap-3 pt-2 border-t border-line/60">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-ridge px-6 py-2.5 text-sm font-semibold text-fog hover:bg-ink shadow-sm transition-all disabled:opacity-50"
        >
          {submitting
            ? "Menyimpan ke Backend..."
            : editingId
            ? "Simpan Perubahan ke Database"
            : "Simpan Alat ke Database"}
        </button>
        <button
          type="button"
          onClick={closeForm}
          className="rounded-xl border border-line bg-white/70 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-white transition-all"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
