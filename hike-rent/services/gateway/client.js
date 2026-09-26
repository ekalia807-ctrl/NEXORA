import { cookies } from "next/headers";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://hmif.if.unram.ac.id/api/v2";
export const PROJECT = process.env.NEXT_PUBLIC_PROJECT_ID || "hikerent";
export const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY || "pk_hikerent_da4b2b680ab481f4";

/**
 * Klien HTTP terpusat untuk HMIF UNRAM API Gateway v2
 * Mengotomasi Layer 1 (X-API-Key) dan Layer 2 (Authorization Bearer JWT)
 *
 * @param {string} endpoint - Path endpoint relatif (misal: "/packages")
 * @param {object} options - Opsi fetch (method, body, token, cache, headers)
 * @returns {Promise<any>} Data JSON hasil respons
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}/${PROJECT}${cleanEndpoint}`;

  let bearerToken = options.token || "";
  if (!bearerToken) {
    try {
      const cookieStore = await cookies();
      bearerToken = cookieStore.get("session_token")?.value || "";
    } catch {
      // Dipanggil dari Client Component atau environment tanpa cookie Next.js
    }
  }

  if (!bearerToken && process.env.NEXT_PUBLIC_DEV_TOKEN) {
    bearerToken = process.env.NEXT_PUBLIC_DEV_TOKEN;
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (!options.skipApiKey) {
    headers["X-API-Key"] = API_KEY;
  }

  if (bearerToken) {
    headers["Authorization"] = `Bearer ${bearerToken}`;
  }

  // Bypass Apache HTTP server restrictions that block PUT/PATCH/DELETE with 403 Forbidden
  const rawMethod = (options.method || "GET").toUpperCase();
  let fetchMethod = rawMethod;
  const overrideHeaders = {};

  if (rawMethod === "PUT" || rawMethod === "PATCH" || rawMethod === "DELETE") {
    fetchMethod = "POST";
    overrideHeaders["X-HTTP-Method-Override"] = rawMethod;
  }

  const res = await fetch(url, {
    ...options,
    method: fetchMethod,
    headers: { ...headers, ...overrideHeaders, ...options.headers },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg =
      data.message || data.error || `Request gagal dengan status ${res.status}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}
