"use server";

import {
  getRentals,
  getRentalById,
  createRental,
  updateRental,
  deleteRental,
} from "@/services/gateway/rentals";
import { createRentalItem } from "@/services/gateway/rentalItems";
import { getCurrentSession } from "@/lib/server/session";
import { createRentalStatusLogAction } from "./rentalStatusLogs";

/**
 * Mengambil daftar seluruh transaksi rental
 */
export async function fetchRentalsAction() {
  try {
    const { token } = await getCurrentSession();
    const bearerToken = token || process.env.NEXT_PUBLIC_DEV_TOKEN || "";
    const list = await getRentals(bearerToken);
    if (!Array.isArray(list)) return { success: false, data: [] };

    // Ambil detail (notes, items) untuk setiap rental secara parallel
    const detailed = await Promise.all(
      list.map(async (r) => {
        try {
          const detail = await getRentalById(r.id, bearerToken);
          return { ...r, ...detail };
        } catch {
          return r;
        }
      })
    );

    return { success: true, data: detailed };
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

    if (data?.id) {
      // 1. Rekam rincian item ke tabel rental_items di database backend
      const itemsToRecord =
        Array.isArray(rentalData.items) && rentalData.items.length > 0
          ? rentalData.items
          : rentalData.gear_id
          ? [
              {
                id: rentalData.gear_id,
                jumlah: rentalData.quantity || 1,
                pricePerHari: rentalData.price_per_day || 0,
                subtotal: rentalData.total_amount || 0,
              },
            ]
          : [];

      if (itemsToRecord.length > 0) {
        await Promise.all(
          itemsToRecord.map(async (it) => {
            try {
              const gearId = Number(it.id || it.gear_id || it.alatId || 1);
              const qty = Number(it.jumlah || it.quantity || it.qty || 1);
              const pricePerDay = Number(it.pricePerHari || it.price_per_day || it.price || 0);
              const subtotal = Number(it.subtotal || (qty * pricePerDay * (payload.duration_nights || 1)));

              await createRentalItem(
                {
                  rental_id: data.id,
                  gear_id: gearId,
                  quantity: qty,
                  price_per_day: pricePerDay,
                  subtotal,
                },
                bearerToken
              );
            } catch (itemErr) {
              console.warn(`[rental_items] Catatan: Gagal simpan item gear ${it.id}:`, itemErr.message);
            }
          })
        );
      }

      // 2. Rekam log inisial 'diajukan' ke tabel rental_status_logs
      try {
        await createRentalStatusLogAction({
          rental_id: data.id,
          step: "diajukan",
          note: `Pengajuan sewa baru: ${payload.notes || "Peralatan pendakian"}`,
          changed_by: userId,
        });
      } catch { }
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

    const allowedKeys = [
      "status",
      "notes",
      "rejection_reason",
      "ktp_snapshot_url",
      "total_amount",
      "duration_nights",
      "start_date",
      "end_date",
    ];
    const payload = {};
    for (const key of allowedKeys) {
      if (rentalData[key] !== undefined) {
        payload[key] = rentalData[key];
      }
    }
    payload.status = mappedStatus;
    if (rentalData.notes !== undefined || rentalData.note !== undefined) {
      payload.notes = rentalData.notes || rentalData.note || "";
    }

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
