"use client";

import { useMemo, useState } from "react";
import { initialAccounts } from "@/lib/admin/accounts";

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [query, setQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
    );
  }, [accounts, query]);

  function handleDelete(id) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setConfirmDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <h1 className="font-display text-2xl font-bold text-ink">Akun Pengguna</h1>
        <p className="mt-2 text-sm text-ink/65">
          Lihat daftar peminjam yang terdaftar dan hapus akun bila diperlukan.
        </p>
        <input
          type="text"
          placeholder="Cari nama atau email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-4 w-full max-w-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ridge"
        />
      </div>

      <div className="overflow-x-auto border border-line bg-white/40">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase text-ink/50">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Kontak</th>
              <th className="px-4 py-3 font-medium">Bergabung</th>
              <th className="px-4 py-3 font-medium">Total Sewa</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{a.name}</div>
                  <div className="font-mono text-xs text-ink/50">{a.id}</div>
                </td>
                <td className="px-4 py-3 text-ink/70">
                  <div>{a.email}</div>
                  <div className="text-xs text-ink/50">+{a.whatsapp}</div>
                </td>
                <td className="px-4 py-3 text-ink/70">{a.joined}</td>
                <td className="px-4 py-3 text-ink/70">{a.totalSewa}x</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      a.status === "Aktif"
                        ? "bg-moss text-fog"
                        : "bg-line text-ink/60"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {confirmDeleteId === a.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          className="rounded-sm bg-alert px-3 py-1.5 text-xs text-fog"
                        >
                          Yakin hapus?
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-sm border border-line px-2 py-1.5 text-xs text-ink/60"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(a.id)}
                        className="rounded-sm border border-alert px-3 py-1.5 text-xs text-alert hover:bg-alert hover:text-fog transition-colors"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink/50">
                  Tidak ada akun yang cocok dengan pencariann.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
