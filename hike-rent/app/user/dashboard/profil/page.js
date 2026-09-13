"use client";

import { useState } from "react";

export default function ProfilPage() {
  const [name, setName] = useState("Ayu Dian");
  const [email, setEmail] = useState("ayudian@email.com");
  const [whatsapp, setWhatsapp] = useState("081234567890");
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-ink">Profil Pengguna</h1>
        <p className="mt-1 text-sm text-ink/65">
          Perbarui informasi data diri dan nomor kontak yang terhubung dengan WhatsApp.
        </p>

        {saved && (
          <div className="mt-4 rounded-sm bg-ridge px-4 py-2.5 text-xs text-fog">
            Profil berhasil diperbarui!
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm text-ink/70">Nama Lengkap</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </label>

          <label className="block">
            <span className="text-sm text-ink/70">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </label>

          <label className="block">
            <span className="text-sm text-ink/70">Nomor WhatsApp</span>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
            />
          </label>

          <button
            type="submit"
            className="rounded-sm bg-ridge px-5 py-2.5 text-sm font-medium text-fog hover:bg-ink transition-colors"
          >
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}
