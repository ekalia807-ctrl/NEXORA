"use client";

import Image from "next/image";
import { normalizeGearImage, slugify } from "@/lib/stores/catalogStore";

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
        <div className="block sm:col-span-2 lg:col-span-3 rounded-2xl border border-line bg-paper/40 p-4">
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-line/60">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/75">
              Foto Alat (Unggah Berkas / URL Gambar)
            </span>
            {form.image_url && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-xs font-medium text-alert hover:underline flex items-center gap-1"
              >
                ✕ Hapus Foto
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-4 items-center">
            {/* Preview Box & Click-to-upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`group relative h-28 w-28 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed ${
                form.image_url ? "border-ridge/60 bg-white" : "border-line bg-white/70 hover:border-ridge/70"
              } flex flex-col items-center justify-center transition-all shadow-xs`}
              title="Klik untuk memilih foto dari komputer"
            >
              {form.image_url ? (
                <>
                  <Image
                    src={normalizeGearImage(form.image_url)}
                    alt="Preview Foto Alat"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-fog">
                    Ganti Foto
                  </div>
                </>
              ) : (
                <div className="text-center p-2">
                  <span className="text-2xl block mb-1">📷</span>
                  <span className="text-[11px] font-medium text-ink/60 leading-tight block">
                    Pilih Foto
                  </span>
                </div>
              )}

              {uploadingImage && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                  <span className="text-xs font-semibold text-ridge animate-pulse">
                    Mengunggah...
                  </span>
                </div>
              )}
            </div>

            {/* Upload Action Button & Direct URL */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleImageFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl bg-ridge px-4 py-2 text-xs font-semibold text-fog hover:bg-ink transition-colors shadow-xs disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  <span>{uploadingImage ? "Mengunggah..." : form.image_url ? "Ganti Foto dari Perangkat" : "Pilih & Upload Gambar"}</span>
                </button>

                <span className="text-xs text-ink/50">
                  Format: JPG, PNG, WEBP (Maks 5MB)
                </span>
              </div>

              {/* Manual URL Input */}
              <div>
                <label className="text-[11px] font-medium text-ink/60 block mb-1">
                  Atau masukkan URL gambar langsung (image_url):
                </label>
                <input
                  type="text"
                  placeholder="https://... atau /uploads/gambar.jpg"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-xs text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

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
