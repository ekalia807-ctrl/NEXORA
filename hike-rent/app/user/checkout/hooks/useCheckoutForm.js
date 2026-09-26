"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useCatalog } from "@/lib/stores/catalogStore";
import { getTodayString } from "@/lib/utils/hitungBiaya";
import { getDefaultEndDate } from "@/lib/utils/formValidations";
import { useCheckoutItems } from "./useCheckoutItems";
import { useCheckoutInputHandlers } from "./useCheckoutInputHandlers";
import { validateAndSubmitOrder } from "../utils/checkoutSubmission";

export function useCheckoutForm() {
  const [submitted, setSubmitted] = useState(false);
  const gear = useCatalog();
  const searchParams = useSearchParams();

  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        return u.name || "";
      } catch (e) { }
    }
    return "";
  });

  const [whatsapp, setWhatsapp] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        const raw = u.whatsapp || u.phone || "";
        return String(raw).replace(/\D/g, "").slice(0, 15);
      } catch (e) { }
    }
    return "";
  });

  const todayStr = getTodayString();
  const queryStartDate = searchParams.get("startDate") || searchParams.get("tanggalMulai") || "";
  const queryEndDate = searchParams.get("endDate") || searchParams.get("tanggalSelesai") || "";

  const [startDate, setStartDate] = useState(() => {
    if (queryStartDate && queryStartDate >= todayStr) return queryStartDate;
    return todayStr;
  });

  const [endDate, setEndDate] = useState(() => {
    const baseStart = queryStartDate && queryStartDate >= todayStr ? queryStartDate : todayStr;
    if (queryEndDate && queryEndDate >= baseStart) return queryEndDate;
    return getDefaultEndDate(baseStart);
  });

  const [loading, setLoading] = useState(false);
  const [ktp, setKtp] = useState(null);
  const [ktpPreview, setKtpPreview] = useState("");
  const [errors, setErrors] = useState({});

  const nameInputRef = useRef(null);
  const whatsappInputRef = useRef(null);
  const ktpInputRef = useRef(null);
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);

  const { paketItems, diffDays, totalPaketHarga, namaAlatGabungan } = useCheckoutItems(
    searchParams,
    gear,
    startDate,
    endDate
  );

  const handlers = useCheckoutInputHandlers({
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
  });

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    const result = await validateAndSubmitOrder({
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
    });

    if (!result.success) {
      setErrors(result.errors);
      setLoading(false);

      if (result.errors.startDate && startDateInputRef.current) {
        startDateInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        startDateInputRef.current.focus();
      } else if (result.errors.endDate && endDateInputRef.current) {
        endDateInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        endDateInputRef.current.focus();
      } else if (result.errors.name && nameInputRef.current) {
        nameInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        nameInputRef.current.focus();
      } else if (result.errors.whatsapp && whatsappInputRef.current) {
        whatsappInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        whatsappInputRef.current.focus();
      } else if (result.errors.ktp && ktpInputRef.current) {
        ktpInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  return {
    submitted,
    name,
    whatsapp,
    startDate,
    endDate,
    todayStr,
    loading,
    ktpPreview,
    errors,
    paketItems,
    diffDays,
    totalPaketHarga,
    refs: {
      nameInputRef,
      whatsappInputRef,
      ktpInputRef,
      startDateInputRef,
      endDateInputRef,
    },
    handlers: {
      ...handlers,
      handleSubmit,
    },
  };
}
