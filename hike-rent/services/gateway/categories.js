import { apiFetch } from "./client";

/**
 * GET /hikerent/categories
 * Mengambil daftar seluruh kategori gear.
 */
export async function getCategories() {
  return await apiFetch("/categories", { cache: "no-store" });
}

/**
 * GET /hikerent/categories/{id}
 * Mengambil detail single kategori gear berdasarkan ID.
 */
export async function getCategoryById(id) {
  return await apiFetch(`/categories/${id}`, { cache: "no-store" });
}

/**
 * POST /hikerent/categories
 * Membuat data baru kategori gear.
 */
export async function createCategory({ name, slug }, token) {
  return await apiFetch("/categories", {
    method: "POST",
    token,
    body: JSON.stringify({ name, slug }),
  });
}

/**
 * PUT /hikerent/categories/{id}
 * Memperbarui data kategori gear berdasarkan ID.
 */
export async function updateCategory(id, { name, slug }, token) {
  return await apiFetch(`/categories/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify({ name, slug }),
  });
}

/**
 * DELETE /hikerent/categories/{id}
 * Menghapus data kategori gear berdasarkan ID.
 */
export async function deleteCategory(id, token) {
  return await apiFetch(`/categories/${id}`, {
    method: "DELETE",
    token,
  });
}
