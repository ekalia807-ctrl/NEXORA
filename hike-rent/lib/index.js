/**
 * Barrel Export Terpusat untuk Folder lib/
 * Memudahkan impor bagi developer baru.
 */

// Stores (State Sisi Client)
export * from "./stores/catalogStore";
export * from "./stores/rentalsStore";
export * from "./stores/wishlistStore";

// Custom React Hooks
export * from "./hooks/useRole";

// Utilities
export * from "./utils/hitungBiaya";
export * from "./utils/crypto";
export * from "./utils/gearImage";

// Domain Business Engine
export * from "./domain/rekomendasi";

// CATATAN: Untuk server helpers (seperti session.js),
// selalu impor langsung dari "@/lib/server/session" agar tidak bocor ke client bundle.
