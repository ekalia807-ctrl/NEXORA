import { apiFetch } from "./client";

/**
 * GET /hikerent/packages
 * Mengambil daftar seluruh paket pendakian.
 */
export async function getPackages() {
  return await apiFetch("/packages", { cache: "no-store" });
}

/**
 * GET /hikerent/packages/{id}
 * Mengambil detail single paket pendakian berdasarkan ID (dengan fallback adaptif).
 */
export async function getPackageById(id) {
  try {
    return await apiFetch(`/packages/${id}`, { cache: "no-store" });
  } catch (err) {
    try {
      const all = await getPackages();
      const found = Array.isArray(all)
        ? all.find((p) => String(p.id) === String(id))
        : null;
      if (found) return found;
    } catch {}
    throw err;
  }
}

/**
 * POST /hikerent/packages
 * Membuat data baru paket pendakian (Admin).
 */
export async function createPackage(packageData, token) {
  return await apiFetch("/packages", {
    method: "POST",
    token,
    body: JSON.stringify(packageData),
  });
}

/**
 * PUT /hikerent/packages/{id}
 * Memperbarui data paket pendakian berdasarkan ID (Admin).
 */
export async function updatePackage(id, packageData, token) {
  return await apiFetch(`/packages/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(packageData),
  });
}

/**
 * DELETE /hikerent/packages/{id}
 * Menghapus data paket pendakian berdasarkan ID (Admin).
 */
export async function deletePackage(id, token) {
  return await apiFetch(`/packages/${id}`, {
    method: "DELETE",
    token,
  });
}
