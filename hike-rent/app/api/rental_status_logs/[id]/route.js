import { NextResponse } from "next/server";
import {
  getRentalStatusLogById,
  updateRentalStatusLog,
  deleteRentalStatusLog,
} from "@/services/gateway/rentalStatusLogs";
import { cookies } from "next/headers";

/**
 * GET /api/rental_status_logs/[id]
 * Mengambil detail single status history log berdasarkan ID.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await getRentalStatusLogById(id, token);
    if (!data) {
      return NextResponse.json(
        { error: "Not Found", message: `Log #${id} tidak ditemukan.` },
        { status: 404 }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil detail status history log", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/rental_status_logs/[id]
 * Memperbarui data status history log berdasarkan ID.
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();
    const updated = await updateRentalStatusLog(id, body, token);
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memperbarui status history log", message: err.message },
      { status: err.message?.includes("401") ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/rental_status_logs/[id]
 * Menghapus data status history log berdasarkan ID.
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const result = await deleteRentalStatusLog(id, token);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghapus status history log", message: err.message },
      { status: err.message?.includes("401") ? 401 : 500 }
    );
  }
}
