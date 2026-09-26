"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  useCatalogSync,
  addCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  syncCatalogFromBackend,
  slugify,
  normalizeGearImage,
} from "@/lib/stores/catalogStore";
import { stockLabel } from "@/constants/gearStock";
import {
  createGearAction,
  updateGearAction,
  deleteGearAction,
  uploadGearImageAction,
} from "@/app/actions/gear";

const stockOptions = [
  { value: "hijau", label: "Hijau — Stok Tersedia & Aman" },
  { value: "kuning", label: "Kuning — Stok Terbatas / Menipis" },
  { value: "merah", label: "Merah — Stok Habis / Kosong" },
];

const fallbackCategories = [
  { id: 1, name: "Tenda", slug: "tenda" },
  { id: 2, name: "Carrier", slug: "carrier" },
  { id: 3, name: "Sepatu", slug: "sepatu" },
];

const emptyForm = {
  name: "",
  slug: "",
  category_id: 1,
  price: "",
  unit: "per hari",
  total_stock: 5,
  available_stock: 5,
  stock_status: "hijau",
  image_url: "",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("Semua");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Ambil daftar kategori live dari backend
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.data || data?.value || [];
          if (isMounted && list.length > 0) {
            setBackendCategories(list);
          }
        }
      } catch {
        // Fallback default jika offline
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeCategories = useMemo(() => {
    return backendCategories.length > 0 ? backendCategories : fallbackCategories;
  }, [backendCategories]);

  function openAddForm() {
    const firstCat = activeCategories[0] || fallbackCategories[0];
    setForm({
      ...emptyForm,
      category_id: firstCat?.id || 1,
    });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(item) {
    setForm({
      name: item.name || "",
      slug: item.slug || slugify(item.name || ""),
      category_id: item.categoryId || item.category_id || (activeCategories[0]?.id || 1),
      price: item.price ?? item.price_per_day ?? "",
      unit: item.unit || "per hari",
      total_stock: item.totalStock ?? item.total_stock ?? 5,
      available_stock: item.availableStock ?? item.available_stock ?? 5,
      stock_status: item.stock || item.stock_status || "hijau",
      image_url: item.imageUrl || item.image || item.image_url || "",
      note: item.note || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleNameChange(val) {
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: !editingId ? slugify(val) : prev.slug,
    }));
  }

  async function handleImageFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        type: "error",
        text: "File harus berupa gambar (JPG, PNG, atau WEBP).",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({
        type: "error",
        text: "Ukuran gambar terlalu besar. Maksimal 5 MB.",
      });
      return;
    }

    setUploadingImage(true);

    try {
      // 1. Buat preview lokal langsung
      const localPreviewUrl = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, image_url: localPreviewUrl }));

      // 2. Upload ke server melalui uploadGearImageAction
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadGearImageAction(formData);
      if (res.success && res.url) {
        setForm((prev) => ({ ...prev, image_url: res.url }));
        setToast({
          type: "success",
          text: `Foto "${file.name}" berhasil diunggah!`,
        });
      } else {
        // Fallback jika upload server gagal, konversi ke base64 Data URL
        const reader = new FileReader();
        reader.onload = () => {
          setForm((prev) => ({ ...prev, image_url: reader.result }));
          setToast({
            type: "info",
            text: "Foto berhasil dimuat ke formulir alat.",
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setToast({
        type: "error",
        text: `Gagal mengunggah foto: ${err.message}`,
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleRemoveImage() {
    setForm((prev) => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleStockNumberChange(field, val) {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setForm((prev) => {
      const updated = { ...prev, [field]: num };
      // Jika total_stock berkurang di bawah available_stock, sesuaikan available_stock
      if (field === "total_stock" && prev.available_stock > num) {
        updated.available_stock = num;
      }
      // Smart recommendation untuk warna stock_status
      const targetAvail = field === "available_stock" ? num : updated.available_stock;
      if (targetAvail === 0) {
        updated.stock_status = "merah";
      } else if (targetAvail <= 2) {
        updated.stock_status = "kuning";
      } else {
        updated.stock_status = "hijau";
      }
      return updated;
    });
  }

  async function handleManualSync() {
    setSyncing(true);
    try {
      await syncCatalogFromBackend();
      setToast({
        type: "success",
        text: "Katalog berhasil disinkronkan langsung dengan basis data backend HMIF UNRAM!",
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
    const totalStockNum = Number(form.total_stock) || 0;
    const availStockNum = Number(form.available_stock) || 0;
    const catIdNum = Number(form.category_id) || 1;
    const selectedCategory = activeCategories.find((c) => Number(c.id) === catIdNum);
    const catName = selectedCategory?.name || "Peralatan";

    const backendPayload = {
      category_id: catIdNum,
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      price_per_day: priceNum,
      unit: form.unit?.trim() || "per hari",
      total_stock: totalStockNum,
      available_stock: availStockNum,
      stock_status: form.stock_status || "hijau",
      note: form.note?.trim() || "",
      image_url: form.image_url?.trim() || null,
    };

    const localItem = {
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      price: priceNum,
      price_per_day: priceNum,
      unit: form.unit?.trim() || "per hari",
      categoryId: catIdNum,
      category_id: catIdNum,
      category: catName,
      category_name: catName,
      totalStock: totalStockNum,
      total_stock: totalStockNum,
      availableStock: availStockNum,
      available_stock: availStockNum,
      stock: form.stock_status,
      stock_status: form.stock_status,
      note: form.note?.trim() || "",
      image: form.image_url?.trim() || "",
      imageUrl: form.image_url?.trim() || "",
      image_url: form.image_url?.trim() || "",
    };

    if (editingId) {
      const oldItem = gear.find((g) => g.id === editingId);
      const targetBackendId = oldItem?.backendId || (Number(editingId) || null);

      // Optimistic update lokal
      updateCatalogItem(editingId, localItem);
      closeForm();

      if (targetBackendId) {
        const res = await updateGearAction(targetBackendId, backendPayload);
        if (res.success) {
          setToast({
            type: "success",
            text: `Data alat "${form.name}" berhasil diperbarui di database backend & katalog!`,
          });
        } else {
          setToast({
            type: "info",
            text: `Alat diperbarui di cache lokal. (Server notice: ${res.error || "Sesi admin diperlukan"})`,
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
          text: `Alat "${form.name}" berhasil ditambahkan ke tabel gear database backend!`,
        });
      } else {
        setToast({
          type: "info",
          text: `Alat ditambahkan ke cache lokal. (Server notice: ${res.error || "Sesi admin diperlukan"})`,
        });
      }
    }
    setSubmitting(false);
  }

  async function handleDelete(id) {
    const itemToDelete = gear.find((g) => g.id === id);
    const targetBackendId = itemToDelete?.backendId || (Number(id) || null);

    deleteCatalogItem(id);
    setConfirmDeleteId(null);

    if (targetBackendId) {
      const res = await deleteGearAction(targetBackendId);
      if (res.success) {
        setToast({
          type: "success",
          text: "Alat berhasil dihapus dari tabel gear database backend & katalog.",
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

  // Filter pencarian & kategori
  const filteredGear = useMemo(() => {
    return gear.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.slug && item.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.note && item.note.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategoryFilter === "Semua" ||
        item.category?.toLowerCase() === selectedCategoryFilter.toLowerCase() ||
        String(item.categoryId) === String(selectedCategoryFilter);

      return matchesSearch && matchesCat;
    });
  }, [gear, searchQuery, selectedCategoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header Panel Admin */}
      <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 lg:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
                Panel Admin
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Inventaris Database (hikerent/gear)</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Katalog Peralatan Pendakian
            </h1>
            <p className="mt-1.5 text-sm text-ink/65 max-w-2xl">
              Kelola inventaris peralatan pendakian. Formulir ini terhubung 100% dengan atribut tabel{" "}
              <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs font-semibold text-ridge">
                hikerent/gear
              </code>{" "}
              di basis data backend.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={syncing}
              onClick={handleManualSync}
              className="shrink-0 rounded-xl border border-line bg-white/70 px-4 py-2.5 text-xs font-semibold text-ink shadow-sm hover:border-ridge/40 hover:bg-white transition-all disabled:opacity-50"
            >
              {syncing ? "Menyinkronkan..." : "↻ Sinkronkan Data"}
            </button>
            <button
              type="button"
              onClick={openAddForm}
              className="shrink-0 rounded-xl bg-ridge px-5 py-2.5 text-sm font-semibold text-fog hover:bg-ink shadow-sm transition-all"
            >
              + Tambah Alat Baru
            </button>
          </div>
        </div>

        {/* Baris Filter & Pencarian */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-ink/50">Kategori:</span>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter("Semua")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategoryFilter === "Semua"
                  ? "bg-ridge text-fog shadow-xs"
                  : "bg-paper/70 text-ink/70 hover:bg-paper"
              }`}
            >
              Semua
            </button>
            {activeCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(c.name)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCategoryFilter.toLowerCase() === c.name.toLowerCase()
                    ? "bg-ridge text-fog shadow-xs"
                    : "bg-paper/70 text-ink/70 hover:bg-paper"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="🔍 Cari nama alat atau slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-1.5 text-xs text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
            />
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`rounded-xl border p-4 text-xs font-medium flex items-center justify-between shadow-sm ${
            toast.type === "success"
              ? "border-moss/40 bg-moss/10 text-moss"
              : toast.type === "info"
              ? "border-sky-500/40 bg-sky-500/10 text-sky-800"
              : "border-alert/40 bg-alert/10 text-alert"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <span>
              {toast.type === "success" ? "✓ [Sukses]" : toast.type === "info" ? "ℹ [Info]" : "✕ [Peringatan]"}
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

      {/* Formulir Tambah / Ubah Alat Lengkap dengan Seluruh Atribut DB */}
      {showForm && (
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
      )}

      {/* Tabel Inventaris Terstandar */}
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
    </div>
  );
}
