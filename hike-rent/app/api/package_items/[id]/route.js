import { NextResponse } from "next/server";
import {
  getPackageItemById,
  updatePackageItem,
  deletePackageItem,
} from "@/services/gateway/packageItems";
import { cookies } from "next/headers";

/**
 * GET /api/package_items/[id]
 * Mengambil detail single item paket berdasarkan ID.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const data = await getPackageItemById(id);
    if (!data) {
      return NextResponse.json(
        { error: "Not Found", message: `Item paket #${id} tidak ditemukan.` },
        { status: 404 }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil data item paket", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/package_items/[id]
 * Memperbarui data item dalam paket (misal mengubah quantity).
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();
    const updated = await updatePackageItem(id, body, token);
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memperbarui item paket", message: err.message },
      { status: err.message?.includes("401") ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/package_items/[id]
 * Menghapus item alat dari paket pendakian berdasarkan ID.
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const result = await deletePackageItem(id, token);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghapus item dari paket", message: err.message },
      { status: err.message?.includes("401") ? 401 : 500 }
    );
  }
}
