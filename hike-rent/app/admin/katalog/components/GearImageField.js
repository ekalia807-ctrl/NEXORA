"use client";

import Image from "next/image";
import { normalizeGearImage } from "@/lib/stores/catalogStore";

export default function GearImageField({
  form,
  setForm,
  uploadingImage,
  fileInputRef,
  handleImageFileSelect,
  handleRemoveImage,
}) {
  return (
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
  );
}
