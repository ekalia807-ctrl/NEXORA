import { apiFetch } from "./client";

/**
 * GET /hikerent/rental_items
 * Mengambil daftar seluruh detail rental items.
 */
export async function getRentalItems(token) {
  return await apiFetch("/rental_items", { token, cache: "no-store" });
}

/**
 * GET /hikerent/rental_items/{id}
 * Mengambil detail single detail rental item berdasarkan ID.
 */
export async function getRentalItemById(id, token) {
  return await apiFetch(`/rental_items/${id}`, { token, cache: "no-store" });
}

/**
 * POST /hikerent/rental_items
 * Membuat data baru detail rental item.
 */
export async function createRentalItem(itemData, token) {
  return await apiFetch("/rental_items", {
    method: "POST",
    token,
    body: JSON.stringify(itemData),
  });
}

/**
 * PUT /hikerent/rental_items/{id}
 * Memperbarui data detail rental item berdasarkan ID.
 */
export async function updateRentalItem(id, itemData, token) {
  return await apiFetch(`/rental_items/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(itemData),
  });
}

/**
 * DELETE /hikerent/rental_items/{id}
 * Menghapus data detail rental item berdasarkan ID.
 */
export async function deleteRentalItem(id, token) {
  return await apiFetch(`/rental_items/${id}`, {
    method: "DELETE",
    token,
  });
}
