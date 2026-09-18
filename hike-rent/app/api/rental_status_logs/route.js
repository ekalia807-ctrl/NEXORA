import { NextResponse } from "next/server";
import { getRentalStatusLogs, createRentalStatusLog } from "@/services/gateway/rentalStatusLogs";
import { cookies } from "next/headers";

/**
 * GET /api/rental_status_logs
 * Mengambil daftar seluruh status history logs dari backend HMIF UNRAM.
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await getRentalStatusLogs(token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil status history logs", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rental_status_logs
 * Membuat entri riwayat transisi status rental baru.
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();

    if (!body.rental_id) {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'rental_id' wajib diisi." },
        { status: 400 }
      );
    }

    const payload = {
      rental_id: Number(body.rental_id),
      status: body.status || "diajukan",
      notes: body.notes || `Status diubah menjadi ${body.status}`,
      changed_by: body.changed_by || "Admin",
    };

    const created = await createRentalStatusLog(payload, token);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal membuat status history log", message: err.message },
      { status: err.message?.includes("401") ? 401 : 500 }
    );
  }
}
