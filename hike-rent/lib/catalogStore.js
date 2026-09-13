"use client";

// Store katalog alat, dipakai BERSAMA oleh:
//   - app/admin/katalog (CRUD: tambah/ubah/hapus alat)
//   - app/user/katalog (tampilan alat untuk peminjam)
//
// Disimpan di localStorage supaya perubahan dari admin langsung
// kelihatan di sisi peminjam, tanpa perlu backend/database.
// Pola sinkronisasi sama seperti lib/useRole.js: pakai
// useSyncExternalStore + custom event, bukan useState + useEffect.

import { useSyncExternalStore } from "react";
import { gear as seedGear, categories, stockLabel, stockColor } from "./gear";

const STORAGE_KEY = "nexora_catalog_v1";
const EVENT_NAME = "catalog-changed";

function slugify(text) {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "alat"
  );
}

function readAll() {
  if (typeof window === "undefined") return seedGear;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedGear;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedGear;
  } catch {
    return seedGear;
  }
}

function writeAll(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function getCatalog() {
  return readAll();
}

export function addCatalogItem(item) {
  const items = readAll();
  let id = slugify(item.name || "alat-baru");
  // Pastikan id unik
  let suffix = 1;
  const existingIds = new Set(items.map((it) => it.id));
  let uniqueId = id;
  while (existingIds.has(uniqueId)) {
    suffix += 1;
    uniqueId = `${id}-${suffix}`;
  }
  const next = [...items, { ...item, id: uniqueId }];
  writeAll(next);
  return next;
}

export function updateCatalogItem(id, patch) {
  const items = readAll();
  const next = items.map((it) => (it.id === id ? { ...it, ...patch, id } : it));
  writeAll(next);
  return next;
}

export function deleteCatalogItem(id) {
  const items = readAll();
  const next = items.filter((it) => it.id !== id);
  writeAll(next);
  return next;
}

export function resetCatalogToDefault() {
  writeAll(seedGear);
  return seedGear;
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
  // useSyncExternalStore butuh snapshot yang stabil (===) selama data
  // gak berubah, jadi kita bandingkan lewat string JSON.
  return JSON.stringify(readAll());
}

function getServerSnapshot() {
  return JSON.stringify(seedGear);
}

// Hook reaktif: komponen otomatis re-render setiap kali katalog berubah,
// baik dari tab admin maupun tab peminjam yang lain.
export function useCatalog() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return JSON.parse(snapshot);
}

export { categories, stockLabel, stockColor };
