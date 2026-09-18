"use server";

import {
  getGear,
  getGearById,
  createGear,
  updateGear,
  deleteGear,
} from "@/services/gateway/gear";
import { cookies } from "next/headers";

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value || "";
}

/**
 * Mengambil daftar seluruh gear (peralatan)
 */
export async function fetchGearAction() {
  try {
    const data = await getGear();
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Menambahkan gear baru (Admin)
 */
export async function createGearAction(gearData) {
  try {
    const token = await getAdminToken();
    const data = await createGear(gearData, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Memperbarui data gear (Admin)
 */
export async function updateGearAction(id, gearData) {
  try {
    const token = await getAdminToken();
    const data = await updateGear(id, gearData, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menghapus gear dari katalog (Admin)
 */
export async function deleteGearAction(id) {
  try {
    const token = await getAdminToken();
    const data = await deleteGear(id, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
