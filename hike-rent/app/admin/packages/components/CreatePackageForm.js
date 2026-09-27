"use client";

export default function CreatePackageForm({ form, setForm, onSubmit }) {
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 shadow-sm backdrop-blur-md h-fit">
      <div className="border-b border-line/60 pb-3 mb-4">
        <h2 className="font-display text-lg font-bold text-ink">
          + Tambah Paket Baru
        </h2>
        <p className="mt-0.5 text-xs text-ink/55">Simpan bundel baru ke server backend</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">Nama Paket</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Contoh: Paket Lengkap Rinjani 4P"
            className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">Target Rombongan</label>
          <input
            type="text"
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
            placeholder="Contoh: 4 Orang / Solo"
            className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">Deskripsi Paket</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Rincian peruntukan jalur dan perlengkapan..."
            className="mt-1.5 w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-ridge py-2.5 text-sm font-semibold text-fog hover:bg-ink shadow-sm transition-all"
        >
          Simpan Paket ke Database
        </button>
      </form>
    </div>
  );
}
