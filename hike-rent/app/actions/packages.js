"use server";

import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from "@/services/gateway/packages";
import {
  getPackageItems,
  getPackageItemById,
  createPackageItem,
  updatePackageItem,
  deletePackageItem,
} from "@/services/gateway/packageItems";
import { cookies } from "next/headers";

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value || "";
}

/**
 * Mengambil daftar seluruh paket pendakian dari backend
 */
export async function fetchPackagesAction() {
  try {
    const data = await getPackages();
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Mengambil seluruh komposisi item dalam paket dari backend
 */
export async function fetchPackageItemsAction() {
  try {
    const data = await getPackageItems();
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Membuat paket pendakian baru (Admin)
 */
export async function createPackageAction(packageData) {
  try {
    const token = await getAdminToken();
    const data = await createPackage(packageData, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menghapus paket pendakian (Admin)
 */
export async function deletePackageAction(id) {
  try {
    const token = await getAdminToken();
    const data = await deletePackage(id, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menambahkan item alat ke dalam paket (Admin)
 */
export async function addPackageItemAction(itemData) {
  try {
    const token = await getAdminToken();
    const data = await createPackageItem(itemData, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menghapus item dari paket (Admin)
 */
export async function removePackageItemAction(id) {
  try {
    const token = await getAdminToken();
    const data = await deletePackageItem(id, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
