/**
 * Normalisasi URL gambar alat pendakian:
 * - "-" atau string kosong / null diubah menjadi ""
 * - data URL (base64) & blob URL tetap dipertahankan untuk preview
 * - URL relatif lokal (/uploads/...) tetap dipertahankan
 * - URL absolut (http://, https://) tetap dipertahankan
 * - Path relatif backend kampus (/storage/...) diberi awalan https://hmif.if.unram.ac.id
 */
export function normalizeGearImage(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === "-") return "";

  // 1. Data URLs (base64) & Blob URLs untuk live preview instan
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // 2. URL Absolut (http:// atau https://)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // 3. Berkas bawaan database HMIF UNRAM (format penamaan /uploads/img_... atau /storage/...)
  if (
    trimmed.startsWith("/uploads/img_") ||
    trimmed.startsWith("uploads/img_") ||
    trimmed.startsWith("/storage/") ||
    trimmed.startsWith("storage/")
  ) {
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `https://hmif.if.unram.ac.id${cleanPath}`;
  }

  // 4. Berkas upload baru yang tersimpan di public/uploads/ Next.js lokal
  if (trimmed.startsWith("/uploads/")) {
    return trimmed;
  }

  // 5. Default fallback untuk path relatif lainnya: arahkan ke backend HMIF
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `https://hmif.if.unram.ac.id${path}`;
}
