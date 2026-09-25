"use client";

import { useState, useEffect } from "react";
import { getMeAction } from "@/app/actions/auth";

export default function ProfilPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("user");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ambil data profil dari sesi aktif / localStorage
  useEffect(() => {
    async function loadProfile() {
      try {
        // 1. Coba baca dari localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setName(parsed.name || "");
          setEmail(parsed.email || "");
          setWhatsapp(parsed.whatsapp || "081234567890");
          setUserId(parsed.id || "");
          setRole(parsed.role || "user");
        }

        // 2. Sinkronkan dengan data sesi aktif dari backend (/me)
        const meRes = await getMeAction();
        const s = meRes?.data?.session || meRes?.data?.data || meRes?.data;
        if (meRes?.success && s) {
          setName((prev) => prev || s.name || "");
          setEmail(s.email || "");
          setUserId(s.user_id || s.id || "");
          setRole(s.role || "user");
        }
      } catch (e) {
        console.error("Gagal memuat profil:", e);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleSave(e) {
    e.preventDefault();

    // Simpan data terbaru ke localStorage agar persisten di browser
    const existingUser = localStorage.getItem("user");
    const userObj = existingUser ? JSON.parse(existingUser) : {};
    const updatedUser = {
      ...userObj,
      name,
      email,
      whatsapp,
      id: userId,
      role,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("role-changed"));

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
                Akun Peminjam
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Pengaturan</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Profil Pengguna
            </h1>
            <p className="mt-1 text-sm text-ink/65">
              Informasi data diri dan nomor kontak yang terhubung dengan akun peminjaman Anda.
            </p>
          </div>
          {userId && (
            <span className="self-start rounded-full border border-line bg-paper/70 px-3.5 py-1 font-mono text-xs font-semibold text-ink/70">
              ID: #{userId} • Role: {role}
            </span>
          )}
        </div>

        {saved && (
          <div className="mt-5 rounded-xl bg-moss/15 border border-moss/30 px-4 py-3 text-xs text-moss font-semibold flex items-center gap-2 shadow-sm">
            <span>✓</span>
            <span>Profil berhasil disimpan dan diperbarui!</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-ink/50 font-mono">Memuat profil...</div>
        ) : (
          <form onSubmit={handleSave} className="mt-6 space-y-5 max-w-xl">
            <label className="block">
              <span className="text-xs font-semibold text-ink/70 uppercase tracking-wide">Nama Lengkap</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-ink/70 uppercase tracking-wide">Email Terdaftar</span>
              <input
                type="email"
                disabled
                value={email}
                className="mt-1.5 w-full rounded-xl border border-line bg-zinc-100/80 px-4 py-2.5 text-sm text-ink/60 outline-none cursor-not-allowed"
                title="Email terikat pada akun basis data"
              />
              <span className="mt-1.5 block text-[11px] text-ink/40">
                Email terikat langsung dengan akun database server Anda.
              </span>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-ink/70 uppercase tracking-wide">Nomor WhatsApp</span>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
              />
              <span className="mt-1.5 block text-[11px] text-ink/40">
                Digunakan untuk konfirmasi peminjaman dan notifikasi status via WhatsApp.
              </span>
            </label>

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-xl bg-ridge px-6 py-2.5 text-xs font-semibold text-fog shadow-sm hover:bg-ink transition-all"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
