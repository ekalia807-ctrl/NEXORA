/**
 * lib/crypto.js
 * Modul Kriptografi Terstandarisasi NEXORA (AES-256-GCM)
 *
 * Menggunakan Web Crypto API (W3C standard) yang kompatibel dengan:
 * - Node.js 18+ (Server Actions, API Routes)
 * - Next.js Edge Runtime (Middleware)
 * - Zero external dependency (100% bawaan runtime)
 */

const DEFAULT_SECRET =
  process.env.SESSION_SECRET ||
  "nexora_sec_b94e8a715d2091c6e43f114c0291df18f8e02b78";

/**
 * Mengubah string rahasia menjadi AES-GCM CryptoKey 256-bit via SHA-256
 */
async function deriveKey(secret = DEFAULT_SECRET) {
  const enc = new TextEncoder();
  const keyBuffer = enc.encode(String(secret || DEFAULT_SECRET));
  const hash = await crypto.subtle.digest("SHA-256", keyBuffer);

  return await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Mengonversi Uint8Array ke Base64URL string (aman untuk URL dan Cookie)
 */
function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Mengonversi Base64URL string kembali ke Uint8Array
 */
function base64UrlToBuffer(base64url) {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Mengenkripsi data (string atau objek) menggunakan AES-256-GCM
 *
 * @param {string|object} data - Data yang ingin dienkripsi
 * @param {string} [customSecret] - Kunci rahasia kustom (opsional)
 * @returns {Promise<string>} Ciphertext dalam format Base64URL
 */
export async function encryptData(data, customSecret) {
  if (data === undefined || data === null) return "";

  const key = await deriveKey(customSecret);
  const enc = new TextEncoder();

  // Serialisasi data jika berupa objek atau tipe non-string
  const payloadString =
    typeof data === "object" ? JSON.stringify(data) : String(data);
  const payloadBytes = enc.encode(payloadString);

  // Generate 12 bytes (96-bit) IV acak per enkripsi
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Enkripsi dengan AES-GCM (otomatis menghasilkan Auth Tag 128-bit di akhir ciphertext)
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    payloadBytes
  );

  // Gabungkan IV (12 bytes) + Ciphertext + Auth Tag
  const combined = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertextBuffer), iv.length);

  return bufferToBase64Url(combined);
}

/**
 * Mendekripsi data terenkripsi AES-256-GCM
 * Memverifikasi integritas data secara otomatis (Auth Tag check).
 * Jika ada byte yang diubah atau dipalsukan, fungsi akan mengembalikan null (tamper-proof).
 *
 * @param {string} cipherString - Base64URL string dari encryptData
 * @param {string} [customSecret] - Kunci rahasia kustom (opsional)
 * @returns {Promise<any|null>} Data hasil dekripsi (objek/string) atau null jika gagal/dipalsukan
 */
export async function decryptData(cipherString, customSecret) {
  if (!cipherString || typeof cipherString !== "string") return null;

  try {
    const key = await deriveKey(customSecret);
    const combined = base64UrlToBuffer(cipherString);

    if (combined.length < 12 + 16) {
      // Panjang minimal: 12 bytes IV + 16 bytes GCM Auth Tag
      return null;
    }

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    const decryptedString = dec.decode(decryptedBuffer);

    // Coba parse jika formatnya JSON
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (err) {
    // Autentikasi tag gagal (data telah dimodifikasi atau kunci salah)
    return null;
  }
}

/**
 * Menghasilkan hash SHA-256 untuk hashing satu arah (misal masking/fingerprint)
 */
export async function hashString(str) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(String(str || "")));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Menyembunyikan/menyensor data sensitif untuk tampilan UI (misal: "0812****7890")
 */
export function maskSensitive(str, startVisible = 3, endVisible = 3) {
  if (!str) return "";
  const s = String(str);
  if (s.length <= startVisible + endVisible) return "***";
  const start = s.slice(0, startVisible);
  const end = s.slice(-endVisible);
  const masked = "*".repeat(Math.max(4, s.length - startVisible - endVisible));
  return `${start}${masked}${end}`;
}

/**
 * Helper khusus untuk mengenkripsi kolom data penting tunggal (misal: Nomor KTP, No HP darurat)
 */
export async function encryptField(value) {
  if (!value) return "";
  return await encryptData(String(value));
}

/**
 * Helper khusus untuk mendekripsi kolom data penting tunggal
 */
export async function decryptField(encryptedValue) {
  if (!encryptedValue) return "";
  const res = await decryptData(encryptedValue);
  return res !== null ? String(res) : "";
}

