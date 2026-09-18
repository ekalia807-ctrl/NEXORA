"use client";

import { useState } from "react";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hmif.if.unram.ac.id/api/v2";
const PROJECT = process.env.NEXT_PUBLIC_PROJECT_ID || "hikerent";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "pk_hikerent_da4b2b680ab481f4";

// Modul 1: Autentikasi & Akses Key
const AUTH_ENDPOINTS = [
  {
    id: "login",
    method: "POST",
    path: "/hikerent/login",
    desc: "Autentikasi akun dan login untuk project HikeRent. Mengembalikan token Bearer sesi serta API Key unik kelompok.",
  },
  {
    id: "register",
    method: "POST",
    path: "/hikerent/register",
    desc: "Mendaftarkan akun baru untuk project HikeRent (publik, tanpa API key). Field nama bebas pakai nama / name / nama_lengkap. Setelah register, login untuk mendapatkan token & API Key.",
  },
  {
    id: "logout",
    method: "POST",
    path: "/hikerent/logout",
    desc: "Mengakhiri sesi autentikasi dan membatalkan token untuk project HikeRent.",
  },
  {
    id: "me",
    method: "GET",
    path: "/hikerent/me",
    desc: "Memeriksa validitas sesi JWT login dan mengambil profil user aktif yang sedang login. Memerlukan header Authorization: Bearer .",
  },
  {
    id: "key",
    method: "GET",
    path: "/hikerent/key",
    desc: "Mengambil Akses Key (API Key) unik dari database khusus untuk project HikeRent.",
  },
];

// Modul 2: Kategori Gear
const CATEGORIES_ENDPOINTS = [
  {
    id: "cat-list",
    method: "GET",
    path: "/hikerent/categories",
    desc: "Mengambil daftar seluruh kategori gear",
  },
  {
    id: "cat-detail",
    method: "GET",
    path: "/hikerent/categories/{id}",
    desc: "Mengambil detail single kategori gear berdasarkan ID",
  },
  {
    id: "cat-create",
    method: "POST",
    path: "/hikerent/categories",
    desc: "Membuat data baru kategori gear",
  },
  {
    id: "cat-update",
    method: "PUT",
    path: "/hikerent/categories/{id}",
    desc: "Memperbarui data kategori gear berdasarkan ID",
  },
  {
    id: "cat-delete",
    method: "DELETE",
    path: "/hikerent/categories/{id}",
    desc: "Menghapus data kategori gear berdasarkan ID",
  },
];

// Modul 3: Gear Items (Peralatan)
const GEAR_ENDPOINTS = [
  {
    id: "gear-list",
    method: "GET",
    path: "/hikerent/gear",
    desc: "Mengambil daftar seluruh gear items (peralatan)",
  },
  {
    id: "gear-detail",
    method: "GET",
    path: "/hikerent/gear/{id}",
    desc: "Mengambil detail single gear items (peralatan) berdasarkan ID",
  },
  {
    id: "gear-create",
    method: "POST",
    path: "/hikerent/gear",
    desc: "Membuat data baru gear items (peralatan)",
  },
  {
    id: "gear-update",
    method: "PUT",
    path: "/hikerent/gear/{id}",
    desc: "Memperbarui data gear items (peralatan) berdasarkan ID",
  },
  {
    id: "gear-delete",
    method: "DELETE",
    path: "/hikerent/gear/{id}",
    desc: "Menghapus data gear items (peralatan) berdasarkan ID",
  },
];

// Modul 4: Transaksi Rental HikeRent
const RENTALS_ENDPOINTS = [
  {
    id: "rentals-list",
    method: "GET",
    path: "/hikerent/rentals",
    desc: "Mengambil daftar seluruh transaksi rental hikerent",
  },
  {
    id: "rentals-detail",
    method: "GET",
    path: "/hikerent/rentals/{id}",
    desc: "Mengambil detail single transaksi rental hikerent berdasarkan ID",
  },
  {
    id: "rentals-create",
    method: "POST",
    path: "/hikerent/rentals",
    desc: "Membuat data baru transaksi rental hikerent",
  },
  {
    id: "rentals-update",
    method: "PUT",
    path: "/hikerent/rentals/{id}",
    desc: "Memperbarui data transaksi rental hikerent berdasarkan ID",
  },
  {
    id: "rentals-delete",
    method: "DELETE",
    path: "/hikerent/rentals/{id}",
    desc: "Menghapus data transaksi rental hikerent berdasarkan ID",
  },
];

