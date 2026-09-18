import { NextResponse } from "next/server";
import { getPackages, createPackage } from "@/services/gateway/packages";
import { cookies } from "next/headers";

/**
 * GET /api/packages
 * Mengambil daftar seluruh paket pendakian dari backend HMIF UNRAM.
 */
export async function GET() {
  try {
    const data = await getPackages();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil data paket", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/packages
 * Membuat data paket pendakian baru. Memerlukan autentikasi admin.
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'name' wajib diisi." },
        { status: 400 }
      );
    }

    const created = await createPackage(body, token);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal membuat paket pendakian", message: err.message },
      { status: err.message?.includes("401") ? 401 : 500 }
    );
  }
}
