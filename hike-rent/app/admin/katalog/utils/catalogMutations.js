import {
  addCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  slugify,
} from "@/lib/stores/catalogStore";
import {
  createGearAction,
  updateGearAction,
  deleteGearAction,
} from "@/app/actions/gear";

export async function submitCatalogItem({
  form,
  editingId,
  gear,
  activeCategories,
}) {
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

    if (targetBackendId) {
      const res = await updateGearAction(targetBackendId, backendPayload);
      if (res.success) {
        return {
          type: "success",
          text: `Data alat "${form.name}" berhasil diperbarui di database backend & katalog!`,
        };
      }
      return {
        type: "info",
        text: `Alat diperbarui di cache lokal. (Server notice: ${res.error || "Sesi admin diperlukan"})`,
      };
    }
    return {
      type: "success",
      text: `Alat "${form.name}" diperbarui di katalog!`,
    };
  }

  // Create new item
  addCatalogItem(localItem);

  const res = await createGearAction(backendPayload);
  if (res.success && res.data) {
    const newBackendId = res.data.gear?.id || res.data.id;
    if (newBackendId) {
      updateCatalogItem(localItem.id || slugify(form.name), {
        backendId: newBackendId,
        id: String(newBackendId),
      });
    }
    return {
      type: "success",
      text: `Alat "${form.name}" berhasil ditambahkan ke tabel gear database backend!`,
    };
  }
  return {
    type: "info",
    text: `Alat ditambahkan ke cache lokal. (Server notice: ${res.error || "Sesi admin diperlukan"})`,
  };
}

export async function deleteCatalogItemWithBackend(id, gear) {
  const itemToDelete = gear.find((g) => g.id === id);
  const targetBackendId = itemToDelete?.backendId || (Number(id) || null);

  deleteCatalogItem(id);

  if (targetBackendId) {
    const res = await deleteGearAction(targetBackendId);
    if (res.success) {
      return {
        type: "success",
        text: "Alat berhasil dihapus dari tabel gear database backend & katalog.",
      };
    }
    return {
      type: "info",
      text: `Alat dihapus dari katalog lokal. (Server notice: ${res.error || "Belum terhapus di backend"})`,
    };
  }
  return {
    type: "success",
    text: "Alat berhasil dihapus dari katalog.",
  };
}
