import { NextResponse } from "next/server";
import { getGearById, updateGear, deleteGear } from "@/services/gateway/gear";
import { cookies } from "next/headers";

/**
 * GET /api/gear/[id]
 * Mengambil detail single gear item berdasarkan ID.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const data = await getGearById(id);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Alat tidak ditemukan", message: err.message },
      { status: err.status || 404 }
    );
  }
}

/**
 * PUT /api/gear/[id]
 * Memperbarui data gear item berdasarkan ID (Admin).
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();
    const data = await updateGear(id, body, token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memperbarui alat", message: err.message },
      { status: err.status || 500 }
    );
  }
}

/**
 * DELETE /api/gear/[id]
 * Menghapus gear item berdasarkan ID (Admin).
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await deleteGear(id, token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghapus alat", message: err.message },
      { status: err.status || 500 }
    );
  }
}
