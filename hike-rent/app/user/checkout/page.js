"use client";

import { useState, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import RequireAuth from "@/components/shared/RequireAuth";

import { createRentalAction } from "@/app/actions/rentals";
import { addRental } from "@/lib/rentalsStore";
import { useCatalog } from "@/lib/catalogStore";
import { formatRupiah, hitungBiaya } from "@/lib/hitungBiaya";

// Harus SAMA PERSIS dengan key yang dipakai di halaman Rekomendasi Rombongan
const PAKET_STORAGE_KEY = "nexora_paket_rekomendasi";

function validateName(val) {
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

// WA boleh kosong saat mengisi form.
// Tetapi jika diisi, harus berupa angka dan format nomor Indonesia.
function validatePhone(phone) {
  const clean = (phone || "").trim();

  // Nomor WhatsApp bersifat opsional saat mengisi form.
  if (!clean) {
    return {
      isValid: true,
      clean: "",
      isEmpty: true,
    };
  }

  // Harus hanya berisi angka.
  if (!/^[0-9]+$/.test(clean)) {
    return {
      isValid: false,
      message: "Nomor WhatsApp hanya boleh berisi angka ya.",
    };
  }

  // Nomor telepon seluler Indonesia berawalan 08 atau 628.
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

function validateKtp(file) {
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

function CheckoutForm() {
  const [submitted, setSubmitted] = useState(false);
  const gear = useCatalog();

  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        return u.name || "";
      } catch (e) {}
    }

    return "";
  });

  const [whatsapp, setWhatsapp] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        const raw = u.whatsapp || u.phone || "";

        return String(raw).replace(/\D/g, "").slice(0, 15);
      } catch (e) {}
    }

    return "";
  });

  const [startDate, setStartDate] = useState("2026-09-20");
  const [endDate, setEndDate] = useState("2026-09-23");
  const [loading, setLoading] = useState(false);
  const [ktp, setKtp] = useState(null);
  const [ktpPreview, setKtpPreview] = useState("");
  const [errors, setErrors] = useState({});

  const nameInputRef = useRef(null);
  const whatsappInputRef = useRef(null);
  const ktpInputRef = useRef(null);

  const searchParams = useSearchParams();
  const alat = searchParams.get("alat") || "";
  const isPaket = searchParams.get("paket") === "1";

  // ==========================================
  // BACA DATA PAKET ROMBONGAN DARI LOCALSTORAGE
  // (diisi oleh halaman Rekomendasi Rombongan)
  // Dibaca sekali via lazy initializer, sama pola seperti `name`/`whatsapp`
  // di atas — jadi tidak perlu useEffect + setState terpisah.
  // ==========================================
  const [rawPaket] = useState(() => {
    if (!isPaket || typeof window === "undefined") return [];

    try {
      const stored = JSON.parse(
        window.localStorage.getItem(PAKET_STORAGE_KEY) || "[]"
      );

      return Array.isArray(stored) ? stored : [];
    } catch (e) {
      console.warn("Gagal membaca data paket rombongan:", e.message);
      return [];
    }
  });

  // Cocokkan alatId dari localStorage ke data katalog (nama alat, harga, dsb).
  const paketItems = useMemo(() => {
    if (!isPaket || rawPaket.length === 0) return [];

    return rawPaket.map((row) => {
      const matched = gear.find((g) => g.id === String(row.alatId));

      return {
        id: row.alatId,
        name: matched ? matched.name : `Alat #${row.alatId}`,
        jumlah: row.jumlah || 1,
        // Fallback harga kalau alat tidak ketemu di katalog (mis. sudah dihapus admin).
        pricePerHari: matched ? matched.price : 40000,
      };
    });
  }, [isPaket, rawPaket, gear]);

  // Jumlah hari sewa — dipakai untuk tampilan harga & saat submit,
  // jadi cukup dihitung sekali di sini.
  const diffDays = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  }, [startDate, endDate]);

  // Total harga paket rombongan (berdasarkan harga asli tiap alat × jumlah hari).
  const totalPaketHarga = useMemo(() => {
    if (paketItems.length === 0) return 0;

    return paketItems.reduce(
      (sum, it) =>
        sum +
        hitungBiaya({
          hargaPerHari: it.pricePerHari,
          jumlah: it.jumlah,
          durasiHari: diffDays,
        }),
      0
    );
  }, [paketItems, diffDays]);

  // Nama alat yang dipakai untuk keperluan non-tampilan (note, riwayat, dsb).
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
        setErrors((prev) => ({
          ...prev,
          name: "",
        }));
      }
    }
  }

  function handleWhatsappKeyDown(e) {
    // Izinkan tombol kontrol/navigasi dan shortcut keyboard.
    if (
      [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(e.key) ||
      ((e.ctrlKey || e.metaKey) &&
        ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase()))
    ) {
      return;
    }

    // Tolak karakter selain angka 0-9.
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

    const pasted = e.clipboardData.getData("text") || "";

    // Jika hasil paste mengandung karakter selain angka,
    // jangan langsung menghapusnya. Tampilkan warning.
    if (!/^[0-9]*$/.test(pasted)) {
      setErrors((prev) => ({
        ...prev,
        whatsapp: "Nomor WhatsApp hanya boleh berisi angka ya.",
      }));
      return;
    }

    const input = e.target;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    const nextVal = (
      whatsapp.slice(0, start) +
      pasted +
      whatsapp.slice(end)
    ).slice(0, 15);

    setWhatsapp(nextVal);

    if (errors.whatsapp) {
      const check = validatePhone(nextVal);

      if (check.isValid) {
        setErrors((prev) => ({
          ...prev,
          whatsapp: "",
        }));
      }
    }
  }

  function handleWhatsappChange(e) {
    const rawVal = e.target.value;

    // Input hanya menyimpan angka.
    // Batas maksimal 15 digit.
    const digitsOnly = rawVal.replace(/\D/g, "").slice(0, 15);

    setWhatsapp(digitsOnly);

    if (errors.whatsapp) {
      const check = validatePhone(digitsOnly);

      // Kosong juga valid saat sedang mengisi form.
      if (check.isValid) {
        setErrors((prev) => ({
          ...prev,
          whatsapp: "",
        }));
      }
    }
  }

  function handleWhatsappBlur() {
    // Kalau kosong, tidak perlu warning karena WA bersifat opsional
    // saat mengisi form.
    if (!whatsapp.trim()) {
      setErrors((prev) => ({
        ...prev,
        whatsapp: "",
      }));

      return;
    }

    const check = validatePhone(whatsapp);

    if (!check.isValid) {
      setErrors((prev) => ({
        ...prev,
        whatsapp: check.message,
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        whatsapp: "",
      }));
    }
  }

  function handleKtpChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      setKtp(null);
      setKtpPreview("");
      return;
    }

    const check = validateKtp(file);

    if (!check.isValid) {
      setKtp(null);
      setKtpPreview("");

      setErrors((prev) => ({
        ...prev,
        ktp: check.message,
      }));

      return;
    }

    setKtp(file);

    const preview = URL.createObjectURL(file);
    setKtpPreview(preview);

    setErrors((prev) => ({
      ...prev,
      ktp: "",
    }));
  }

  function handleRemoveKtp() {
    setKtp(null);
    setKtpPreview("");

    if (ktpInputRef.current) {
      ktpInputRef.current.value = "";
    }

    // Setelah KTP dihapus, error tidak langsung ditampilkan.
    // Error akan muncul ketika user menekan Ajukan Sewa.
    setErrors((prev) => ({
      ...prev,
      ktp: "",
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // ==========================================
    // VALIDASI SAAT USER MENEKAN AJUKAN SEWA
    // ==========================================

    const newErrors = {};

    // Nama wajib.
    const nameCheck = validateName(name);

    if (!nameCheck.isValid) {
      newErrors.name = nameCheck.message;
    }

    // WA:
    // - boleh kosong saat mengisi form
    // - tetapi WA wajib ketika user mengajukan sewa
    const phoneCheck = validatePhone(whatsapp);

    if (!whatsapp.trim()) {
      newErrors.whatsapp =
        "Lengkapi nomor WhatsApp terlebih dahulu sebelum mengajukan sewa ya.";
    } else if (!phoneCheck.isValid) {
      newErrors.whatsapp = phoneCheck.message;
    }

    // KTP wajib ketika mengajukan sewa.
    const ktpCheck = validateKtp(ktp);

    if (!ktpCheck.isValid) {
      newErrors.ktp = ktpCheck.message;
    }

    // Tampilkan semua error.
    setErrors(newErrors);

    // ==========================================
    // JIKA ADA ERROR → STAY DI HALAMAN CHECKOUT
    // ==========================================

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.name && nameInputRef.current) {
        nameInputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        nameInputRef.current.focus();
      } else if (newErrors.whatsapp && whatsappInputRef.current) {
        whatsappInputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        whatsappInputRef.current.focus();
      } else if (newErrors.ktp && ktpInputRef.current) {
        ktpInputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      return;
    }

    // ==========================================
    // SEMUA DATA LENGKAP → LANJUT SUBMIT
    // ==========================================

    setLoading(true);

    // Kalau dari paket rombongan, pakai total harga asli per alat.
    // Kalau bukan (alat satuan lewat ?alat=), tetap pakai tarif flat lama.
    const estimatedPrice =
      paketItems.length > 0 ? totalPaketHarga : diffDays * 50000;

    const payload = {
      start_date: startDate,
      end_date: endDate,
      total_days: diffDays,
      total_price: estimatedPrice,
      status: "diajukan",
      note: `Pengajuan sewa alat: ${namaAlatGabungan}`,
      ktp_number: "5201012304950001",
    };

    let backendResult = null;

    try {
      const res = await createRentalAction(payload);

      if (res && res.success && res.data) {
        backendResult = res.data;
      }
    } catch (err) {
      console.warn(
        "Backend rental creation deferred to local sync:",
        err.message
      );
    }

    // Rekam ke rental store client-side.
    addRental({
      id: backendResult?.id ? String(backendResult.id) : undefined,
      backendId: backendResult?.id || null,
      item: namaAlatGabungan,
      items: paketItems.length > 0 ? paketItems : undefined,
      name: name.trim() || "Peminjam",
      whatsapp: phoneCheck.clean || whatsapp.trim(),
      date: `${startDate} s/d ${endDate}`,
      start_date: startDate,
      end_date: endDate,
      total_days: diffDays,
      total_price: estimatedPrice,
      status: "Menunggu verifikasi",
      ktp_number: "5201012304950001",
      ktp_uploaded: true,
      ktp_file_name: ktp?.name || "ktp.jpg",
      ktp_preview: ktpPreview || "",
    });

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-line bg-white/70 p-8 text-center shadow-sm backdrop-blur-md sm:p-12">
        <span
          className="status-dot bg-moss mx-auto block"
          style={{ width: 16, height: 16 }}
        />

        <h1 className="mt-5 font-display text-3xl font-bold text-ink">
          Pengajuan Sewa Berhasil Dikirim!
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/65">
          Pengajuan sewa peralatan pendakian kamu telah tercatat. Tim admin
          NEXORA akan segera meninjau permohonanmu. Setelah disetujui, kamu
          dapat langsung melanjutkan ke pembayaran.
        </p>

        <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl border border-line bg-paper/60 p-4 text-left text-xs text-ink/80 shadow-sm">
          <div className="flex justify-between border-b border-line/40 pb-1.5">
            <span className="text-ink/50">Nama Peminjam:</span>
            <span className="font-semibold text-ink">{name}</span>
          </div>

          <div className="flex justify-between border-b border-line/40 pb-1.5">
            <span className="text-ink/50">Nomor WhatsApp:</span>
            <span className="font-mono font-semibold text-ink">
              {whatsapp}
            </span>
          </div>

          <div className="border-b border-line/40 pb-1.5">
            <span className="text-ink/50">Peralatan:</span>

            {paketItems.length > 0 ? (
              <ul className="mt-1 space-y-1">
                {paketItems.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span className="text-ink/80">{it.name}</span>
                    <span className="font-mono font-medium text-ink">
                      × {it.jumlah}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-1 flex justify-between">
                <span className="font-medium text-ink">
                  {alat || "Peralatan Pendakian"}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between border-b border-line/40 pb-1.5">
            <span className="text-ink/50">Periode Sewa:</span>
            <span className="font-medium text-ink">
              {startDate} s/d {endDate}
            </span>
          </div>

          <div className="flex justify-between pt-0.5">
            <span className="text-ink/50">Total Estimasi Biaya:</span>
            <span className="font-semibold text-ink">
              {formatRupiah(
                paketItems.length > 0 ? totalPaketHarga : diffDays * 50000
              )}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/user/riwayat"
            className="rounded-xl bg-ridge px-6 py-2.5 text-xs font-semibold text-fog shadow-sm transition-all hover:bg-ink"
          >
            Lihat Status di Riwayat →
          </Link>

          <Link
            href="/user/katalog"
            className="rounded-xl border border-line bg-paper/60 px-5 py-2.5 text-xs font-semibold text-ink transition-all hover:bg-paper"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </div>
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

              <span className="font-mono text-[11px] text-ink/50">
                Formulir Sewa
              </span>
            </div>

            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Checkout Pengajuan Sewa
            </h1>

            <p className="mt-1.5 text-sm text-ink/65">
              Lengkapi data peminjaman dan konfirmasi perlengkapan yang ingin
              kamu sewa sebelum diproses oleh penyedia.
            </p>
          </div>

          <span className="rounded-full bg-ridge px-3.5 py-1 font-mono text-xs font-medium text-fog shadow-sm">
            Panel Peminjam
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
              Alat yang Dipilih
            </label>

            {paketItems.length > 0 ? (
              // Mode paket rombongan: tampilkan daftar semua item + jumlah + harga.
              <div className="mt-1.5 space-y-1.5 rounded-xl border border-line bg-paper/60 p-3">
                {paketItems.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-ink/90">
                        {it.name}
                      </span>
                      <span className="text-[11px] text-ink/45">
                        {formatRupiah(it.pricePerHari)} / hari × {it.jumlah}{" "}
                        unit
                      </span>
                    </div>

                    <span className="font-mono font-semibold text-ink/70">
                      {formatRupiah(
                        hitungBiaya({
                          hargaPerHari: it.pricePerHari,
                          jumlah: it.jumlah,
                          durasiHari: diffDays,
                        })
                      )}
                    </span>
                  </div>
                ))}

                <div className="flex items-center justify-between border-t border-line/60 pt-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink/70">
                    Total ({diffDays} hari)
                  </span>
                  <span className="font-display text-base font-bold text-ink">
                    {formatRupiah(totalPaketHarga)}
                  </span>
                </div>
              </div>
            ) : (
              // Mode lama: satu alat via query param ?alat=.
              <input
                type="text"
                readOnly
                value={alat || "Tenda Dome Borneo 4 Person + Matras + Kompor"}
                className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm font-medium text-ink/90 outline-none"
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
                Tanggal Mulai Sewa
              </label>

              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
                Tanggal Selesai Sewa
              </label>

              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="checkout-name"
              className="block text-xs font-semibold uppercase tracking-wide text-ink/70"
            >
              Nama Lengkap
            </label>

            <input
              ref={nameInputRef}
              id="checkout-name"
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="Masukkan nama lengkap sesuai KTP"
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm text-ink outline-none transition-all ${
                errors.name
                  ? "border-alert bg-alert/5 focus:border-alert focus:bg-white focus:ring-2 focus:ring-alert/20"
                  : "border-line bg-paper/60 focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              }`}
            />

            {errors.name && (
              <p
                id="name-error"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-alert"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-alert"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>

                <span>{errors.name}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="checkout-whatsapp"
              className="block text-xs font-semibold uppercase tracking-wide text-ink/70"
            >
              Nomor WhatsApp Aktif
              <span className="ml-1 font-normal normal-case text-ink/40">
                (opsional)
              </span>
            </label>

            <input
              ref={whatsappInputRef}
              id="checkout-whatsapp"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="tel"
              maxLength={15}
              value={whatsapp}
              onChange={handleWhatsappChange}
              onKeyDown={handleWhatsappKeyDown}
              onPaste={handleWhatsappPaste}
              onBlur={handleWhatsappBlur}
              placeholder="Contoh: 081234567890"
              aria-invalid={errors.whatsapp ? "true" : "false"}
              aria-describedby={
                errors.whatsapp ? "whatsapp-error" : undefined
              }
              className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 font-mono text-sm text-ink outline-none transition-all ${
                errors.whatsapp
                  ? "border-alert bg-alert/5 focus:border-alert focus:bg-white focus:ring-2 focus:ring-alert/20"
                  : "border-line bg-paper/60 focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              }`}
            />

            <p className="mt-1.5 text-[11px] text-ink/45">
              Nomor WhatsApp wajib diisi saat mengajukan sewa dan hanya boleh
              menggunakan angka.
            </p>

            {errors.whatsapp && (
              <p
                id="whatsapp-error"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-alert"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-alert"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>

                <span>{errors.whatsapp}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="checkout-ktp"
              className="block text-xs font-semibold uppercase tracking-wide text-ink/70"
            >
              Unggah Foto KTP / Identitas
            </label>

            <div
              className={`mt-1.5 rounded-xl border p-2 transition-all ${
                errors.ktp
                  ? "border-alert bg-alert/5 ring-2 ring-alert/10"
                  : "border-line bg-paper/60"
              }`}
            >
              <input
                ref={ktpInputRef}
                id="checkout-ktp"
                type="file"
                accept="image/*"
                onChange={handleKtpChange}
                aria-invalid={errors.ktp ? "true" : "false"}
                aria-describedby={errors.ktp ? "ktp-error" : undefined}
                className="w-full cursor-pointer text-xs text-ink/70 file:mr-4 file:rounded-xl file:border-0 file:bg-ridge file:px-4 file:py-2 file:text-xs file:font-semibold file:text-fog hover:file:bg-ink focus:outline-none"
              />
            </div>

            <p className="mt-1.5 text-[11px] text-ink/45">
              Foto KTP wajib diunggah sebelum pengajuan sewa dapat diproses.
            </p>

            {errors.ktp && (
              <p
                id="ktp-error"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-alert"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-alert"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>

                <span>{errors.ktp}</span>
              </p>
            )}

            {ktpPreview && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-ink/50">
                    Pratinjau KTP Terunggah:
                  </p>

                  <button
                    type="button"
                    onClick={handleRemoveKtp}
                    className="text-[11px] font-medium text-alert hover:underline"
                  >
                    Hapus / Ganti Foto
                  </button>
                </div>

                <img
                  src={ktpPreview}
                  alt="Pratinjau KTP"
                  className="max-h-56 w-full rounded-xl border border-line bg-paper/60 object-contain p-2 shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-ridge py-3 text-center text-xs font-bold text-fog shadow-sm transition-all hover:bg-ink disabled:opacity-50"
            >
              {loading ? "Memproses Pengajuan..." : "Ajukan Sewa →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserCheckoutPage() {
  return (
    <RequireAuth allow={["user"]}>
      <Suspense
        fallback={
          <div className="p-6 text-sm text-ink/50">
            Memuat checkout...
          </div>
        }
      >
        <CheckoutForm />
      </Suspense>
    </RequireAuth>
  );
}
