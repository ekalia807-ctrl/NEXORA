import { apiFetch } from "./client";

/**
 * GET /hikerent/gear
 * Mengambil daftar seluruh gear items (peralatan).
 */
export async function getGear() {
  return await apiFetch("/gear", { cache: "no-store" });
}

/**
 * GET /hikerent/gear/{id}
 * Mengambil detail single gear item berdasarkan ID.
 */
export async function getGearById(id) {
  return await apiFetch(`/gear/${id}`, { cache: "no-store" });
}

/**
 * POST /hikerent/gear
 * Membuat data baru gear item (peralatan).
 */
export async function createGear(gearData, token) {
  return await apiFetch("/gear", {
    method: "POST",
    token,
    body: JSON.stringify(gearData),
  });
}

/**
 * PUT /hikerent/gear/{id}
 * Memperbarui data gear item berdasarkan ID.
 */
export async function updateGear(id, gearData, token) {
  return await apiFetch(`/gear/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(gearData),
  });
}

/**
 * DELETE /hikerent/gear/{id}
 * Menghapus data gear item berdasarkan ID.
 */
export async function deleteGear(id, token) {
  return await apiFetch(`/gear/${id}`, {
    method: "DELETE",
    token,
  });
}
