import { cookies } from "next/headers";

const SESSION_TOKEN_KEY = "session_token";
const SESSION_USER_KEY = "session_user";

/**
 * Menyimpan sesi ke dalam HTTP-Only Cookie yang aman dari pencurian script/XSS
 */
export async function saveSession({ token, user, maxAge = 60 * 60 * 24 * 7 }) {
  const cookieStore = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };

  cookieStore.set(SESSION_TOKEN_KEY, token, opts);
  cookieStore.set(SESSION_USER_KEY, JSON.stringify(user), opts);
}

/**
 * Mengambil data sesi aktif di Server Action
 */
export async function getCurrentSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_TOKEN_KEY)?.value || "";
    const rawUser = cookieStore.get(SESSION_USER_KEY)?.value;

    let user = null;
    if (rawUser) {
      try {
        user = JSON.parse(rawUser);
      } catch {}
    }

    const role = user?.role || "user";
    return {
      token,
      user,
      isAuthenticated: Boolean(token && user),
      role,
      isAdmin: role === "admin",
    };
  } catch {
    return { token: "", user: null, isAuthenticated: false, role: null, isAdmin: false };
  }
}

/**
 * Menghapus sesi saat logout
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_TOKEN_KEY);
  cookieStore.delete(SESSION_USER_KEY);
}
