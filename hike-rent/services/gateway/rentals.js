import { apiFetch } from "./client";

/**
 * GET /hikerent/rentals
 * Mengambil daftar seluruh transaksi rental hikerent.
 */
export async function getRentals(token) {
  return await apiFetch("/rentals", { token, cache: "no-store" });
}

/**
 * GET /hikerent/rentals/{id}
 * Mengambil detail single transaksi rental hikerent berdasarkan ID.
 */
export async function getRentalById(id, token) {
  return await apiFetch(`/rentals/${id}`, { token, cache: "no-store" });
}

/**
 * POST /hikerent/rentals
 * Membuat data baru transaksi rental hikerent.
 */
export async function createRental(rentalData, token) {
  return await apiFetch("/rentals", {
    method: "POST",
    token,
    body: JSON.stringify(rentalData),
  });
}

/**
 * PUT /hikerent/rentals/{id}
 * Memperbarui data transaksi rental hikerent berdasarkan ID.
 */
export async function updateRental(id, rentalData, token) {
  return await apiFetch(`/rentals/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(rentalData),
  });
}

/**
 * DELETE /hikerent/rentals/{id}
 * Menghapus data transaksi rental hikerent berdasarkan ID.
 */
export async function deleteRental(id, token) {
  return await apiFetch(`/rentals/${id}`, {
    method: "DELETE",
    token,
  });
}
