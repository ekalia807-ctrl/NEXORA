import { NextResponse } from "next/server";
import { authLogout } from "@/services/gateway/auth";
import { cookies } from "next/headers";

/**
 * POST /api/auth/logout
 * Mengakhiri sesi JWT di server gateway.
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const data = await authLogout(token);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Logout gagal", message: err.message },
      { status: 500 }
    );
  }
}
