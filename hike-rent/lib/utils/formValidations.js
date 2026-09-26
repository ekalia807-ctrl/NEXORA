/**
 * Utilitas validasi formulir peminjaman dan checkout NEXORA
 */

export function getDefaultEndDate(startDateStr) {
  try {
    const d = new Date(`${startDateStr}T00:00:00`);
    d.setDate(d.getDate() + 3);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return startDateStr;
  }
}

export function validateName(val) {
  const clean = (val || "").trim();

  if (!clean) {
    return {
      isValid: false,
      message: "Lengkapi nama lengkap sesuai KTP dulu ya.",
    };
  }

  if (clean.length < 3) {
    return {
      isValid: false,
      message: "Nama lengkap minimal 3 karakter ya.",
    };
  }

  return { isValid: true, clean };
}

// Nomor WhatsApp boleh kosong saat mengisi form, tetapi jika diisi harus berformat Indonesia valid.
export function validatePhone(phone) {
  const clean = (phone || "").trim();

  if (!clean) {
    return {
      isValid: true,
      clean: "",
      isEmpty: true,
    };
  }

  if (!/^[0-9]+$/.test(clean)) {
    return {
      isValid: false,
      message: "Nomor WhatsApp hanya boleh berisi angka ya.",
    };
  }

  const isIndo = /^(?:628|08)[0-9]{8,12}$/.test(clean);

  if (!isIndo) {
    return {
      isValid: false,
      message:
        "Format nomor WhatsApp belum valid. Gunakan awalan 08 atau 628 (10–15 digit angka) ya.",
    };
  }

  return {
    isValid: true,
    clean,
    isEmpty: false,
  };
}

export function validateKtp(file) {
  if (!file) {
    return {
      isValid: false,
      message:
        "Silakan unggah foto KTP terlebih dahulu ya, untuk verifikasi peminjaman.",
    };
  }

  if (file.type && !file.type.startsWith("image/")) {
    return {
      isValid: false,
      message:
        "Format foto KTP harus berupa file gambar (JPG, PNG, atau WebP) ya.",
    };
  }

  return { isValid: true };
}
