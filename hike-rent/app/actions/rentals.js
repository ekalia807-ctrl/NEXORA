"use server";

import {
  getRentals,
  getRentalById,
  createRental,
  updateRental,
  deleteRental,
} from "@/services/gateway/rentals";
import { getCurrentSession } from "@/lib/server/session";
import { createRentalStatusLogAction } from "./rentalStatusLogs";

/**
 * Mengambil daftar seluruh transaksi rental
 */
export async function fetchRentalsAction() {
  try {
    const { token } = await getCurrentSession();
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
    const { token, user } = await getCurrentSession();
    const bearerToken = token || process.env.NEXT_PUBLIC_DEV_TOKEN || "";
    const userId = Number(rentalData.user_id || user?.id || 7);

    // Format status enum sesuai skema backend: "menunggu_verifikasi" | "aktif" | "selesai" | "ditolak"
    let statusEnum = "menunggu_verifikasi";
    if (rentalData.status === "aktif" || rentalData.status === "Disetujui" || rentalData.status === "Diambil") {
      statusEnum = "aktif";
    } else if (rentalData.status === "selesai" || rentalData.status === "Selesai") {
      statusEnum = "selesai";
    } else if (rentalData.status === "ditolak" || rentalData.status === "Ditolak") {
      statusEnum = "ditolak";
    }

    const payload = {
      order_code: rentalData.order_code || `ORD-${Date.now().toString().slice(-6)}`,
      user_id: userId,
      start_date: rentalData.start_date,
      end_date: rentalData.end_date,
      duration_nights: Number(rentalData.duration_nights || rentalData.total_days || 1),
      total_amount: Number(rentalData.total_amount || rentalData.total_price || 0),
      status: statusEnum,
      ktp_snapshot_url: rentalData.ktp_snapshot_url || "",
      notes: rentalData.notes || rentalData.note || "",
    };

    const data = await createRental(payload, bearerToken);

    // Rekam log inisial 'diajukan' ke tabel rental_status_logs
    if (data?.id) {
      try {
        await createRentalStatusLogAction({
          rental_id: data.id,
          step: "diajukan",
          note: `Pengajuan sewa baru: ${payload.notes || "Peralatan pendakian"}`,
          changed_by: userId,
        });
      } catch {}
    }

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
    const { token } = await getCurrentSession();
    const bearerToken = token || process.env.NEXT_PUBLIC_DEV_TOKEN || "";

    // Petakan status ke enum skema backend: "menunggu_verifikasi" | "aktif" | "selesai" | "ditolak"
    let mappedStatus = rentalData.status;
    if (
      mappedStatus === "Disetujui" ||
      mappedStatus === "Diambil" ||
      mappedStatus === "diverifikasi" ||
      mappedStatus === "diambil" ||
      mappedStatus === "aktif"
    ) {
      mappedStatus = "aktif";
    } else if (
      mappedStatus === "Menunggu verifikasi" ||
      mappedStatus === "diajukan" ||
      mappedStatus === "menunggu_verifikasi"
    ) {
      mappedStatus = "menunggu_verifikasi";
    } else if (mappedStatus === "Selesai" || mappedStatus === "dikembalikan" || mappedStatus === "selesai") {
      mappedStatus = "selesai";
    } else if (mappedStatus === "Ditolak" || mappedStatus === "dibatalkan" || mappedStatus === "ditolak") {
      mappedStatus = "ditolak";
    }

    const payload = {
      ...rentalData,
      status: mappedStatus,
      notes: rentalData.notes || rentalData.note || "",
    };

    const data = await updateRental(id, payload, bearerToken);
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
    const { token } = await getCurrentSession();
    const data = await deleteRental(id, token);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
