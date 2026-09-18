import { NextResponse } from "next/server";
import { getRentalById, updateRental, deleteRental } from "@/services/gateway/rentals";
import { cookies } from "next/headers";

/**
 * GET /api/rentals/[id]
 * Mengambil detail satu transaksi sewa berdasarkan ID.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await getRentalById(id, token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Rental tidak ditemukan", message: err.message },
      { status: err.status || 404 }
    );
  }
}

/**
 * PUT /api/rentals/[id]
 * Memperbarui status transaksi rental (Admin).
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();
    const data = await updateRental(id, body, token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memperbarui transaksi rental", message: err.message },
      { status: err.status || 500 }
    );
  }
}

/**
 * DELETE /api/rentals/[id]
 * Menghapus transaksi rental berdasarkan ID (Admin).
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await deleteRental(id, token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghapus transaksi rental", message: err.message },
      { status: err.status || 500 }
    );
  }
}
