"use server";

import {
  getRentals,
  getRentalById,
  createRental,
  updateRental,
  deleteRental,
} from "@/services/gateway/rentals";
import { cookies } from "next/headers";

async function getSessionAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value || "";
  let user = null;
  const userProfileRaw = cookieStore.get("user_profile")?.value;
  if (userProfileRaw) {
    try {
      user = JSON.parse(userProfileRaw);
    } catch {}
  }
  return { token, user };
}

/**
 * Mengambil daftar seluruh transaksi rental
 */
export async function fetchRentalsAction() {
  try {
    const { token } = await getSessionAuth();
    const data = await getRentals(token);
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Membuat transaksi sewa baru saat checkout
 */
export async function createRentalAction(rentalData) {
  try {
    const { token, user } = await getSessionAuth();
    const payload = {
      user_id: Number(rentalData.user_id || user?.id || 1),
      start_date: rentalData.start_date,
      end_date: rentalData.end_date,
      total_days: Number(rentalData.total_days) || 1,
      total_price: Number(rentalData.total_price) || 0,
      status: rentalData.status || "diajukan",
      ktp_number: rentalData.ktp_number || "",
      note: rentalData.note || "",
    };

    const data = await createRental(payload, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Memperbarui status transaksi rental (Admin)
 */
export async function updateRentalAction(id, rentalData) {
  try {
    const { token } = await getSessionAuth();
    const data = await updateRental(id, rentalData, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Menghapus transaksi rental (Admin)
 */
export async function deleteRentalAction(id) {
  try {
    const { token } = await getSessionAuth();
    const data = await deleteRental(id, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
