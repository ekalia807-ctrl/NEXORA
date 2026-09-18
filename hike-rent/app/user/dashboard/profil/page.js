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
        if (meRes.success && meRes.data?.session) {
          const s = meRes.data.session;
          setName((prev) => prev || s.name || "");
          setEmail(s.email || "");
          setUserId(s.user_id || "");
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
      <div className="border border-line bg-white/40 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line pb-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Profil Pengguna</h1>
            <p className="mt-1 text-sm text-ink/65">
              Informasi data diri dan nomor kontak terhubung akun Anda.
            </p>
          </div>
          {userId && (
            <span className="self-start rounded-full border border-line bg-paper px-3 py-1 font-mono text-xs text-ink/70">
              ID: #{userId} • Role: {role}
            </span>
          )}
        </div>

        {saved && (
          <div className="mt-4 rounded-sm bg-moss/15 border border-moss/40 px-4 py-2.5 text-xs text-moss font-semibold flex items-center gap-2">
            <span>✓</span>
            <span>Profil berhasil disimpan dan diperbarui!</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-ink/50">Memuat profil...</div>
        ) : (
          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm text-ink/70">Nama Lengkap</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
              />
            </label>

            <label className="block">
              <span className="text-sm text-ink/70">Email Terdaftar</span>
              <input
                type="email"
                disabled
                value={email}
                className="mt-1.5 w-full border border-line bg-zinc-100/70 px-3 py-2 text-sm text-ink/60 outline-none cursor-not-allowed"
                title="Email terikat pada akun basis data"
              />
              <span className="mt-1 block text-[11px] text-ink/40">
                Email terikat langsung dengan akun database server Anda.
              </span>
            </label>

            <label className="block">
              <span className="text-sm text-ink/70">Nomor WhatsApp</span>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
              />
              <span className="mt-1 block text-[11px] text-ink/40">
                Digunakan untuk konfirmasi sewa via WhatsApp Click-to-Chat.
              </span>
            </label>

            <button
              type="submit"
              className="rounded-sm bg-ridge px-5 py-2.5 text-sm font-medium text-fog hover:bg-ink transition-colors shadow-sm"
            >
              Simpan Perubahan
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
