import { NextResponse } from "next/server";
import { getRentals, createRental } from "@/services/gateway/rentals";
import { cookies } from "next/headers";

/**
 * GET /api/rentals
 * Mengambil daftar transaksi rental.
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await getRentals(token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil data rental", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rentals
 * Membuat transaksi sewa baru saat checkout.
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();

    if (!body.user_id || !body.start_date || !body.end_date) {
      return NextResponse.json(
        { error: "Bad Request", message: "Field user_id, start_date, dan end_date wajib diisi." },
        { status: 400 }
      );
    }

    const data = await createRental(body, token);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal membuat transaksi rental", message: err.message },
      { status: err.status || 500 }
    );
  }
}
