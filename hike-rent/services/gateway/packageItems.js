import { apiFetch } from "./client";

/**
 * GET /hikerent/package_items
 * Mengambil daftar seluruh item dalam paket.
 */
export async function getPackageItems() {
  return await apiFetch("/package_items", { cache: "no-store" });
}

/**
 * GET /hikerent/package_items/{id}
 * Mengambil detail single item dalam paket berdasarkan ID (dengan fallback adaptif).
 */
export async function getPackageItemById(id) {
  try {
    return await apiFetch(`/package_items/${id}`, { cache: "no-store" });
  } catch (err) {
    try {
      const all = await getPackageItems();
      const found = Array.isArray(all)
        ? all.find((it) => String(it.id) === String(id))
        : null;
      if (found) return found;
    } catch {}
    throw err;
  }
}

/**
 * POST /hikerent/package_items
 * Menyematkan alat katalog ke dalam paket pendakian (Admin).
 */
export async function createPackageItem(itemData, token) {
  return await apiFetch("/package_items", {
    method: "POST",
    token,
    body: JSON.stringify(itemData),
  });
}

/**
 * PUT /hikerent/package_items/{id}
 * Memperbarui data item dalam paket berdasarkan ID (Admin).
 */
export async function updatePackageItem(id, itemData, token) {
  return await apiFetch(`/package_items/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(itemData),
  });
}

/**
 * DELETE /hikerent/package_items/{id}
 * Menghapus data item dalam paket berdasarkan ID (Admin).
 */
export async function deletePackageItem(id, token) {
  return await apiFetch(`/package_items/${id}`, {
    method: "DELETE",
    token,
  });
}
