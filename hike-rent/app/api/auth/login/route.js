import { NextResponse } from "next/server";
import { authLogin } from "@/services/gateway/auth";

/**
 * POST /api/auth/login
 * Autentikasi akun dan mendapatkan token JWT serta API Key.
 */
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Bad Request", message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const data = await authLogin(email, password);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Login gagal", message: err.message },
      { status: err.status || 401 }
    );
  }
}
