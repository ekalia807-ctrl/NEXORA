"use client";

import { useMemo, useState } from "react";
import { useRentalsSync } from "@/lib/rentalsStore";

export default function AdminAccountsPage() {
  const rentals = useRentalsSync();
  const [sessionUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [query, setQuery] = useState("");
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const accounts = useMemo(() => {
    const map = new Map();

    // Tambahkan akun sesi login saat ini (jika ada)
    if (sessionUser) {
      const sessKey = String(sessionUser.id || sessionUser.email || "current");
      map.set(sessKey, {
        id: `USR-${String(sessionUser.id || "001").padStart(3, "0")}`,
        name: sessionUser.name || "Akun Pengguna",
        email: sessionUser.email || "user@nexora.id",
        whatsapp: sessionUser.whatsapp || "6281234567890",
        joined: "Sesi Aktif",
        totalSewa: rentals.filter((r) => r.user_id === sessionUser.id).length,
        status: "Aktif",
      });
    }

    // Ekstrak akun dari riwayat transaksi sewa riil
    for (const r of rentals) {
      const key = String(r.user_id || r.email || r.user || r.name);
      if (!map.has(key)) {
        map.set(key, {
          id: `USR-${String(r.user_id || map.size + 1).padStart(3, "0")}`,
          name: r.user || r.name || "Peminjam",
          email:
            r.email ||
            `${String(r.user || r.name || "peminjam")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, ".")}@nexora.id`,
          whatsapp: r.whatsapp || "6281234567890",
          joined: r.date?.split(" s/d ")[0] || "Terbaru",
          totalSewa: 1,
          status: "Aktif",
        });
      } else {
        const acc = map.get(key);
        acc.totalSewa += 1;
      }
    }

    return Array.from(map.values()).filter((a) => !deletedIds.has(a.id));
  }, [sessionUser, rentals, deletedIds]);

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
    setDeletedIds((prev) => new Set([...prev, id]));
    setConfirmDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="border border-line bg-white/40 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink">Akun Pengguna</h1>
          <span className="rounded-full bg-ridge px-3 py-1 font-mono text-xs text-fog">
            Panel Admin
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/65">
          Daftar akun peminjam yang terdaftar dari sesi autentikasi dan transaksi sewa live di database.
        </p>
        <input
          type="text"
          placeholder="Cari nama atau email..."
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
                          Batal
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
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink/50">
                  {query
                    ? "Tidak ada akun yang cocok dengan pencarian."
                    : "Belum ada akun pengguna atau transaksi tercatat."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
