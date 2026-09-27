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
    } else {
      setErrors((prev) => ({ ...prev, whatsapp: "" }));
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

  function handleUseSampleKtp() {
    if (typeof document === "undefined") return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#f1f5f9";
        ctx.fillRect(0, 0, 400, 240);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, 400, 42);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("REPUBLIK INDONESIA - KTP CONTOH DEMO", 18, 26);
        ctx.fillStyle = "#334155";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("NIK: 5201012304950001", 20, 75);
        ctx.font = "12px sans-serif";
        ctx.fillText(`Nama: ${name || "User Demo"}`, 20, 105);
        ctx.fillText("Alamat: Mataram, NTB", 20, 135);
        ctx.fillText("Status: Identitas Peminjam Terverifikasi", 20, 165);
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(280, 60, 95, 125);
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("PAS FOTO", 298, 125);
      }
      const dataUrl = canvas.toDataURL("image/png");
      setKtpPreview(dataUrl);
      setErrors((prev) => ({ ...prev, ktp: "" }));
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "ktp_sample_demo.png", { type: "image/png" });
          setKtp(file);
        })
        .catch(() => {});
    } catch (err) {
      console.warn("Gagal membuat sampel KTP:", err);
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
    handleUseSampleKtp,
  };
}
