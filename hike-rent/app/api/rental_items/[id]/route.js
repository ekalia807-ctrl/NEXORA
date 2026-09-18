import { NextResponse } from "next/server";
import {
  getRentalItemById,
  updateRentalItem,
  deleteRentalItem,
} from "@/services/gateway/rentalItems";
import { cookies } from "next/headers";

/**
 * GET /api/rental_items/[id]
 * Mengambil detail single rental item berdasarkan ID.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await getRentalItemById(id, token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Rental item tidak ditemukan", message: err.message },
      { status: err.status || 404 }
    );
  }
}

/**
 * PUT /api/rental_items/[id]
 * Memperbarui data detail rental item berdasarkan ID (Admin).
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();
    const data = await updateRentalItem(id, body, token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memperbarui rental item", message: err.message },
      { status: err.status || 500 }
    );
  }
}

/**
 * DELETE /api/rental_items/[id]
 * Menghapus rental item berdasarkan ID (Admin).
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await deleteRentalItem(id, token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghapus rental item", message: err.message },
      { status: err.status || 500 }
    );
  }
}
