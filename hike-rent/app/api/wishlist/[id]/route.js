import { NextResponse } from "next/server";
import { getWishlistById, updateWishlist, deleteWishlist } from "@/services/gateway/wishlist";
import { cookies } from "next/headers";

/**
 * GET /api/wishlist/[id]
 * Mengambil detail single wishlist berdasarkan ID.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await getWishlistById(id, token);
    if (!data) {
      return NextResponse.json(
        { error: "Not Found", message: `Wishlist #${id} tidak ditemukan.` },
        { status: 404 }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil detail wishlist", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/wishlist/[id]
 * Memperbarui data wishlist berdasarkan ID.
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();
    const updated = await updateWishlist(id, body, token);
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memperbarui wishlist", message: err.message },
      { status: err.message?.includes("401") ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/wishlist/[id]
 * Menghapus data wishlist berdasarkan ID.
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const result = await deleteWishlist(id, token);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghapus wishlist", message: err.message },
      { status: err.message?.includes("401") ? 401 : 500 }
    );
  }
}
