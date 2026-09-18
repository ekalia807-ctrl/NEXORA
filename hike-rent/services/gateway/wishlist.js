import { apiFetch } from "./client";

/**
 * GET /hikerent/wishlist
 * Mengambil daftar seluruh wishlist.
 */
export async function getWishlist(token) {
  return await apiFetch("/wishlist", { token, cache: "no-store" });
}

/**
 * GET /hikerent/wishlist/{id}
 * Mengambil detail single wishlist berdasarkan ID (dengan fallback adaptif).
 */
export async function getWishlistById(id, token) {
  try {
    return await apiFetch(`/wishlist/${id}`, { token, cache: "no-store" });
  } catch (err) {
    try {
      const all = await getWishlist(token);
      const found = Array.isArray(all)
        ? all.find((w) => String(w.id) === String(id))
        : null;
      if (found) return found;
    } catch {}
    throw err;
  }
}

/**
 * POST /hikerent/wishlist
 * Membuat data baru wishlist (menandai alat).
 */
export async function createWishlist(wishlistData, token) {
  return await apiFetch("/wishlist", {
    method: "POST",
    token,
    body: JSON.stringify(wishlistData),
  });
}

/**
 * PUT /hikerent/wishlist/{id}
 * Memperbarui data wishlist berdasarkan ID.
 */
export async function updateWishlist(id, wishlistData, token) {
  return await apiFetch(`/wishlist/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(wishlistData),
  });
}

/**
 * DELETE /hikerent/wishlist/{id}
 * Menghapus data wishlist berdasarkan ID.
 */
export async function deleteWishlist(id, token) {
  return await apiFetch(`/wishlist/${id}`, {
    method: "DELETE",
    token,
  });
}
