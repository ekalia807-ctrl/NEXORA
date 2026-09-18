import { NextResponse } from "next/server";
import { getCategories, createCategory } from "@/services/gateway/categories";
import { cookies } from "next/headers";

/**
 * GET /api/categories
 * Mengambil seluruh daftar kategori alat.
 */
export async function GET() {
  try {
    const data = await getCategories();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil kategori", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Membuat kategori baru (Admin).
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'name' wajib diisi." },
        { status: 400 }
      );
    }

    const data = await createCategory(body, token);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal membuat kategori", message: err.message },
      { status: err.status || 500 }
    );
  }
}
