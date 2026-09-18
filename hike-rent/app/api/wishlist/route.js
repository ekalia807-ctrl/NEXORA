import { NextResponse } from "next/server";
import { getWishlist, createWishlist } from "@/services/gateway/wishlist";
import { cookies } from "next/headers";

/**
 * GET /api/wishlist
 * Mengambil daftar seluruh wishlist dari backend HMIF UNRAM.
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await getWishlist(token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil data wishlist", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist
 * Menambahkan alat baru ke daftar wishlist.
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();

    if (!body.user_id || !body.gear_id) {
      return NextResponse.json(
        { error: "Bad Request", message: "Field user_id dan gear_id wajib diisi." },
        { status: 400 }
      );
    }

    const created = await createWishlist(
      {
        user_id: Number(body.user_id),
        gear_id: Number(body.gear_id),
      },
      token
    );

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menambahkan ke wishlist", message: err.message },
      { status: err.message?.includes("401") ? 401 : 500 }
    );
  }
}
