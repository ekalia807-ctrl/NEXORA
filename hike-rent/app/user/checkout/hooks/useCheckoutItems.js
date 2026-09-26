"use client";

import { useMemo } from "react";
import { hitungDurasiHari } from "@/lib/utils/hitungBiaya";

const PAKET_STORAGE_KEY = "nexora_paket_rekomendasi";

export function useCheckoutItems(searchParams, gear, startDate, endDate) {
  const alat = searchParams.get("alat") || "";
  const alatId = searchParams.get("alatId") || "";
  const isPaket = searchParams.get("paket") === "1";
  const jumlahQuery = parseInt(searchParams.get("jumlah"), 10);
  const initialJumlah = !isNaN(jumlahQuery) && jumlahQuery > 0 ? jumlahQuery : 1;

  // Baca data paket rombongan dari localStorage
  const rawPaket = useMemo(() => {
    if (!isPaket || typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(PAKET_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [isPaket]);

  const paketItems = useMemo(() => {
    if (isPaket && rawPaket.length > 0) {
      return rawPaket.map((row) => {
        const matched = gear.find((g) => g.id === String(row.alatId));
        return {
          id: row.alatId,
          name: matched ? matched.name : `Alat #${row.alatId}`,
          jumlah: row.jumlah || 1,
          pricePerHari: matched ? matched.price : 40000,
        };
      });
    }

    if (alatId) {
      const matched = gear.find((g) => String(g.id) === String(alatId));
      return [
        {
          id: alatId,
          name: matched ? matched.name : alat || `Alat #${alatId}`,
          jumlah: initialJumlah,
          pricePerHari: matched ? matched.price : 40000,
        },
      ];
    }

    if (alat) {
      const matched = gear.find(
        (g) => g.name.toLowerCase() === alat.toLowerCase()
      );
      return [
        {
          id: matched ? matched.id : alat,
          name: matched ? matched.name : alat,
          jumlah: 1,
          pricePerHari: matched ? matched.price : 40000,
        },
      ];
    }

    return [];
  }, [isPaket, rawPaket, alatId, alat, gear, initialJumlah]);

  const diffDays = useMemo(() => {
    return hitungDurasiHari(startDate, endDate) || 1;
  }, [startDate, endDate]);

  const totalPaketHarga = useMemo(() => {
    return paketItems.reduce((acc, it) => {
      const sub = (it.pricePerHari || 0) * (it.jumlah || 1) * diffDays;
      return acc + sub;
    }, 0);
  }, [paketItems, diffDays]);

  const namaAlatGabungan = useMemo(() => {
    if (paketItems.length > 0) {
      return paketItems.map((it) => `${it.name} × ${it.jumlah}`).join(", ");
    }
    return alat || "Peralatan Pendakian";
  }, [paketItems, alat]);

  return {
    paketItems,
    diffDays,
    totalPaketHarga,
    namaAlatGabungan,
    isPaket,
  };
}
