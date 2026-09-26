"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AUTH_ENDPOINTS,
  CATEGORIES_ENDPOINTS,
  GEAR_ENDPOINTS,
  RENTALS_ENDPOINTS,
  RENTAL_ITEMS_ENDPOINTS,
  PACKAGES_ENDPOINTS,
  PACKAGE_ITEMS_ENDPOINTS,
  WISHLIST_ENDPOINTS,
  RENTAL_STATUS_LOGS_ENDPOINTS,
} from "./constants/endpointDefinitions";
import { buildTestRequestOptions } from "./utils/apiTestPayloads";
import EndpointSection from "./components/EndpointSection";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hmif.if.unram.ac.id/api/v3";
const PROJECT = process.env.NEXT_PUBLIC_PROJECT_ID || "hikerent";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "pk_hikerent_da4b2b680ab481f4";

export default function ApiTestPage() {
  const [activeToken, setActiveToken] = useState("");
  const [latestApiKey, setLatestApiKey] = useState(API_KEY);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  async function testEndpoint(id, method, defaultPath) {
    setLoading((prev) => ({ ...prev, [id]: true }));
    const startTime = performance.now();

    try {
      const { url, options } = buildTestRequestOptions({
        id,
        method,
        defaultPath,
        activeToken,
        latestApiKey,
        baseUrl: BASE_URL,
        projectId: PROJECT,
      });

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

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-300 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-zinc-500">
              HMIF UNRAM API Gateway v3 • HikeRent
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

      <EndpointSection
        title="Autentikasi & Akses Key"
        badgeUri="/hikerent/auth"
        icon="≡"
        endpoints={AUTH_ENDPOINTS}
        results={results}
        loading={loading}
        onTestEndpoint={testEndpoint}
      />

      <EndpointSection
        title="Kategori Gear"
        badgeUri="/hikerent/categories"
        icon="≡"
        endpoints={CATEGORIES_ENDPOINTS}
        results={results}
        loading={loading}
        onTestEndpoint={testEndpoint}
      />

      <EndpointSection
        title="Gear Items (Peralatan)"
        badgeUri="/hikerent/gear"
        icon="≡"
        endpoints={GEAR_ENDPOINTS}
        results={results}
        loading={loading}
        onTestEndpoint={testEndpoint}
      />

      <EndpointSection
        title="Transaksi Rental HikeRent"
        badgeUri="/hikerent/rentals"
        icon="≡"
        endpoints={RENTALS_ENDPOINTS}
        results={results}
        loading={loading}
        onTestEndpoint={testEndpoint}
      />

      <EndpointSection
        title="Detail Rental Items"
        badgeUri="/hikerent/rental_items"
        icon="≡"
        endpoints={RENTAL_ITEMS_ENDPOINTS}
        results={results}
        loading={loading}
        onTestEndpoint={testEndpoint}
      />

      <EndpointSection
        title="Paket Pendakian"
        badgeUri="/hikerent/packages"
        icon="≡"
        endpoints={PACKAGES_ENDPOINTS}
        results={results}
        loading={loading}
        onTestEndpoint={testEndpoint}
      />

      <EndpointSection
        title="Item Dalam Paket"
        badgeUri="/hikerent/package_items"
        icon="≡"
        endpoints={PACKAGE_ITEMS_ENDPOINTS}
        results={results}
        loading={loading}
        onTestEndpoint={testEndpoint}
      />

      <EndpointSection
        title="Wishlist"
        badgeUri="/hikerent/wishlist"
        icon="≡"
        endpoints={WISHLIST_ENDPOINTS}
        results={results}
        loading={loading}
        onTestEndpoint={testEndpoint}
      />

      <EndpointSection
        title="Status History Logs"
        badgeUri="/hikerent/rental_status_logs"
        icon="≡"
        endpoints={RENTAL_STATUS_LOGS_ENDPOINTS}
        results={results}
        loading={loading}
        onTestEndpoint={testEndpoint}
      />
    </main>
  );
}
