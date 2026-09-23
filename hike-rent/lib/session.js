import { cookies } from "next/headers";
import { encryptData, decryptData } from "./crypto";

export const SESSION_TOKEN_KEY = "session_token";
export const SESSION_USER_KEY = "session_user";
export const LEGACY_USER_PROFILE_KEY = "user_profile";

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

/**
 * Menyimpan sesi login terenkripsi ke dalam cookie HTTP-Only yang aman
 *
 * @param {object} params
 * @param {string} params.token - Bearer JWT Token dari API Gateway
 * @param {object} params.user - Profil user (id, name, email, role, dsb.)
 * @param {number} [params.maxAge] - Masa berlaku sesi dalam detik (default 7 hari)
 */
export async function saveSession({ token, user, maxAge = DEFAULT_MAX_AGE }) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  // Enkripsi profil pengguna menggunakan AES-256-GCM
  const encryptedUser = await encryptData(user);

  // Simpan token JWT dalam httpOnly cookie
  cookieStore.set(SESSION_TOKEN_KEY, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge,
    path: "/",
  });

  // Simpan data profil terenkripsi dalam httpOnly cookie
  cookieStore.set(SESSION_USER_KEY, encryptedUser, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge,
    path: "/",
  });

  // Hapus cookie user_profile lama yang unencrypted
  cookieStore.set(LEGACY_USER_PROFILE_KEY, "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  cookieStore.delete(LEGACY_USER_PROFILE_KEY);
}

/**
 * Mengambil dan memvalidasi sesi aktif dari cookies terenkripsi
 *
 * @returns {Promise<{ token: string, user: object|null, isAuthenticated: boolean, role: string|null, isAdmin: boolean }>}
 */
export async function getCurrentSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_TOKEN_KEY)?.value || "";
    const encryptedUser = cookieStore.get(SESSION_USER_KEY)?.value;

    if (!token) {
      return { token: "", user: null, isAuthenticated: false, role: null, isAdmin: false };
    }

    let user = null;
    if (encryptedUser) {
      user = await decryptData(encryptedUser);
    }

    // Fallback migrasi jika user masih membawa cookie plaintext lama
    if (!user) {
      const legacyRaw = cookieStore.get(LEGACY_USER_PROFILE_KEY)?.value;
      if (legacyRaw) {
        try {
          user = JSON.parse(legacyRaw);
        } catch {}
      }
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
 * Menghapus seluruh cookies sesi secara bersih dan permanen saat logout
 */
export async function destroySession() {
  const cookieStore = await cookies();
  const clearOptions = {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };

  cookieStore.set(SESSION_TOKEN_KEY, "", clearOptions);
  cookieStore.set(SESSION_USER_KEY, "", clearOptions);
  cookieStore.set(LEGACY_USER_PROFILE_KEY, "", clearOptions);

  cookieStore.delete(SESSION_TOKEN_KEY);
  cookieStore.delete(SESSION_USER_KEY);
  cookieStore.delete(LEGACY_USER_PROFILE_KEY);
}
