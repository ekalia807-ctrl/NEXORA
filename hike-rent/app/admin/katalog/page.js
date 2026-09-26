"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  useCatalogSync,
  addCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  syncCatalogFromBackend,
  slugify,
} from "@/lib/stores/catalogStore";
import {
  createGearAction,
  updateGearAction,
  deleteGearAction,
  uploadGearImageAction,
} from "@/app/actions/gear";
import GearFilterHeader from "./components/GearFilterHeader";
import GearFormModal from "./components/GearFormModal";
import GearTable from "./components/GearTable";

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
      if (field === "total_stock" && prev.available_stock > num) {
        updated.available_stock = num;
      }
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
      {/* Header Panel Admin & Filter Bar */}
      <GearFilterHeader
        syncing={syncing}
        handleManualSync={handleManualSync}
        openAddForm={openAddForm}
        activeCategories={activeCategories}
        selectedCategoryFilter={selectedCategoryFilter}
        setSelectedCategoryFilter={setSelectedCategoryFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />


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

      {/* Formulir Tambah / Ubah Alat */}
      <GearFormModal
        showForm={showForm}
        form={form}
        setForm={setForm}
        editingId={editingId}
        submitting={submitting}
        uploadingImage={uploadingImage}
        fileInputRef={fileInputRef}
        activeCategories={activeCategories}
        stockOptions={stockOptions}
        handleNameChange={handleNameChange}
        handleStockNumberChange={handleStockNumberChange}
        handleImageFileSelect={handleImageFileSelect}
        handleRemoveImage={handleRemoveImage}
        handleSubmit={handleSubmit}
        closeForm={closeForm}
      />

      {/* Tabel Inventaris Terstandar */}
      <GearTable
        filteredGear={filteredGear}
        confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId}
        openEditForm={openEditForm}
        handleDelete={handleDelete}
        searchQuery={searchQuery}
        selectedCategoryFilter={selectedCategoryFilter}
      />
    </div>
  );
}
