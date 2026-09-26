import { RENTAL_STATUS } from "@/constants/rentalStatus";

const PAYMENT_PROOFS_KEY = "nexora_payment_proofs_v1";

export function getSavedPaymentProof(key) {
  if (typeof window === "undefined" || !key) return null;
  try {
    const raw = localStorage.getItem(PAYMENT_PROOFS_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[String(key)] || null;
  } catch {
    return null;
  }
}

export function savePaymentProof(key, paymentData) {
  if (typeof window === "undefined" || !key) return;
  try {
    const raw = localStorage.getItem(PAYMENT_PROOFS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[String(key)] = {
      ...map[String(key)],
      ...paymentData,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(PAYMENT_PROOFS_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn("Gagal menyimpan payment proof ke local cache:", err);
  }
}

export function getCurrentUserId() {
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

  // Parse notes JSON jika ada (disimpan oleh payment & admin approval)
  const rawNotes = r.notes || r.note || "";
  let parsedNotes = null;
  try {
    if (typeof rawNotes === "string" && rawNotes.trim().startsWith("{") && rawNotes.trim().endsWith("}")) {
      parsedNotes = JSON.parse(rawNotes.trim());
    }
  } catch {}

  // Cek cache persisten bukti pembayaran lokal sebagai fallback cepat
  const rentalKey = r.order_code || String(r.id || "");
  const cachedPayment =
    getSavedPaymentProof(rentalKey) ||
    getSavedPaymentProof(String(r.id || "")) ||
    (r.order_code ? getSavedPaymentProof(r.order_code) : null);

  // Bukti pembayaran (prioritas: DB notes JSON -> properti langsung -> cache lokal jika belum ada JSON di DB)
  const paymentProof =
    parsedNotes?.payment_proof ||
    r.payment_proof ||
    r.paymentProof ||
    (!parsedNotes ? (cachedPayment?.proof || cachedPayment?.payment_proof || "") : "");

  // Normalisasi status
  let normStatus = r.status || "Menunggu verifikasi";
  if (normStatus === "diajukan" || normStatus === "menunggu_verifikasi" || normStatus === RENTAL_STATUS.PENDING) {
    normStatus = "Menunggu verifikasi";
  }
  if (normStatus === "diverifikasi" || normStatus === "aktif" || normStatus === "Aktif" || normStatus === RENTAL_STATUS.ACTIVE) {
    // Bedakan antara Disetujui (belum diambil) dan Diambil (sudah diambil/diserahkan)
    if (parsedNotes?.sub_status === "diambil" || parsedNotes?.sub_status === "Diambil") {
      normStatus = "Diambil";
    } else {
      normStatus = "Disetujui";
    }
  }
  if (normStatus === "diambil") normStatus = "Diambil";
  if (normStatus === "selesai" || normStatus === "dikembalikan" || normStatus === RENTAL_STATUS.COMPLETED) {
    normStatus = "Selesai";
  }
  if (normStatus === "ditolak" || normStatus === "dibatalkan" || normStatus === RENTAL_STATUS.REJECTED) {
    normStatus = "Ditolak";
  }

  // Hitung step saat ini untuk progress tracker 4 tahap
  let currentStep = 0;
  if (normStatus === "Menunggu verifikasi") currentStep = 0;
  else if (normStatus === "Disetujui") currentStep = 1;
  else if (normStatus === "Diambil") currentStep = 2;
  else if (normStatus === "Selesai") currentStep = 3;
  else if (normStatus === "Ditolak") currentStep = 0;

  // Status pembayaran
  let paymentStatus =
    parsedNotes?.payment_status ||
    r.payment_status ||
    r.paymentStatus ||
    (!parsedNotes ? (cachedPayment?.status || cachedPayment?.payment_status || "") : "");

  if (!paymentStatus) {
    if (normStatus === "Menunggu verifikasi" || normStatus === "Ditolak") {
      paymentStatus = "belum_tersedia";
    } else if (normStatus === "Disetujui") {
      paymentStatus = paymentProof ? "menunggu_verifikasi" : "menunggu_pembayaran";
    } else if (normStatus === "Diambil" || normStatus === "Selesai") {
      paymentStatus = "terverifikasi";
    }
  }

  const paymentMethod =
    parsedNotes?.payment_method ||
    r.payment_method ||
    r.paymentMethod ||
    cachedPayment?.method ||
    cachedPayment?.payment_method ||
    "";

  const paymentDate =
    parsedNotes?.payment_date ||
    r.payment_date ||
    r.paymentDate ||
    cachedPayment?.date ||
    cachedPayment?.payment_date ||
    "";

  const paymentNotes =
    parsedNotes?.payment_notes ||
    r.payment_notes ||
    cachedPayment?.notes ||
    cachedPayment?.payment_notes ||
    "";

  // Simpan ke local cache agar selalu sinkron jika data dari DB memuat bukti bayar
  if (paymentProof && typeof window !== "undefined") {
    savePaymentProof(rentalKey, {
      proof: paymentProof,
      method: paymentMethod,
      date: paymentDate,
      status: paymentStatus,
      notes: paymentNotes,
    });
  }

  const durationNights = Number(r.duration_nights ?? r.total_days ?? r.nights ?? 1);
  const totalAmount = Number(r.total_amount ?? r.total_price ?? r.total ?? 0);
  const displayNotes = parsedNotes?.admin_note || parsedNotes?.order_note || parsedNotes?.payment_notes || rawNotes;
  const orderNoteItem = parsedNotes?.order_note || rawNotes;

  return {
    id: r.order_code || formattedId,
    order_code: r.order_code || formattedId,
    backendId: typeof r.id === "number" ? r.id : Number(r.id) || null,
    user_id: r.user_id !== undefined && r.user_id !== null ? String(r.user_id) : null,
    user: r.user || r.name || r.user_name || "Peminjam",
    name: r.name || r.user || r.user_name || "Peminjam",
    email: r.email || r.user_email || "",
    whatsapp: r.whatsapp || r.phone || "081234567890",
    item: r.item || r.gear_name || (orderNoteItem.startsWith("Pengajuan sewa alat: ") ? orderNoteItem.replace("Pengajuan sewa alat: ", "") : (parsedNotes?.order_note || "Peralatan Pendakian")),
    category: r.category || "Tenda",
    date: dateDisplay,
    start_date: r.start_date || "",
    end_date: r.end_date || "",
    total_days: durationNights,
    duration_nights: durationNights,
    nights: durationNights,
    total: totalAmount,
    total_price: totalAmount,
    total_amount: totalAmount,
    status: normStatus,
    steps: ["Diajukan", "Disetujui", "Diambil", "Dikembalikan"],
    currentStep: currentStep,
    note: displayNotes,
    notes: displayNotes,
    ktp_number: r.ktp_number || "",
    ktp_snapshot_url: r.ktp_snapshot_url || "",
    payment_status: paymentStatus,
    payment_method: paymentMethod,
    payment_proof: paymentProof,
    payment_date: paymentDate,
    payment_notes: paymentNotes,
    status_logs: Array.isArray(r.status_logs) ? r.status_logs : [],
    items: Array.isArray(r.items) ? r.items : [],
    created_at: r.created_at || r.createdAt || new Date().toISOString(),
  };
}
