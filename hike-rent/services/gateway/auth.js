import { apiFetch } from "./client";

/**
 * 1. POST /hikerent/login
 * Autentikasi akun dan login untuk project HikeRent.
 */
export async function authLogin(email, password) {
  return await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
}

/**
 * 2. POST /hikerent/register
 * Mendaftarkan akun baru untuk project HikeRent (publik).
 */
export async function authRegister({ name, email, password }) {
  return await apiFetch("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
    skipApiKey: true,
    cache: "no-store",
  });
}

/**
 * 3. POST /hikerent/logout
 * Mengakhiri sesi JWT dan membatalkan token di server gateway.
 */
export async function authLogout(token) {
  return await apiFetch("/logout", {
    method: "POST",
    token,
    cache: "no-store",
  });
}

/**
 * 4. GET /hikerent/me
 * Memeriksa validitas sesi JWT login dan mengambil profil user aktif.
 */
export async function authMe(token) {
  return await apiFetch("/me", {
    method: "GET",
    token,
    cache: "no-store",
  });
}

/**
 * 5. GET /hikerent/key
 * Mengambil Akses Key (API Key) unik dari database khusus untuk project HikeRent.
 */
export async function authKey(token) {
  return await apiFetch("/key", {
    method: "GET",
    token,
    cache: "no-store",
  });
}
