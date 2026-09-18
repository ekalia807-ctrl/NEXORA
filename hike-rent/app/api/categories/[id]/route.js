import { NextResponse } from "next/server";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/services/gateway/categories";
import { cookies } from "next/headers";

/**
 * GET /api/categories/[id]
 * Mengambil detail kategori berdasarkan ID.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const data = await getCategoryById(id);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Kategori tidak ditemukan", message: err.message },
      { status: err.status || 404 }
    );
  }
}

/**
 * PUT /api/categories/[id]
 * Memperbarui data kategori berdasarkan ID (Admin).
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();
    const data = await updateCategory(id, body, token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memperbarui kategori", message: err.message },
      { status: err.status || 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 * Menghapus kategori berdasarkan ID (Admin).
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await deleteCategory(id, token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghapus kategori", message: err.message },
      { status: err.status || 500 }
    );
  }
}
