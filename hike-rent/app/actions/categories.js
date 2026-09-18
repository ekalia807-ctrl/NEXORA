"use server";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/gateway/categories";
import { cookies } from "next/headers";

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value || "";
}

/**
 * Mengambil daftar seluruh kategori
 */
export async function fetchCategoriesAction() {
  try {
    const data = await getCategories();
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Membuat kategori baru (Admin)
 */
export async function createCategoryAction(categoryData) {
  try {
    const token = await getAdminToken();
    const data = await createCategory(categoryData, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Memperbarui kategori (Admin)
 */
export async function updateCategoryAction(id, categoryData) {
  try {
    const token = await getAdminToken();
    const data = await updateCategory(id, categoryData, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menghapus kategori (Admin)
 */
export async function deleteCategoryAction(id) {
  try {
    const token = await getAdminToken();
    const data = await deleteCategory(id, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
