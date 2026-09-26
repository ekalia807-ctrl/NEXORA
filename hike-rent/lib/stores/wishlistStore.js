"use client";

import { useSyncExternalStore } from "react";
import {
  fetchWishlistAction,
  addToWishlistAction,
  removeFromWishlistAction,
} from "@/app/actions/wishlist";

const EVENT_NAME = "wishlist-changed";

/**
 * Mendapatkan identitas unik user aktif agar data wishlist tersimpan terpisah
 * per akun pengguna (tidak tercampur antar akun di browser yang sama).
 */
export function getActiveUserKey() {
  if (typeof window === "undefined") return "guest";
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.id) return `user_${parsed.id}`;
      if (parsed?.email) return `user_${parsed.email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    }
    const role = localStorage.getItem("role");
    if (role) return `role_${role}`;
  } catch {}
  return "guest";
}

function getStorageKey() {
  const userKey = getActiveUserKey();
  return `nexora_wishlist_${userKey}`;
}

function readLocalWishlist() {
  if (typeof window === "undefined") return [];
  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalWishlist(items) {
  if (typeof window === "undefined") return;
  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
  window.dispatchEvent(new Event(EVENT_NAME));
  window.dispatchEvent(new Event("storage"));
}

function subscribe(callback) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  window.addEventListener("role-changed", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener("role-changed", callback);
  };
}

function getSnapshot() {
  return JSON.stringify(readLocalWishlist());
}

function getServerSnapshot() {
  return JSON.stringify([]);
}

/**
 * Hook reaktif untuk membaca daftar wishlist pengguna aktif.
 */
export function useWishlist() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  try {
    return JSON.parse(snapshot);
  } catch {
    return [];
  }
}

/**
 * Cek apakah suatu alat ada dalam wishlist pengguna aktif.
 */
export function isItemInWishlist(gearIdOrName) {
  const current = readLocalWishlist();
  const searchId = String(gearIdOrName || "").toLowerCase();
  return current.some(
    (item) =>
      String(item.id).toLowerCase() === searchId ||
      String(item.gear_id).toLowerCase() === searchId ||
      String(item.name || item.gear_name || "").toLowerCase() === searchId
  );
}

/**
 * Tambah alat ke wishlist pengguna aktif.
 */
export async function toggleWishlist(gearItem) {
  if (!gearItem) return { inWishlist: false };
  const current = readLocalWishlist();
  const gearId = String(gearItem.id || gearItem.gear_id);
  const gearName = gearItem.name || gearItem.gear_name || "Alat";

  const existingIndex = current.findIndex(
    (item) =>
      String(item.id) === gearId ||
      String(item.gear_id) === gearId ||
      (item.name && item.name.toLowerCase() === gearName.toLowerCase()) ||
      (item.gear_name && item.gear_name.toLowerCase() === gearName.toLowerCase())
  );

  if (existingIndex >= 0) {
    const removedItem = current[existingIndex];
    const next = current.filter((_, idx) => idx !== existingIndex);
    writeLocalWishlist(next);

    try {
      if (removedItem.backendWishlistId) {
        await removeFromWishlistAction(removedItem.backendWishlistId);
      } else if (removedItem.id) {
        await removeFromWishlistAction(removedItem.id);
      }
    } catch (err) {
      console.warn("Sync wishlist delete deferred:", err.message);
    }

    return { inWishlist: false };
  } else {
    const newItem = {
      id: gearId,
      gear_id: gearItem.backendId || (Number(gearId) ? Number(gearId) : gearId),
      name: gearName,
      gear_name: gearName,
      price: Number(gearItem.price || gearItem.gear_price || 0),
      gear_price: Number(gearItem.price || gearItem.gear_price || 0),
      category: gearItem.category || "Peralatan",
      stock: gearItem.stock || "hijau",
      provider: gearItem.provider || "Basecamp NEXORA",
      image: gearItem.image || gearItem.imageUrl || "",
      gear_image: gearItem.image || gearItem.imageUrl || "",
      created_at: new Date().toISOString(),
    };

    const next = [newItem, ...current];
    writeLocalWishlist(next);

    try {
      const res = await addToWishlistAction(newItem.gear_id);
      if (res?.success && res.data?.id) {
        const updated = readLocalWishlist().map((it) =>
          String(it.id) === gearId ? { ...it, backendWishlistId: res.data.id } : it
        );
        writeLocalWishlist(updated);
      }
    } catch (err) {
      console.warn("Sync wishlist add deferred:", err.message);
    }

    return { inWishlist: true };
  }
}

/**
 * Hapus langsung item dari wishlist berdasarkan ID
 */
export async function removeWishlistItem(gearId) {
  const current = readLocalWishlist();
  const searchId = String(gearId);
  const existing = current.find(
    (item) =>
      String(item.id) === searchId ||
      String(item.gear_id) === searchId ||
      String(item.backendWishlistId) === searchId
  );

  const next = current.filter(
    (item) =>
      String(item.id) !== searchId &&
      String(item.gear_id) !== searchId &&
      String(item.backendWishlistId) !== searchId
  );
  writeLocalWishlist(next);

  if (existing?.backendWishlistId || existing?.id) {
    try {
      await removeFromWishlistAction(existing.backendWishlistId || existing.id);
    } catch (err) {
      console.warn("Delete wishlist deferred:", err.message);
    }
  }
}
