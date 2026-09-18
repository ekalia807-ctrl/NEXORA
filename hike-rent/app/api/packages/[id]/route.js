import { NextResponse } from "next/server";
import { getPackageById, updatePackage, deletePackage } from "@/services/gateway/packages";
import { cookies } from "next/headers";

/**
 * GET /api/packages/[id]
 * Mengambil detail single paket pendakian berdasarkan ID.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const data = await getPackageById(id);
    if (!data) {
      return NextResponse.json(
        { error: "Not Found", message: `Paket #${id} tidak ditemukan.` },
        { status: 404 }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil data paket", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/packages/[id]
 * Memperbarui data paket pendakian berdasarkan ID.
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();
    const updated = await updatePackage(id, body, token);
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memperbarui paket pendakian", message: err.message },
      { status: err.message?.includes("401") ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/packages/[id]
 * Menghapus data paket pendakian berdasarkan ID.
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const result = await deletePackage(id, token);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghapus paket pendakian", message: err.message },
      { status: err.message?.includes("401") ? 401 : 500 }
    );
  }
}
