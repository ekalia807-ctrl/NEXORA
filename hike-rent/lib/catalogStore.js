"use client";

// Store katalog alat, dipakai BERSAMA oleh:
//   - app/admin/katalog (CRUD: tambah/ubah/hapus alat)
//   - app/user/katalog (tampilan alat untuk peminjam)
//   - app/user/kalkulator, rekomendasi, dsb.
//
// Terintegrasi dengan Backend HMIF UNRAM API Gateway v2 (/gear & /categories)
// dengan arsitektur Dual-Sync (Live API + LocalStorage Cache Fallback)
// menggunakan useSyncExternalStore + custom event 'catalog-changed'.

import { useEffect, useSyncExternalStore } from "react";
import {
  gear as seedGear,
  categories as defaultCategories,
  stockLabel,
  stockColor,
  normalizeGearImage,
} from "./gear";

const STORAGE_KEY = "nexora_catalog_v2";
const EVENT_NAME = "catalog-changed";

export function slugify(text) {
  return (
    String(text || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "alat"
  );
}

/**
 * Normalisasi data peralatan dari backend HMIF UNRAM (/hikerent/gear)
 * menjadi format internal katalog NEXORA.
 */
export function normalizeBackendGear(g) {
  if (!g) return null;
  const rawStock =
    g.stock_status ||
    (Number(g.available_stock) > 2
      ? "hijau"
      : Number(g.available_stock) > 0
      ? "kuning"
      : "merah");
  const priceVal = Number(g.price_per_day ?? g.price ?? 0);
  const rawImage =
    g.image_url ?? g.image ?? g.foto ?? g["URL FOTO"] ?? g.url_foto ?? "";
  const image = normalizeGearImage(rawImage);

  return {
    id: String(g.id || g.slug || slugify(g.name)),
    backendId: typeof g.id === "number" ? g.id : Number(g.id) || null,
    categoryId: g.category_id || null,
    category: g.category_name || g.category || "Lainnya",
    name: g.name || "Peralatan",
    slug: g.slug || slugify(g.name || "alat"),
    price: priceVal,
    unit: g.unit || "per hari",
    stock: rawStock,
    totalStock: Number(g.total_stock ?? g.available_stock ?? 5),
    availableStock: Number(g.available_stock ?? g.total_stock ?? 5),
    provider: g.provider || "Basecamp NEXORA",
    note: g.note || g.description || "",
    // TODO: Ganti dengan hitungan asli dari riwayat peminjaman (rentals/rental_items) begitu backend API analitik tersedia.
    timesBorrowed: Number(
      g.times_borrowed ??
      g.timesBorrowed ??
      (Math.abs(String(g.name || g.id || "gear").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 40 + 12)
    ),
    image: image,
    imageUrl: image,
  };
}

function readAll() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      const rawImg = item.image ?? item.imageUrl ?? item.image_url ?? "";
      const normalizedImg = normalizeGearImage(rawImg);
      return {
        ...item,
        // TODO: Ganti dengan hitungan asli dari riwayat peminjaman (rentals/rental_items) begitu backend API analitik tersedia.
        timesBorrowed: Number(
          item.timesBorrowed ??
          (Math.abs(String(item.name || item.id || "gear").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 40 + 12)
        ),
        image: normalizedImg,
        imageUrl: normalizedImg,
      };
    });
  } catch {
    return [];
  }
}

function writeAll(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Penanganan jika kuota localStorage penuh
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function getCatalog() {
  return readAll();
}

export function addCatalogItem(item) {
  const items = readAll();
  let id = item.id ? String(item.id) : slugify(item.name || "alat-baru");

  // Pastikan id unik jika belum unik
  let suffix = 1;
  const existingIds = new Set(items.map((it) => String(it.id)));
  let uniqueId = id;
  while (existingIds.has(uniqueId)) {
    suffix += 1;
    uniqueId = `${id}-${suffix}`;
  }

  const rawImg = item.image ?? item.imageUrl ?? item.image_url ?? "";
  const normalizedImage = normalizeGearImage(rawImg);

  const newItem = {
    ...item,
    id: uniqueId,
    price: Number(item.price) || 0,
    unit: item.unit || "per hari",
    stock: item.stock || "hijau",
    category: item.category || "Lainnya",
    image: normalizedImage,
    imageUrl: normalizedImage,
  };

  const next = [newItem, ...items];
  writeAll(next);
  return next;
}

export function updateCatalogItem(id, patch) {
  const items = readAll();
  const next = items.map((it) => {
    if (
      String(it.id) === String(id) ||
      (it.backendId && String(it.backendId) === String(id))
    ) {
      const updated = {
        ...it,
        ...patch,
        id: it.id,
        price: patch.price !== undefined ? Number(patch.price) : it.price,
      };
      if (
        patch.image !== undefined ||
        patch.imageUrl !== undefined ||
        patch.image_url !== undefined
      ) {
        const rawImg = patch.image ?? patch.imageUrl ?? patch.image_url ?? "";
        const normalizedImg = normalizeGearImage(rawImg);
        updated.image = normalizedImg;
        updated.imageUrl = normalizedImg;
      }
      return updated;
    }
    return it;
  });
  writeAll(next);
  return next;
}

export function deleteCatalogItem(id) {
  const items = readAll();
  const next = items.filter(
    (it) =>
      String(it.id) !== String(id) &&
      !(it.backendId && String(it.backendId) === String(id))
  );
  writeAll(next);
  return next;
}

export async function resetCatalogToDefault() {
  return await syncCatalogFromBackend();
}

// -------------------------------------------------------------
// SINKRONISASI ASINKRON KE BACKEND HMIF UNRAM
// -------------------------------------------------------------
let isSyncing = false;

export async function syncCatalogFromBackend() {
  if (typeof window === "undefined") return readAll();
  if (isSyncing) return readAll();

  isSyncing = true;
  try {
    // Ambil data gear live dari route handler lokal /api/gear
    const res = await fetch("/api/gear", { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} saat sinkronisasi katalog.`);
    }

    const backendData = await res.json();
    if (Array.isArray(backendData)) {
      const normalizedBackend = backendData
        .map(normalizeBackendGear)
        .filter(Boolean);

      // Gunakan data murni dari database backend
      writeAll(normalizedBackend);
      return normalizedBackend;
    }
  } catch (err) {
    console.warn("Sinkronisasi katalog backend fallback ke cache lokal:", err.message);
  } finally {
    isSyncing = false;
  }

  return readAll();
}

function subscribe(callback) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return JSON.stringify(readAll());
}

function getServerSnapshot() {
  return JSON.stringify([]);
}

// Hook reaktif: komponen otomatis re-render setiap kali katalog berubah
export function useCatalog() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return JSON.parse(snapshot);
}

// Hook reaktif + auto-sync backend pada mount
export function useCatalogSync() {
  const gear = useCatalog();

  useEffect(() => {
    syncCatalogFromBackend();
  }, []);

  return gear;
}

export const categories = defaultCategories;
export { stockLabel, stockColor, normalizeGearImage };
