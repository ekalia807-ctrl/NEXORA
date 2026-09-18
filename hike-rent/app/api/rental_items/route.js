import { NextResponse } from "next/server";
import { getRentalItems, createRentalItem } from "@/services/gateway/rentalItems";
import { cookies } from "next/headers";

/**
 * GET /api/rental_items
 * Mengambil daftar seluruh detail rental items.
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await getRentalItems(token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil rental items", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rental_items
 * Menambahkan detail alat ke dalam transaksi rental.
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();

    if (!body.rental_id || !body.gear_id || !body.quantity) {
      return NextResponse.json(
        { error: "Bad Request", message: "Field rental_id, gear_id, dan quantity wajib diisi." },
        { status: 400 }
      );
    }

    const data = await createRentalItem(body, token);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menambahkan rental item", message: err.message },
      { status: err.status || 500 }
    );
  }
}