// Modul 5: Detail Rental Items
const RENTAL_ITEMS_ENDPOINTS = [
  {
    id: "items-list",
    method: "GET",
    path: "/hikerent/rental_items",
    desc: "Mengambil daftar seluruh detail rental items",
  },
  {
    id: "items-detail",
    method: "GET",
    path: "/hikerent/rental_items/{id}",
    desc: "Mengambil detail single detail rental items berdasarkan ID",
  },
  {
    id: "items-create",
    method: "POST",
    path: "/hikerent/rental_items",
    desc: "Membuat data baru detail rental items",
  },
  {
    id: "items-update",
    method: "PUT",
    path: "/hikerent/rental_items/{id}",
    desc: "Memperbarui data detail rental items berdasarkan ID",
  },
  {
    id: "items-delete",
    method: "DELETE",
    path: "/hikerent/rental_items/{id}",
    desc: "Menghapus data detail rental items berdasarkan ID",
  },
];

// Modul 6: Paket Pendakian
const PACKAGES_ENDPOINTS = [
  {
    id: "pkg-list",
    method: "GET",
    path: "/hikerent/packages",
    desc: "Mengambil daftar seluruh paket pendakian",
  },
  {
    id: "pkg-detail",
    method: "GET",
    path: "/hikerent/packages/{id}",
    desc: "Mengambil detail single paket pendakian berdasarkan ID",
  },
  {
    id: "pkg-create",
    method: "POST",
    path: "/hikerent/packages",
    desc: "Membuat data baru paket pendakian",
  },
  {
    id: "pkg-update",
    method: "PUT",
    path: "/hikerent/packages/{id}",
    desc: "Memperbarui data paket pendakian berdasarkan ID",
  },
  {
    id: "pkg-delete",
    method: "DELETE",
    path: "/hikerent/packages/{id}",
    desc: "Menghapus data paket pendakian berdasarkan ID",
  },
];

// Modul 7: Item Dalam Paket
const PACKAGE_ITEMS_ENDPOINTS = [
  {
    id: "pkg-item-list",
    method: "GET",
    path: "/hikerent/package_items",
    desc: "Mengambil daftar seluruh item dalam paket",
  },
  {
    id: "pkg-item-detail",
    method: "GET",
    path: "/hikerent/package_items/{id}",
    desc: "Mengambil detail single item dalam paket berdasarkan ID",
  },
  {
    id: "pkg-item-create",
    method: "POST",
    path: "/hikerent/package_items",
    desc: "Membuat data baru item dalam paket",
  },
  {
    id: "pkg-item-update",
    method: "PUT",
    path: "/hikerent/package_items/{id}",
    desc: "Memperbarui data item dalam paket berdasarkan ID",
  },
  {
    id: "pkg-item-delete",
    method: "DELETE",
    path: "/hikerent/package_items/{id}",
    desc: "Menghapus data item dalam paket berdasarkan ID",
  },
];

// Modul 8: Wishlist
const WISHLIST_ENDPOINTS = [
  {
    id: "wish-list",
    method: "GET",
    path: "/hikerent/wishlist",
    desc: "Mengambil daftar seluruh wishlist",
  },
  {
    id: "wish-detail",
    method: "GET",
    path: "/hikerent/wishlist/{id}",
    desc: "Mengambil detail single wishlist berdasarkan ID",
  },
  {
    id: "wish-create",
    method: "POST",
    path: "/hikerent/wishlist",
    desc: "Membuat data baru wishlist",
  },
  {
    id: "wish-update",
    method: "PUT",
    path: "/hikerent/wishlist/{id}",
    desc: "Memperbarui data wishlist berdasarkan ID",
  },
  {
    id: "wish-delete",
    method: "DELETE",
    path: "/hikerent/wishlist/{id}",
    desc: "Menghapus data wishlist berdasarkan ID",
  },
];

