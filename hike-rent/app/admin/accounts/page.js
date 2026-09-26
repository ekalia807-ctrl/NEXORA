"use client";

import { useEffect, useMemo, useState } from "react";
import { useRentalsSync } from "@/lib/stores/rentalsStore";

const API_BASE = "https://hmif.if.unram.ac.id/api/v3/hikerent";
const API_KEY = "pk_hikerent_da4b2b680ab481f4";

export default function AdminAccountsPage() {
  const rentals = useRentalsSync();
  const [dbUsers, setDbUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Fetch data akun pengguna riil dari tabel users backend
  useEffect(() => {
    let isMounted = true;
    async function loadUsers() {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/users`, {
          headers: {
            "X-API-Key": API_KEY,
            Accept: "application/json",
          },
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || data.value || [];
        if (isMounted) {
          setDbUsers(list);
        }
      } catch (err) {
        console.error("Gagal memuat pengguna dari backend:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const accounts = useMemo(() => {
    return dbUsers
      .map((u) => {
        const totalSewa = rentals.filter(
          (r) => Number(r.user_id) === Number(u.id)
        ).length;

        return {
          rawId: u.id,
          id: `USR-${String(u.id).padStart(3, "0")}`,
          name: u.name || "Pengguna",
          email: u.email || "-",
          whatsapp: u.phone ? (u.phone.startsWith("0") ? "62" + u.phone.slice(1) : u.phone) : "-",
          role: u.role || "user",
          joined: u.created_at ? u.created_at.split(" ")[0] : "-",
          totalSewa,
          status: "Aktif",
        };
      })
      .filter((a) => !deletedIds.has(a.id));
  }, [dbUsers, rentals, deletedIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
    );
  }, [accounts, query]);

  async function handleDelete(id, rawId) {
    try {
      if (rawId) {
        await fetch(`${API_BASE}/users/${rawId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
            "X-HTTP-Method-Override": "DELETE",
          },
        });
      }
    } catch (err) {
      console.error("Gagal menghapus user di backend:", err);
    }
    setDeletedIds((prev) => new Set([...prev, id]));
    setDbUsers((prev) => prev.filter((u) => u.id !== rawId));
    setConfirmDeleteId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header Standar Admin */}
      <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 lg:p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
                Panel Admin
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              <span className="font-mono text-[11px] text-ink/50">Manajemen Pengguna</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Akun & Data Pengguna
            </h1>
            <p className="mt-1.5 text-sm text-ink/65 max-w-2xl">
              Daftar akun peminjam yang terdaftar dari sesi autentikasi dan transaksi sewa riil di basis data backend.
            </p>
          </div>
          <span className="rounded-full bg-ridge px-3.5 py-1 font-mono text-xs font-semibold text-fog shadow-sm">
            {filtered.length} Akun Terdaftar
          </span>
        </div>

        {/* Input Pencarian Terstandar */}
        <div className="mt-5 pt-4 border-t border-line/60">
          <input
            type="text"
            placeholder="🔍 Cari nama, email, atau ID pengguna..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-md rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          />
        </div>
      </div>

      {/* Tabel Akun Pengguna Terstandar */}
      <div className="rounded-2xl overflow-hidden border border-line bg-white/70 shadow-sm backdrop-blur-md">
        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper/50 text-xs uppercase font-semibold text-ink/60">
                <th className="px-5 py-3.5">Nama & Identitas</th>
                <th className="px-5 py-3.5">Kontak Pengguna</th>
                <th className="px-5 py-3.5">Bergabung</th>
                <th className="px-5 py-3.5">Total Sewa</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">{a.name}</span>
                      <span
                        className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                          a.role === "admin"
                            ? "bg-amber/20 text-amber border border-amber/30"
                            : "bg-paper text-ink/60 border border-line"
                        }`}
                      >
                        {a.role}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-ink/50 mt-0.5">{a.id}</div>
                  </td>
                  <td className="px-5 py-3.5 text-ink/75">
                    <div className="font-medium">{a.email}</div>
                    <div className="font-mono text-xs text-ink/50 mt-0.5">+{a.whatsapp}</div>
                  </td>
                  <td className="px-5 py-3.5 text-ink/70 font-mono text-xs">{a.joined}</td>
                  <td className="px-5 py-3.5 text-ink/80 font-mono font-semibold">{a.totalSewa}x</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        a.status === "Aktif"
                          ? "bg-moss/15 text-moss"
                          : "bg-line/70 text-ink/70"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-2">
                      {confirmDeleteId === a.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDelete(a.id, a.rawId)}
                            className="rounded-lg bg-alert px-3 py-1.5 text-xs font-semibold text-fog shadow-xs"
                          >
                            Yakin hapus?
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs text-ink/60"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(a.id)}
                          className="rounded-lg border border-alert/30 px-3 py-1.5 text-xs font-semibold text-alert hover:bg-alert hover:text-fog transition-all"
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
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-ink/50 font-mono">
                    {query
                      ? "Tidak ada akun yang cocok dengan kata kunci pencarian."
                      : "Belum ada akun pengguna atau riwayat sewa tercatat."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

