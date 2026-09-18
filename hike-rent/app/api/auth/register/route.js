import { NextResponse } from "next/server";
import { authRegister } from "@/services/gateway/auth";

/**
 * POST /api/auth/register
 * Pendaftaran akun baru pengguna.
 */
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Bad Request", message: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const data = await authRegister({ name, email, password });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Registrasi gagal", message: err.message },
      { status: err.status || 400 }
    );
  }
}
