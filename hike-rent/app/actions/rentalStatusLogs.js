"use server";

import {
  getRentalStatusLogs,
  createRentalStatusLog,
} from "@/services/gateway/rentalStatusLogs";
import { getCurrentSession } from "@/lib/server/session";

/**
 * Mengambil seluruh catatan riwayat perubahan status sewa (Audit Trail).
 */
export async function fetchRentalStatusLogsAction(rentalId = null) {
  try {
    const { token } = await getCurrentSession();
    const data = await getRentalStatusLogs(token);
    let list = Array.isArray(data) ? data : [];

    if (rentalId) {
      list = list.filter((item) => String(item.rental_id) === String(rentalId));
    }

    // Normalisasi properti agar kompatibel dengan pembaca status/step & note/notes
    const normalized = list.map((item) => ({
      ...item,
      status: item.step || item.status || "diajukan",
      notes: item.note || item.notes || "",
    }));

    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Mencatat log audit transisi status sewa baru.
 */
export async function createRentalStatusLogAction(logData) {
  try {
    const { token, user } = await getCurrentSession();
    const bearerToken = token || process.env.NEXT_PUBLIC_DEV_TOKEN || "";
    const adminUserId = Number(logData.changed_by) || Number(user?.id || user?.user_id) || 3;

    // Petakan ke enum resmi kolom 'step' pada tabel database rental_status_logs:
    // enum: 'diajukan' | 'diverifikasi' | 'diambil' | 'dikembalikan'
    let stepEnum = logData.step || logData.status || "diajukan";
    const s = String(stepEnum).toLowerCase().trim();
    if (s === "menunggu verifikasi" || s === "menunggu_verifikasi" || s === "diajukan") {
      stepEnum = "diajukan";
    } else if (s === "disetujui" || s === "diverifikasi" || s === "aktif") {
      stepEnum = "diverifikasi";
    } else if (s === "diambil") {
      stepEnum = "diambil";
    } else if (s === "selesai" || s === "dikembalikan") {
      stepEnum = "dikembalikan";
    } else if (s === "ditolak" || s === "dibatalkan") {
      stepEnum = "diverifikasi";
    }

    const noteText =
      logData.note || logData.notes || `Perubahan status transaksi ke ${stepEnum}`;

    // Payload presisi sesuai skema database: rental_id (int), step (enum), note (text), changed_by (int)
    const payload = {
      rental_id: Number(logData.rental_id) || 1,
      step: stepEnum,
      note: noteText,
      changed_by: adminUserId,
    };

    const res = await createRentalStatusLog(payload, bearerToken);
    return { success: true, data: res };
  } catch (err) {
    console.error("Gagal mencatat status log ke server:", err.message);
    return {
      success: false,
      error: err.message,
      data: {
        id: Date.now(),
        rental_id: logData.rental_id,
        step: logData.step || logData.status,
        note: logData.note || logData.notes,
        changed_by: "Admin",
        created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
      },
    };
  }
}
