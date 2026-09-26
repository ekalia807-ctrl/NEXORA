"use client";

import {
  validasiTanggalTerpisah,
} from "@/lib/utils/hitungBiaya";
import {
  validateName,
  validatePhone,
  validateKtp,
  getDefaultEndDate,
} from "@/lib/utils/formValidations";

export function useCheckoutInputHandlers({
  name,
  setName,
  whatsapp,
  setWhatsapp,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  todayStr,
  setKtp,
  setKtpPreview,
  errors,
  setErrors,
  ktpInputRef,
}) {
  function handleNameChange(e) {
    const val = e.target.value;
    setName(val);
    if (errors.name) {
      const check = validateName(val);
      if (check.isValid) {
        setErrors((prev) => ({ ...prev, name: "" }));
      }
    }
  }

  function handleWhatsappKeyDown(e) {
    if (
      [
        "Backspace", "Delete", "Tab", "Escape", "Enter",
        "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
        "Home", "End",
      ].includes(e.key) ||
      ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase()))
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      setErrors((prev) => ({
        ...prev,
        whatsapp: "Nomor WhatsApp hanya boleh berisi angka ya.",
      }));
    }
  }

  function handleWhatsappPaste(e) {
    e.preventDefault();
    const pasteText = (e.clipboardData || window.clipboardData).getData("text");
    const digitsOnly = pasteText.replace(/\D/g, "");
    if (!digitsOnly) {
      setErrors((prev) => ({
        ...prev,
        whatsapp: "Teks yang ditempel tidak mengandung angka valid.",
      }));
      return;
    }
    setWhatsapp((prev) => {
      const next = (prev + digitsOnly).slice(0, 15);
      const check = validatePhone(next);
      setErrors((p) => ({
        ...p,
        whatsapp: check.isValid ? "" : check.message,
      }));
      return next;
    });
  }

  function handleWhatsappChange(e) {
    const raw = e.target.value;
    const clean = raw.replace(/\D/g, "").slice(0, 15);
    setWhatsapp(clean);
    if (errors.whatsapp) {
      const check = validatePhone(clean);
      if (check.isValid) {
        setErrors((prev) => ({ ...prev, whatsapp: "" }));
      }
    }
  }

  function handleWhatsappBlur() {
    const check = validatePhone(whatsapp);
    if (!check.isValid) {
      setErrors((prev) => ({ ...prev, whatsapp: check.message }));
    }
  }

  function handleStartDateChange(e) {
    const nextStart = e.target.value;
    setStartDate(nextStart);

    if (errors.startDate) {
      setErrors((prev) => ({ ...prev, startDate: "" }));
    }

    if (nextStart < todayStr) {
      setErrors((prev) => ({
        ...prev,
        startDate: "Tanggal pengajuan tidak boleh kurang dari hari ini.",
      }));
      return;
    }

    if (endDate && nextStart > endDate) {
      const autoEnd = getDefaultEndDate(nextStart);
      setEndDate(autoEnd);
      setErrors((prev) => ({ ...prev, endDate: "" }));
      return;
    }

    const check = validasiTanggalTerpisah(nextStart, endDate);
    if (check.valid) {
      setErrors((prev) => ({ ...prev, startDate: "", endDate: "" }));
    } else if (check.field === "startDate") {
      setErrors((prev) => ({ ...prev, startDate: check.message }));
    }
  }

  function handleEndDateChange(e) {
    const nextEnd = e.target.value;
    setEndDate(nextEnd);

    if (errors.endDate) {
      setErrors((prev) => ({ ...prev, endDate: "" }));
    }

    const check = validasiTanggalTerpisah(startDate, nextEnd);
    if (check.valid) {
      setErrors((prev) => ({ ...prev, startDate: "", endDate: "" }));
    } else if (check.field === "endDate") {
      setErrors((prev) => ({ ...prev, endDate: check.message }));
    }
  }

  function handleKtpChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const check = validateKtp(file);
    if (!check.isValid) {
      setErrors((prev) => ({ ...prev, ktp: check.message }));
      setKtp(null);
      setKtpPreview("");
      return;
    }

    setErrors((prev) => ({ ...prev, ktp: "" }));
    setKtp(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setKtpPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveKtp() {
    setKtp(null);
    setKtpPreview("");
    if (ktpInputRef?.current) {
      ktpInputRef.current.value = "";
    }
  }

  return {
    handleNameChange,
    handleWhatsappKeyDown,
    handleWhatsappPaste,
    handleWhatsappChange,
    handleWhatsappBlur,
    handleStartDateChange,
    handleEndDateChange,
    handleKtpChange,
    handleRemoveKtp,
  };
}
