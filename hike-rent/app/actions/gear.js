"use server";

import fs from "fs/promises";
import path from "path";
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

/**
 * Upload gambar alat dari admin ke server lokal (public/uploads/)
 */
export async function uploadGearImageAction(formData) {
  try {
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return { success: false, error: "File gambar tidak ditemukan." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Pastikan direktori public/uploads sudah dibuat
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Format nama file aman dengan timestamp unik
    const originalName = file.name || "gear.jpg";
    const ext = path.extname(originalName) || ".jpg";
    const baseClean = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${baseClean}-${Date.now()}${ext.toLowerCase()}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    await fs.writeFile(filePath, buffer);

    const imageUrl = `/uploads/${uniqueFileName}`;
    return { success: true, url: imageUrl };
  } catch (err) {
    return { success: false, error: err.message || "Gagal mengunggah gambar." };
  }
}
