import crypto from "crypto";

/**
 * lib/utils/crypto.js
 * Enkripsi / Hashing Password Ringkas & Sederhana (SHA-256)
 */

/**
 * Mengenkripsi (hashing satu arah) password agar aman dan tidak bisa dibaca teks aslinya
 * @param {string} password - Kata sandi teks biasa
 * @returns {string} Hash hexadecimal 64 karakter
 */
export function hashPassword(password) {
  if (!password) return "";
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

/**
 * Memeriksa apakah kata sandi yang dimasukkan cocok dengan hash tersimpan
 * @param {string} password - Kata sandi yang diinput
 * @param {string} hashedPassword - Hash yang tersimpan
 * @returns {boolean}
 */
export function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  return hashPassword(password) === hashedPassword;
}
