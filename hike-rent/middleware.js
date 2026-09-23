import { NextResponse } from "next/server";
import { decryptData } from "@/lib/crypto";

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  const sessionToken = request.cookies.get("session_token")?.value;
  const encryptedUser = request.cookies.get("session_user")?.value;
  const legacyUserProfile = request.cookies.get("user_profile")?.value;

  let user = null;
  if (sessionToken && encryptedUser) {
    user = await decryptData(encryptedUser);
  }

  // Fallback migrasi jika user masih membawa cookie plaintext lama
  if (!user && sessionToken && legacyUserProfile) {
    try {
      user = JSON.parse(legacyUserProfile);
    } catch {}
  }

  const isAuthenticated = Boolean(sessionToken && user);
  const role = user?.role || "user";
  const isAdmin = role === "admin";

  const isAccessingAdmin = pathname.startsWith("/admin");
  const isAccessingUser = pathname.startsWith("/user");
  const isAccessingAuth = pathname === "/login" || pathname === "/register";

  // 1. Proteksi Area Admin (/admin/*)
  if (isAccessingAdmin) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      // Pengguna login tapi bukan admin, arahkan ke dashboard user
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  // 2. Proteksi Area User (/user/*)
  if (isAccessingUser) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Halaman Login & Register: jika sudah login, lempar langsung ke dashboard
  if (isAccessingAuth && isAuthenticated) {
    const targetDashboard = isAdmin ? "/admin/dashboard" : "/user/dashboard";
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/login",
    "/register",
  ],
};
