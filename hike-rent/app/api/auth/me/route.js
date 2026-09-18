import { NextResponse } from "next/server";
import { authMe } from "@/services/gateway/auth";
import { cookies } from "next/headers";

/**
 * GET /api/auth/me
 * Mengambil profil akun yang sedang login berdasarkan JWT.
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Token sesi tidak ditemukan." },
        { status: 401 }
      );
    }

    const data = await authMe(token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memverifikasi sesi", message: err.message },
      { status: err.status || 401 }
    );
  }
}
