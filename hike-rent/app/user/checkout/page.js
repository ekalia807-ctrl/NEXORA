"use client";

import { useState, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import RequireAuth from "@/components/shared/RequireAuth";

import { createRentalAction } from "@/app/actions/rentals";
import { addRental } from "@/lib/stores/rentalsStore";
import { useCatalog } from "@/lib/stores/catalogStore";
import {
  getTodayString,
  validasiTanggalTerpisah,
  hitungDurasiHari,
} from "@/lib/utils/hitungBiaya";
import {
  validateName,
  validatePhone,
  validateKtp,
  getDefaultEndDate,
} from "@/lib/utils/formValidations";

import CustomerInfoFields from "./components/CustomerInfoFields";
import KtpUploader from "./components/KtpUploader";
import CheckoutOrderSummary from "./components/CheckoutOrderSummary";
import CheckoutSuccessModal from "./components/CheckoutSuccessModal";

// Harus SAMA PERSIS dengan key yang dipakai di halaman Rekomendasi Rombongan
const PAKET_STORAGE_KEY = "nexora_paket_rekomendasi";

function CheckoutForm() {
  const [submitted, setSubmitted] = useState(false);
  const gear = useCatalog();

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

  const searchParams = useSearchParams();
  const alat = searchParams.get("alat") || "";
  const alatId = searchParams.get("alatId") || "";
  const isPaket = searchParams.get("paket") === "1";
  const jumlahQuery = parseInt(searchParams.get("jumlah"), 10);
  const initialJumlah = !isNaN(jumlahQuery) && jumlahQuery > 0 ? jumlahQuery : 1;

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
    if (ktpInputRef.current) {
      ktpInputRef.current.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const nameCheck = validateName(name);
    const phoneCheck = validatePhone(whatsapp);
    const ktpCheck = validateKtp(ktp);
    const dateCheck = validasiTanggalTerpisah(startDate, endDate);

    const newErrors = {};

    if (startDate < todayStr) {
      newErrors.startDate = "Tanggal pengajuan tidak boleh kurang dari hari ini.";
      alert("⚠️ PERINGATAN TANGGAL:\nTanggal pengajuan tidak boleh kurang dari hari ini (" + todayStr + "). Silakan pilih tanggal hari ini atau yang akan datang.");
    } else if (!dateCheck.valid) {
      if (dateCheck.field === "startDate") {
        newErrors.startDate = dateCheck.message;
      } else {
        newErrors.endDate = dateCheck.message;
      }
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
      setErrors(newErrors);

      if (newErrors.startDate && startDateInputRef.current) {
        startDateInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        startDateInputRef.current.focus();
      } else if (newErrors.endDate && endDateInputRef.current) {
        endDateInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        endDateInputRef.current.focus();
      } else if (newErrors.name && nameInputRef.current) {
        nameInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        nameInputRef.current.focus();
      } else if (newErrors.whatsapp && whatsappInputRef.current) {
        whatsappInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        whatsappInputRef.current.focus();
      } else if (newErrors.ktp && ktpInputRef.current) {
        ktpInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      return;
    }

    setLoading(true);
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

    setSubmitted(true);
    setLoading(false);
  }

  if (paketItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white/60 p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line bg-paper text-2xl">
          🎒
        </div>
        <h1 className="mt-4 font-display text-xl font-bold text-ink">
          Belum Ada Alat yang Dipilih
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/65">
          Silakan pilih alat dari Katalog atau paket dari Rekomendasi
          Rombongan terlebih dahulu sebelum melanjutkan ke checkout.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/user/katalog"
            className="rounded-xl bg-ridge px-6 py-2.5 text-xs font-semibold text-fog shadow-sm transition-all hover:bg-ink"
          >
            Ke Katalog Alat →
          </Link>
          <Link
            href="/user/rekomendasi"
            className="rounded-xl border border-line bg-paper/60 px-5 py-2.5 text-xs font-semibold text-ink transition-all hover:bg-paper"
          >
            Lihat Rekomendasi Rombongan
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <CheckoutSuccessModal
        name={name}
        whatsapp={whatsapp}
        paketItems={paketItems}
        startDate={startDate}
        endDate={endDate}
        totalPaketHarga={totalPaketHarga}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-white/70 p-6 shadow-sm backdrop-blur-md sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber">
                Langkah Transaksi
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Formulir Sewa</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Checkout Pengajuan Sewa
            </h1>
            <p className="mt-1.5 text-sm text-ink/65">
              Lengkapi data peminjaman dan konfirmasi perlengkapan yang ingin
              kamu sewa sebelum diproses oleh penyedia.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/user/katalog"
              className="rounded-xl border border-line bg-paper/60 px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition-all"
            >
              ← Kembali ke Katalog
            </Link>
            <span className="rounded-full bg-ridge px-3.5 py-1 font-mono text-xs font-medium text-fog shadow-sm">
              Panel Peminjam
            </span>
          </div>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Jadwal & Data Peminjam */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-line bg-white/80 p-5 sm:p-6 lg:p-7 shadow-sm backdrop-blur-sm space-y-5">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                1. Jadwal & Data Peminjam
              </h2>
              <p className="mt-0.5 text-xs text-ink/65">
                Pastikan tanggal peminjaman dan identitas sesuai untuk verifikasi basecamp.
              </p>
            </div>

            {/* Input Data Diri & Tanggal */}
            <CustomerInfoFields
              startDate={startDate}
              endDate={endDate}
              name={name}
              whatsapp={whatsapp}
              todayStr={todayStr}
              errors={errors}
              startDateInputRef={startDateInputRef}
              endDateInputRef={endDateInputRef}
              nameInputRef={nameInputRef}
              whatsappInputRef={whatsappInputRef}
              handleStartDateChange={handleStartDateChange}
              handleEndDateChange={handleEndDateChange}
              handleNameChange={handleNameChange}
              handleWhatsappChange={handleWhatsappChange}
              handleWhatsappKeyDown={handleWhatsappKeyDown}
              handleWhatsappPaste={handleWhatsappPaste}
              handleWhatsappBlur={handleWhatsappBlur}
            />

            {/* KTP Uploader */}
            <KtpUploader
              ktpInputRef={ktpInputRef}
              ktpPreview={ktpPreview}
              errors={errors}
              onChange={handleKtpChange}
              onRemove={handleRemoveKtp}
            />
          </div>
        </div>

        {/* Kolom Kanan: Ringkasan Pesanan & Konfirmasi */}
        <CheckoutOrderSummary
          paketItems={paketItems}
          diffDays={diffDays}
          totalPaketHarga={totalPaketHarga}
          loading={loading}
        />
      </form>
    </div>
  );
}

export default function UserCheckoutPage() {
  return (
    <RequireAuth allow={["user"]}>
      <Suspense fallback={<div className="p-6 text-sm text-ink/50">Memuat checkout...</div>}>
        <CheckoutForm />
      </Suspense>
    </RequireAuth>
  );
}
