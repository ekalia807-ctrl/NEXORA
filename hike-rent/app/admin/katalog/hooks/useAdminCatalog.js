"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  useCatalogSync,
  syncCatalogFromBackend,
  slugify,
} from "@/lib/stores/catalogStore";
import { uploadGearImageAction } from "@/app/actions/gear";
import {
  stockOptions,
  fallbackCategories,
  emptyForm,
} from "../constants/catalogConstants";
import {
  submitCatalogItem,
  deleteCatalogItemWithBackend,
} from "../utils/catalogMutations";

export { stockOptions, fallbackCategories, emptyForm };

export function useAdminCatalog() {
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
      const localPreviewUrl = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, image_url: localPreviewUrl }));

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

    try {
      const toastResult = await submitCatalogItem({
        form,
        editingId,
        gear,
        activeCategories,
      });
      closeForm();
      if (toastResult) setToast(toastResult);
    } catch (err) {
      setToast({
        type: "error",
        text: `Gagal menyimpan alat: ${err.message}`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setConfirmDeleteId(null);
    try {
      const toastResult = await deleteCatalogItemWithBackend(id, gear);
      if (toastResult) setToast(toastResult);
    } catch (err) {
      setToast({
        type: "error",
        text: `Gagal menghapus alat: ${err.message}`,
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

  return {
    gear,
    form,
    setForm,
    editingId,
    confirmDeleteId,
    setConfirmDeleteId,
    showForm,
    toast,
    setToast,
    syncing,
    submitting,
    searchQuery,
    setSearchQuery,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    uploadingImage,
    fileInputRef,
    activeCategories,
    stockOptions,
    filteredGear,
    openAddForm,
    openEditForm,
    closeForm,
    handleNameChange,
    handleStockNumberChange,
    handleImageFileSelect,
    handleRemoveImage,
    handleManualSync,
    handleSubmit,
    handleDelete,
  };
}
