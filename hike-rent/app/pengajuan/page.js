"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function PengajuanForm() {
  const params = useSearchParams();
  const presetAlat = params.get("alat") || "";

  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center sm:px-8">
        <span className="status-dot bg-amber mx-auto block" style={{ width: 12, height: 12 }} />
        <h1 className="mt-6 font-display text-3xl font-bold text-ink">
          Pengajuan terkirim
        </h1>
        <p className="mt-4 text-ink/65">
          Tim penyedia akan memverifikasi dokumen kamu. Biasanya selesai
          dalam 6 jam. Pantau statusnya di halaman riwayat.
        </p>
        <a
          href="/riwayat"
          className="mt-8 inline-block rounded-sm bg-ridge px-6 py-3 text-sm text-fog hover:bg-ink"
        >
          Lihat status pengajuan
        </a>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16 sm:px-8">
      <h1 className="font-display text-4xl font-bold text-ink">Ajukan sewa</h1>
      <p className="mt-3 text-ink/65">
        Isi data, unggah KTP, dan setujui ketentuan. Langkah {step} dari 3.
      </p>

      <div className="mt-6 flex gap-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 ${n <= step ? "bg-ridge" : "bg-line"}`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        {step === 1 && (
          <div className="space-y-5">
            <label className="block">
              <span className="text-sm text-ink/70">Nama lengkap</span>
              <input
                required
                type="text"
                className="mt-1.5 w-full border border-line bg-white/40 px-3 py-2.5 text-sm outline-none focus:border-ridge"
                placeholder="Sesuai KTP"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink/70">Nomor WhatsApp</span>
              <input
                required
                type="tel"
                className="mt-1.5 w-full border border-line bg-white/40 px-3 py-2.5 text-sm outline-none focus:border-ridge"
                placeholder="08xx xxxx xxxx"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink/70">Alat yang disewa</span>
              <input
                type="text"
                defaultValue={presetAlat}
                className="mt-1.5 w-full border border-line bg-white/40 px-3 py-2.5 text-sm outline-none focus:border-ridge"
                placeholder="Mis. Tenda dome 2 orang"
              />
            </label>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-sm bg-ridge px-6 py-2.5 text-sm text-fog hover:bg-ink"
            >
              Lanjut
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <span className="text-sm text-ink/70">Unggah KTP</span>
              <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center border border-dashed border-line bg-white/40 px-4 py-10 text-center">
                <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
                <span className="text-sm text-ink/60">
                  {fileName ? fileName : "Klik untuk pilih file, atau seret ke sini"}
                </span>
                <span className="mt-1 text-xs text-ink/40">JPG, PNG, atau PDF, maks 5MB</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-sm border border-line px-6 py-2.5 text-sm text-ink hover:border-ink/40"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={!fileName}
                onClick={() => setStep(3)}
                className="rounded-sm bg-ridge px-6 py-2.5 text-sm text-fog hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Lanjut
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="border border-line bg-white/40 p-4 text-sm leading-relaxed text-ink/70">
              Dengan mengirim pengajuan ini, saya menyetujui bahwa alat yang
              disewa akan dikembalikan dalam kondisi baik, dan bersedia
              menanggung biaya perbaikan atau penggantian bila terjadi
              kerusakan atau kehilangan di luar pemakaian wajar.
            </div>
            <label className="flex items-start gap-3 text-sm text-ink/80">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5"
              />
              Saya sudah membaca dan menyetujui syarat & ketentuan.
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-sm border border-line px-6 py-2.5 text-sm text-ink hover:border-ink/40"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={!agreed}
                className="rounded-sm bg-amber px-6 py-2.5 text-sm font-medium text-ink hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Kirim pengajuan
              </button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}

export default function PengajuanPage() {
  return (
    <Suspense fallback={null}>
      <PengajuanForm />
    </Suspense>
  );
}
