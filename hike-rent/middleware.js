import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  const sessionToken = request.cookies.get("session_token")?.value;
  const rawUser = request.cookies.get("session_user")?.value;

  let user = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {}
  }

  const isAuthenticated = Boolean(sessionToken && user);
  const isAdmin = user?.role === "admin";

  // 1. Proteksi Halaman Admin
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/user/katalog", request.url));
    }
  }

  // 2. Proteksi Halaman User
  if (pathname.startsWith("/user")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Jika sudah login, cegah buka halaman login / register lagi
  if ((pathname === "/login" || pathname === "/register") && isAuthenticated) {
    const target = isAdmin ? "/admin/dashboard" : "/user/katalog";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/login", "/register"],
};
