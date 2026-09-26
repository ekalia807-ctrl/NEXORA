"use client";

import { useEffect, useSyncExternalStore } from "react";
import { RENTAL_STATUS } from "@/constants/rentalStatus";
import { fetchRentalsAction } from "@/app/actions/rentals";
import {
  getSavedPaymentProof,
  savePaymentProof,
  getCurrentUserId,
  normalizeRental,
} from "@/lib/adapters/rentalAdapter";

export { getSavedPaymentProof, savePaymentProof, normalizeRental };

const STORAGE_KEY = "nexora_rentals_v3";
const EVENT_NAME = "rentals-changed";

// Bersihkan cache v2 lokal lama jika masih ada
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("nexora_rentals_v2");
  } catch { }
}

function readAll() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { }
  window.dispatchEvent(new Event(EVENT_NAME));
  window.dispatchEvent(new Event("rentals-updated"));
}

export function getRentals() {
  return readAll();
}

// Rental milik user yang sedang login saja — dipakai di halaman Riwayat (user)
export function getMyRentals() {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return [];
  return readAll().filter((r) => String(r.user_id) === currentUserId);
}

export function addRental(rental) {
  const current = readAll();
  const rentalWithUser =
    rental && rental.user_id !== undefined && rental.user_id !== null
      ? rental
      : { ...rental, user_id: getCurrentUserId() };

  const normalized = normalizeRental(rentalWithUser);
  const next = [normalized, ...current];
  writeAll(next);
  return next;
}

export function updateRentalStatus(id, newStatus, extraPatch = {}, auditEntry = null) {
  const current = readAll();
  const next = current.map((r) => {
    if (r.id === id || String(r.backendId) === String(id) || r.order_code === id) {
      let currentStep = 0;
      if (newStatus === "Menunggu verifikasi" || newStatus === "diajukan" || newStatus === RENTAL_STATUS.PENDING) currentStep = 0;
      else if (newStatus === "Disetujui" || newStatus === "diverifikasi" || newStatus === "Aktif" || newStatus === RENTAL_STATUS.ACTIVE) currentStep = 1;
      else if (newStatus === "Diambil" || newStatus === "diambil") currentStep = 2;
      else if (newStatus === "Selesai" || newStatus === "selesai" || newStatus === "dikembalikan" || newStatus === RENTAL_STATUS.COMPLETED) currentStep = 3;
      else if (newStatus === "Ditolak" || newStatus === "ditolak" || newStatus === RENTAL_STATUS.REJECTED) currentStep = 0;

      let displayStatus = newStatus;
      if (newStatus === "diverifikasi" || newStatus === "Aktif" || newStatus === "aktif") displayStatus = "Disetujui";
      if (newStatus === "diajukan" || newStatus === "menunggu_verifikasi") displayStatus = "Menunggu verifikasi";
      if (newStatus === "diambil") displayStatus = "Diambil";
      if (newStatus === "selesai" || newStatus === "dikembalikan") displayStatus = "Selesai";

      const existingLogs = Array.isArray(r.status_logs) ? r.status_logs : [];
      const updatedLogs = auditEntry
        ? [
          ...existingLogs,
          {
            status: displayStatus,
            notes: auditEntry.notes || `Perubahan status ke ${displayStatus}`,
            changed_by: auditEntry.changed_by || "Admin",
            created_at: new Date().toISOString(),
          },
        ]
        : existingLogs;

      // Simpan bukti bayar ke cache persisten jika ada
      if (extraPatch.payment_proof || extraPatch.payment_status) {
        const pKey = r.order_code || r.id || id;
        savePaymentProof(pKey, {
          proof: extraPatch.payment_proof || r.payment_proof,
          method: extraPatch.payment_method || r.payment_method,
          date: extraPatch.payment_date || r.payment_date,
          status: extraPatch.payment_status || r.payment_status,
          notes: extraPatch.payment_notes || r.payment_notes,
        });
      }

      if (newStatus === "Diambil" || newStatus === "diambil") {
        const pKey = r.order_code || r.id || id;
        savePaymentProof(pKey, {
          status: "terverifikasi",
        });
      }

      return {
        ...r,
        status: displayStatus,
        currentStep: currentStep,
        status_logs: updatedLogs,
        ...extraPatch,
      };
    }
    return r;
  });
  writeAll(next);
  return next;
}

export function deleteRentalFromStore(id) {
  const current = readAll();
  const next = current.filter(
    (r) => r.id !== id && String(r.backendId) !== String(id) && r.order_code !== id
  );
  writeAll(next);
  return next;
}

let isSyncing = false;

export async function syncRentalsFromBackend() {
  if (typeof window === "undefined") return readAll();
  if (isSyncing) return readAll();

  isSyncing = true;
  try {
    // 1. Coba via Server Action langsung (Database Backend UNRAM)
    const actRes = await fetchRentalsAction();
    if (actRes?.success && Array.isArray(actRes.data)) {
      const normalizedBackend = actRes.data.map(normalizeRental).filter(Boolean);
      writeAll(normalizedBackend);
      return normalizedBackend;
    }

    // 2. Fallback via route handler /api/rentals
    const res = await fetch("/api/rentals", { cache: "no-store" });
    if (res.ok) {
      const backendData = await res.json();
      if (Array.isArray(backendData)) {
        const normalizedBackend = backendData.map(normalizeRental).filter(Boolean);
        writeAll(normalizedBackend);
        return normalizedBackend;
      }
    }
  } catch (err) {
    console.warn("Sinkronisasi rentals fallback ke cache lokal:", err.message);
  } finally {
    isSyncing = false;
  }

  return readAll();
}

function subscribe(callback) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("rentals-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("rentals-updated", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return JSON.stringify(readAll());
}

function getMySnapshot() {
  return JSON.stringify(getMyRentals());
}

function getServerSnapshot() {
  return JSON.stringify([]);
}

// Semua rental (dipakai admin: lihat & kelola semua pengajuan)
export function useRentals() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return JSON.parse(snapshot);
}

export function useRentalsSync() {
  const rentals = useRentals();

  useEffect(() => {
    syncRentalsFromBackend();
  }, []);

  return rentals;
}

// Rental milik user yang sedang login saja (dipakai halaman Riwayat user)
export function useMyRentals() {
  const snapshot = useSyncExternalStore(subscribe, getMySnapshot, getServerSnapshot);
  return JSON.parse(snapshot);
}

export function useMyRentalsSync() {
  const rentals = useMyRentals();

  useEffect(() => {
    syncRentalsFromBackend();
  }, []);

  return rentals;
}

export const statusStyle = {
  Disetujui: "bg-moss text-fog",
  Aktif: "bg-moss text-fog",
  "Menunggu verifikasi": "bg-amber text-ink",
  Diambil: "bg-ridge text-amber",
  Selesai: "bg-line text-ink/70",
  Ditolak: "bg-alert text-fog",
  Dibatalkan: "bg-alert text-fog",
};