// Modul 9: Status History Logs
const RENTAL_STATUS_LOGS_ENDPOINTS = [
  {
    id: "logs-list",
    method: "GET",
    path: "/hikerent/rental_status_logs",
    desc: "Mengambil daftar seluruh status history logs",
  },
  {
    id: "logs-detail",
    method: "GET",
    path: "/hikerent/rental_status_logs/{id}",
    desc: "Mengambil detail single status history logs berdasarkan ID",
  },
  {
    id: "logs-create",
    method: "POST",
    path: "/hikerent/rental_status_logs",
    desc: "Membuat data baru status history logs",
  },
  {
    id: "logs-update",
    method: "PUT",
    path: "/hikerent/rental_status_logs/{id}",
    desc: "Memperbarui data status history logs berdasarkan ID",
  },
  {
    id: "logs-delete",
    method: "DELETE",
    path: "/hikerent/rental_status_logs/{id}",
    desc: "Menghapus data status history logs berdasarkan ID",
  },
];

export default function ApiTestPage() {
  const [activeToken, setActiveToken] = useState("");
  const [latestApiKey, setLatestApiKey] = useState(API_KEY);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  function renderMethodBadge(method) {
    if (method === "GET") {
      return (
        <span className="inline-flex items-center justify-center min-w-[64px] rounded-md border-2 border-zinc-950 bg-[#93C5FD] px-2.5 py-1 text-xs font-mono font-black text-zinc-950 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
          GET
        </span>
      );
    }
    if (method === "POST") {
      return (
        <span className="inline-flex items-center justify-center min-w-[64px] rounded-md border-2 border-zinc-950 bg-[#86EFAC] px-2.5 py-1 text-xs font-mono font-black text-zinc-950 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
          POST
        </span>
      );
    }
    if (method === "PUT") {
      return (
        <span className="inline-flex items-center justify-center min-w-[64px] rounded-md border-2 border-zinc-950 bg-[#FDE047] px-2.5 py-1 text-xs font-mono font-black text-zinc-950 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
          PUT
        </span>
      );
    }
    if (method === "DELETE") {
      return (
        <span className="inline-flex items-center justify-center min-w-[64px] rounded-md border-2 border-zinc-950 bg-[#FCA5A5] px-2.5 py-1 text-xs font-mono font-black text-zinc-950 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
          DELETE
        </span>
      );
    }
    return null;
  }

  async function testEndpoint(id, method, defaultPath) {
    setLoading((prev) => ({ ...prev, [id]: true }));
    const startTime = performance.now();

    try {
      let endpointPath = defaultPath.replace("/hikerent", "");
      endpointPath = endpointPath.replace("{id}", "1");

      const url = `${BASE_URL}/${PROJECT}${endpointPath}`;
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-API-Key": latestApiKey,
        },
      };

      if (activeToken) {
        options.headers["Authorization"] = `Bearer ${activeToken}`;
      }

      if (id === "register") {
        delete options.headers["X-API-Key"];
        options.body = JSON.stringify({
          name: "Tester Peminjam",
          email: `peminjam_${Date.now().toString().slice(-4)}@nexora.id`,
          password: "password123",
        });
      } else if (id === "login") {
        options.body = JSON.stringify({
          email: "admin@nexora.id",
          password: "password123",
        });
      } else if (id === "cat-create") {
        options.body = JSON.stringify({
          name: `Kategori Baru ${Date.now().toString().slice(-3)}`,
          slug: `kategori-${Date.now().toString().slice(-3)}`,
        });
      } else if (id === "cat-update") {
        options.body = JSON.stringify({
          name: "Tenda Camping Update",
          slug: "tenda-camping",
        });
      } else if (id === "gear-create") {
        options.body = JSON.stringify({
          category_id: 1,
          name: "Tenda Dome Borneo 2P",
          slug: `tenda-dome-2p-${Date.now().toString().slice(-3)}`,
          price_per_day: 35000,
          total_stock: 4,
          unit: "per hari",
        });
      } else if (id === "gear-update") {
        options.body = JSON.stringify({
          price_per_day: 45000,
          total_stock: 8,
          available_stock: 8,
          stock_status: "hijau",
        });
      } else if (id === "rentals-create") {
        options.body = JSON.stringify({
          user_id: 12,
          start_date: "2026-09-20",
          end_date: "2026-09-23",
          total_price: 135000,
          ktp_number: "5201012304950001",
          note: "Pengajuan sewa pendakian uji coba",
        });
      } else if (id === "rentals-update") {
        options.body = JSON.stringify({
          status: "diverifikasi",
        });
      } else if (id === "items-create") {
        options.body = JSON.stringify({
          rental_id: 1,
          gear_id: 1,
          quantity: 1,
          price_per_day: 45000,
          subtotal: 135000,
        });
      } else if (id === "items-update") {
        options.body = JSON.stringify({
          quantity: 2,
          subtotal: 270000,
        });
      } else if (id === "pkg-create") {
        options.body = JSON.stringify({
          name: `Paket Rinjani ${Date.now().toString().slice(-3)}`,
          description: "Paket bundling komplit rombongan pendakian.",
          target: "4 orang",
        });
      } else if (id === "pkg-update") {
        options.body = JSON.stringify({
          name: "Paket Rinjani Premium",
          description: "Perlengkapan ultralight.",
        });
      } else if (id === "pkg-item-create") {
        options.body = JSON.stringify({
          package_id: 1,
          gear_id: 1,
          quantity: 2,
        });
      } else if (id === "pkg-item-update") {
        options.body = JSON.stringify({
          quantity: 3,
        });
      } else if (id === "wish-create") {
        options.body = JSON.stringify({
          user_id: 13,
          gear_id: 1,
        });
      } else if (id === "wish-update") {
        options.body = JSON.stringify({
          gear_id: 2,
        });
      } else if (id === "logs-create") {
        options.body = JSON.stringify({
          rental_id: 1,
          status: "diverifikasi",
          notes: "Verifikasi dokumen KTP peminjam lolos.",
          changed_by: "Admin Rental",
        });
      } else if (id === "logs-update") {
        options.body = JSON.stringify({
          notes: "Catatan audit log disesuaikan.",
        });
      }

      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({}));
      const duration = Math.round(performance.now() - startTime);

      if (data.token) setActiveToken(data.token);
      if (data.api_key) setLatestApiKey(data.api_key);

      setResults((prev) => ({
        ...prev,
        [id]: {
          status: res.status,
          statusText: res.statusText || (res.ok ? "OK" : "Status " + res.status),
          duration,
          data,
          success: res.ok,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      setResults((prev) => ({
        ...prev,
        [id]: {
          status: "ERR",
          statusText: err.message,
          duration,
          data: { error: err.message },
          success: false,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  function renderCard(title, badgeUri, icon, endpoints) {
    return (
      <div className="overflow-hidden rounded-2xl border-2 border-zinc-950 bg-[#FAF9F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-10">
        <div className="flex items-center gap-3 border-b-2 border-zinc-950 bg-[#F4F2EA] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none font-bold text-zinc-950">{icon}</span>
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 font-display">
              {title}
            </h2>
          </div>
          <span className="rounded-full border-2 border-zinc-950 bg-[#67E8F9] px-3 py-0.5 text-xs sm:text-sm font-mono font-bold text-zinc-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            {badgeUri}
          </span>
        </div>

        <div className="divide-y-2 divide-zinc-950">
          {endpoints.map((ep) => {
            const res = results[ep.id];
            const isLoad = loading[ep.id];

            return (
              <div key={ep.id} className="p-4 sm:p-5 hover:bg-white/40 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1">
                    {renderMethodBadge(ep.method)}

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="text-base font-bold font-mono text-zinc-950">
                          {ep.path}
                        </code>
                        {res && (
                          <span
                            className={`rounded border px-2 py-0.5 text-[11px] font-mono font-bold ${
                              res.success
                                ? "border-emerald-600 bg-emerald-100 text-emerald-800"
                                : "border-red-600 bg-red-100 text-red-800"
                            }`}
                          >
                            HTTP {res.status} ({res.duration}ms)
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-700">
                        {ep.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start pl-16 md:pl-0">
                    <button
                      onClick={() => testEndpoint(ep.id, ep.method, ep.path)}
                      disabled={isLoad}
                      className={`rounded-lg border-2 border-zinc-950 px-3.5 py-1.5 text-xs font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                        isLoad
                          ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                          : "bg-white hover:bg-zinc-100 text-zinc-950"
                      }`}
                    >
                      {isLoad ? "Menguji..." : "Uji Endpoint"}
                    </button>
                  </div>
                </div>

                {res && (
                  <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-900 p-4 text-zinc-100 font-mono text-xs overflow-x-auto">
                    <div className="flex items-center justify-between border-b border-zinc-700 pb-2 mb-2">
                      <span className="text-zinc-400">Response Payload • {res.timestamp}</span>
                      <span className={res.success ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        Status: {res.status} {res.statusText}
                      </span>
                    </div>
                    <pre className="text-emerald-300 whitespace-pre-wrap leading-tight">
                      {JSON.stringify(res.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-300 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-zinc-500">
              HMIF UNRAM API Gateway v2 • HikeRent
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">
            Pusat Pengujian & Spesifikasi API NEXORA
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Review interaktif arsitektur backend NEXORA: Autentikasi, Kategori, Gear, Rental, & Paket Pendakian.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
          >
            ← Beranda NEXORA
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Halaman Login →
          </Link>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-zinc-700">Status Sesi Pengujian:</span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono font-medium ${
                activeToken
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-zinc-100 text-zinc-600 border border-zinc-200"
              }`}
            >
              {activeToken ? "JWT Token Aktif (Tersimpan)" : "Belum Ada Token"}
            </span>
            <span className="font-mono text-zinc-500 hidden md:inline">
              API-Key: <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">{latestApiKey.slice(0, 15)}...</code>
            </span>
          </div>

          {activeToken && (
            <button
              onClick={() => {
                setActiveToken("");
                setResults({});
              }}
              className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
            >
              Reset Sesi
            </button>
          )}
        </div>
      </div>

      {/* CARD 1: Autentikasi & Akses Key */}
      {renderCard("Autentikasi & Akses Key", "/hikerent/auth", "≡", AUTH_ENDPOINTS)}

      {/* CARD 2: Kategori Gear */}
      {renderCard("Kategori Gear", "/hikerent/categories", "≡", CATEGORIES_ENDPOINTS)}

      {/* CARD 3: Gear Items (Peralatan) */}
      {renderCard("Gear Items (Peralatan)", "/hikerent/gear", "≡", GEAR_ENDPOINTS)}

      {/* CARD 4: Transaksi Rental HikeRent */}
      {renderCard("Transaksi Rental HikeRent", "/hikerent/rentals", "≡", RENTALS_ENDPOINTS)}

      {/* CARD 5: Detail Rental Items */}
      {renderCard("Detail Rental Items", "/hikerent/rental_items", "≡", RENTAL_ITEMS_ENDPOINTS)}

      {/* CARD 6: Paket Pendakian */}
      {renderCard("Paket Pendakian", "/hikerent/packages", "≡", PACKAGES_ENDPOINTS)}

      {/* CARD 7: Item Dalam Paket */}
      {renderCard("Item Dalam Paket", "/hikerent/package_items", "≡", PACKAGE_ITEMS_ENDPOINTS)}

      {/* CARD 8: Wishlist */}
      {renderCard("Wishlist", "/hikerent/wishlist", "≡", WISHLIST_ENDPOINTS)}

      {/* CARD 9: Status History Logs */}
      {renderCard("Status History Logs", "/hikerent/rental_status_logs", "≡", RENTAL_STATUS_LOGS_ENDPOINTS)}
    </main>
  );
}
