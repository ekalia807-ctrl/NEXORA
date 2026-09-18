import { NextResponse } from "next/server";
import { authKey } from "@/services/gateway/auth";
import { cookies } from "next/headers";

/**
 * GET /api/auth/key
 * Mengambil Akses Key unik kelompok dari basis data backend.
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await authKey(token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil API Key", message: err.message },
      { status: err.status || 500 }
    );
  }
}
