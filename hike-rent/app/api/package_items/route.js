import { NextResponse } from "next/server";
import { getPackageItems, createPackageItem } from "@/services/gateway/packageItems";
import { cookies } from "next/headers";

/**
 * GET /api/package_items
 * Mengambil seluruh komposisi item dalam paket dari backend HMIF UNRAM.
 */
export async function GET() {
  try {
    const data = await getPackageItems();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil data item paket", message: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/package_items
 * Menambahkan alat ke dalam paket pendakian. Memerlukan autentikasi admin.
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token =
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      cookieStore.get("session_token")?.value;

    const body = await request.json();

    if (!body.package_id || !body.gear_id || !body.quantity) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Field package_id, gear_id, dan quantity wajib diisi.",
        },
        { status: 400 }
      );
    }

    const created = await createPackageItem(
      {
        package_id: Number(body.package_id),
        gear_id: Number(body.gear_id),
        quantity: Number(body.quantity),
      },
      token
    );

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menambahkan item ke dalam paket", message: err.message },
      { status: err.message?.includes("401") ? 401 : 500 }
    );
  }
}
