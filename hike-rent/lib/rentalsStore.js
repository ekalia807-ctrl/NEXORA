"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "nexora_rentals_v2";
const EVENT_NAME = "rentals-changed";

// Baca id user yang sedang login dari localStorage["user"]
// (disimpan oleh halaman Profil / proses login).
function getCurrentUserId() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const id = parsed.id ?? parsed.user_id ?? null;

    return id !== null && id !== undefined ? String(id) : null;
  } catch {
    return null;
  }
}

export function normalizeRental(r) {
  if (!r) return null;
  const idStr = String(r.id || `NX-${Math.floor(1000 + Math.random() * 9000)}`);
  const formattedId = idStr.startsWith("NX-") ? idStr : `NX-${idStr.padStart(4, "0")}`;

  // Format tanggal
  let dateDisplay = "";
  if (r.start_date && r.end_date) {
    dateDisplay = `${r.start_date} s/d ${r.end_date}`;
  } else if (r.date) {
    dateDisplay = r.date;
  } else {
    dateDisplay = "-";
  }

  // Normalisasi status
  let normStatus = r.status || "Menunggu verifikasi";
  if (normStatus === "diajukan") normStatus = "Menunggu verifikasi";
  if (normStatus === "diverifikasi" || normStatus === "Aktif") normStatus = "Disetujui";
  if (normStatus === "diambil") normStatus = "Diambil";
  if (normStatus === "selesai" || normStatus === "dikembalikan") normStatus = "Selesai";
  if (normStatus === "ditolak" || normStatus === "dibatalkan") normStatus = "Ditolak";

  // Hitung step saat ini untuk progress tracker 4 tahap
  let currentStep = 0;
  if (normStatus === "Menunggu verifikasi") currentStep = 0;
  else if (normStatus === "Disetujui") currentStep = 1;
  else if (normStatus === "Diambil") currentStep = 2;
  else if (normStatus === "Selesai") currentStep = 3;
  else if (normStatus === "Ditolak") currentStep = 0;

  // Status pembayaran
  const paymentProof = r.payment_proof || r.paymentProof || "";
  let paymentStatus = r.payment_status || r.paymentStatus || "";
  if (!paymentStatus) {
    if (normStatus === "Menunggu verifikasi" || normStatus === "Ditolak") {
      paymentStatus = "belum_tersedia";
    } else if (normStatus === "Disetujui") {
      paymentStatus = paymentProof ? "menunggu_verifikasi" : "menunggu_pembayaran";
    } else if (normStatus === "Diambil" || normStatus === "Selesai") {
      paymentStatus = "terverifikasi";
    }
  }

  return {
    id: formattedId,
    backendId: typeof r.id === "number" ? r.id : Number(r.id) || null,
    user_id: r.user_id !== undefined && r.user_id !== null ? String(r.user_id) : null,
    user: r.user || r.name || r.user_name || "Peminjam",
    name: r.name || r.user || "Peminjam",
    email: r.email || r.user_email || "",
    whatsapp: r.whatsapp || r.phone || "081234567890",
    item: r.item || r.gear_name || "Peralatan Pendakian",
    category: r.category || "Tenda",
    date: dateDisplay,
    start_date: r.start_date || "",
    end_date: r.end_date || "",
    total_days: Number(r.total_days ?? r.nights ?? 1),
    nights: Number(r.nights ?? r.total_days ?? 1),
    total: Number(r.total_price ?? r.total ?? 0),
    total_price: Number(r.total_price ?? r.total ?? 0),
    status: normStatus,
    steps: ["Diajukan", "Disetujui", "Diambil", "Dikembalikan"],
    currentStep: currentStep,
    note: r.note || "",
    ktp_number: r.ktp_number || "",
    payment_status: paymentStatus,
    payment_method: r.payment_method || r.paymentMethod || "",
    payment_proof: paymentProof,
    payment_date: r.payment_date || r.paymentDate || "",
    payment_notes: r.payment_notes || "",
    status_logs: Array.isArray(r.status_logs) ? r.status_logs : [],
    created_at: r.created_at || r.createdAt || new Date().toISOString(),
  };
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
  } catch {}
  window.dispatchEvent(new Event(EVENT_NAME));
  window.dispatchEvent(new Event("rentals-updated"));
}

export function getRentals() {
  return readAll();
}

// Rental milik user yang sedang login saja — dipakai di halaman Riwayat (user),
// supaya akun lain / data lama di localStorage yang sama tidak ikut kebaca.
export function getMyRentals() {
  const currentUserId = getCurrentUserId();

  // Kalau tidak ada user yang login, jangan tampilkan apa-apa
  // (lebih aman daripada menampilkan semua data).
  if (!currentUserId) return [];

  return readAll().filter((r) => String(r.user_id) === currentUserId);
}

export function addRental(rental) {
  const current = readAll();

  // Kalau pemanggil tidak menyertakan user_id secara eksplisit,
  // ambil otomatis dari user yang sedang login supaya rental ini
  // ke-tag dengan benar dan tidak bocor ke akun lain.
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
    if (r.id === id || String(r.backendId) === String(id)) {
      let currentStep = 0;
      if (newStatus === "Menunggu verifikasi" || newStatus === "diajukan") currentStep = 0;
      else if (newStatus === "Disetujui" || newStatus === "diverifikasi" || newStatus === "Aktif") currentStep = 1;
      else if (newStatus === "Diambil" || newStatus === "diambil") currentStep = 2;
      else if (newStatus === "Selesai" || newStatus === "selesai" || newStatus === "dikembalikan") currentStep = 3;
      else if (newStatus === "Ditolak" || newStatus === "ditolak") currentStep = 0;

      let displayStatus = newStatus;
      if (newStatus === "diverifikasi" || newStatus === "Aktif") displayStatus = "Disetujui";
      if (newStatus === "diajukan") displayStatus = "Menunggu verifikasi";
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

let isSyncing = false;

export async function syncRentalsFromBackend() {
  if (typeof window === "undefined") return readAll();
  if (isSyncing) return readAll();

  isSyncing = true;
  try {
    const res = await fetch("/api/rentals", { cache: "no-store" });
    if (res.ok) {
      const backendData = await res.json();
      if (Array.isArray(backendData)) {
        const normalizedBackend = backendData.map(normalizeRental).filter(Boolean);

        const localItems = readAll();
        const backendIds = new Set(normalizedBackend.map((b) => String(b.id)));
        const backendBackendIds = new Set(
          normalizedBackend.map((b) => String(b.backendId)).filter(Boolean)
        );

        const localOnly = localItems.filter(
          (l) =>
            !backendIds.has(String(l.id)) &&
            (!l.backendId || !backendBackendIds.has(String(l.backendId)))
        );

        const merged = [...normalizedBackend, ...localOnly];
        writeAll(merged);
        return merged;
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

// Snapshot khusus rental milik user yang sedang login.
function getMySnapshot() {
  return JSON.stringify(getMyRentals());
}

function getServerSnapshot() {
  return JSON.stringify([]);
}

// Semua rental (dipakai admin: lihat & kelola semua pengajuan).
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

// Rental milik user yang sedang login saja (dipakai halaman Riwayat user).
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
