import { createRentalAction } from "@/app/actions/rentals";
import { addRental } from "@/lib/stores/rentalsStore";
import {
  validasiTanggalTerpisah,
} from "@/lib/utils/hitungBiaya";
import {
  validateName,
  validatePhone,
  validateKtp,
} from "@/lib/utils/formValidations";

export async function validateAndSubmitOrder({
  name,
  whatsapp,
  ktp,
  ktpPreview,
  startDate,
  endDate,
  todayStr,
  diffDays,
  totalPaketHarga,
  namaAlatGabungan,
  paketItems,
}) {
  const nameCheck = validateName(name);
  const phoneCheck = validatePhone(whatsapp, true);
  const ktpCheck = validateKtp(ktp);
  const dateCheck = validasiTanggalTerpisah(startDate, endDate);

  console.log("=== [checkoutSubmission] Validasi data pengajuan ===", {
    name,
    whatsapp,
    startDate,
    endDate,
    hasKtp: Boolean(ktp),
    nameCheck,
    phoneCheck,
    ktpCheck,
    dateCheck,
  });

  const newErrors = {};

  if (dateCheck.startError) {
    newErrors.startDate = dateCheck.startError;
  }
  if (dateCheck.endError) {
    newErrors.endDate = dateCheck.endError;
  }

  if (!nameCheck.isValid) {
    newErrors.name = nameCheck.message;
  }

  if (!phoneCheck.isValid) {
    newErrors.whatsapp = phoneCheck.message;
  }

  if (!ktpCheck.isValid) {
    newErrors.ktp = ktpCheck.message;
  }

  if (Object.keys(newErrors).length > 0) {
    console.warn("=== [checkoutSubmission] Validasi gagal dengan error ===", newErrors);
    return { success: false, errors: newErrors };
  }

  const estimatedPrice = totalPaketHarga;
  const orderCode = `ORD-${Date.now().toString().slice(-6)}`;
  const payload = {
    order_code: orderCode,
    start_date: startDate,
    end_date: endDate,
    duration_nights: diffDays,
    total_days: diffDays,
    total_amount: estimatedPrice,
    total_price: estimatedPrice,
    status: "diajukan",
    note: `Pengajuan sewa alat: ${namaAlatGabungan}`,
    ktp_number: "5201012304950001",
    items: paketItems,
  };

  let backendResult = null;

  try {
    const res = await createRentalAction(payload);
    if (res && res.success && res.data) {
      backendResult = res.data;
    }
  } catch (err) {
    console.warn("Backend rental creation deferred to local sync:", err.message);
  }

  addRental({
    id: backendResult?.order_code || orderCode,
    order_code: backendResult?.order_code || orderCode,
    backendId: backendResult?.id || null,
    item: namaAlatGabungan,
    items: paketItems,
    name: name.trim() || "Peminjam",
    whatsapp: phoneCheck.clean || whatsapp.trim(),
    date: `${startDate} s/d ${endDate}`,
    start_date: startDate,
    end_date: endDate,
    total_days: diffDays,
    duration_nights: diffDays,
    total_price: estimatedPrice,
    total_amount: estimatedPrice,
    status: "Menunggu verifikasi",
    ktp_number: "5201012304950001",
    ktp_uploaded: true,
    ktp_file_name: ktp?.name || "ktp.jpg",
    ktp_preview: ktpPreview || "",
  });

  console.log("=== [checkoutSubmission] Pengajuan berhasil disimpan ===", {
    orderCode: backendResult?.order_code || orderCode,
    backendId: backendResult?.id,
  });

  return { success: true };
}
