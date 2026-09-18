import { apiFetch } from "./client";

/**
 * GET /hikerent/rental_status_logs
 * Mengambil daftar seluruh status history logs (audit trail).
 */
export async function getRentalStatusLogs(token) {
  return await apiFetch("/rental_status_logs", { token, cache: "no-store" });
}

/**
 * GET /hikerent/rental_status_logs/{id}
 * Mengambil detail single status history log berdasarkan ID (dengan fallback adaptif).
 */
export async function getRentalStatusLogById(id, token) {
  try {
    return await apiFetch(`/rental_status_logs/${id}`, { token, cache: "no-store" });
  } catch (err) {
    try {
      const all = await getRentalStatusLogs(token);
      const found = Array.isArray(all)
        ? all.find((l) => String(l.id) === String(id))
        : null;
      if (found) return found;
    } catch {}
    throw err;
  }
}

/**
 * POST /hikerent/rental_status_logs
 * Membuat entri audit riwayat transisi status rental baru.
 */
export async function createRentalStatusLog(logData, token) {
  return await apiFetch("/rental_status_logs", {
    method: "POST",
    token,
    body: JSON.stringify(logData),
  });
}

/**
 * PUT /hikerent/rental_status_logs/{id}
 * Memperbarui catatan riwayat status rental berdasarkan ID.
 */
export async function updateRentalStatusLog(id, logData, token) {
  return await apiFetch(`/rental_status_logs/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(logData),
  });
}

/**
 * DELETE /hikerent/rental_status_logs/{id}
 * Menghapus rekaman log status rental berdasarkan ID.
 */
export async function deleteRentalStatusLog(id, token) {
  return await apiFetch(`/rental_status_logs/${id}`, {
    method: "DELETE",
    token,
  });
}
