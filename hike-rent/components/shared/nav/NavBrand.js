"use client";

import Link from "next/link";

export const menuGuest = [
  { href: "/", label: "Beranda", desc: "Halaman utama HIKERENT" },
  { href: "/katalog", label: "Katalog Alat", desc: "Jelajah peralatan & cek ketersediaan" },
];

export const menuUser = [
  { href: "/user/katalog", label: "Katalog Alat" },
  { href: "/", label: "Beranda" },
  { href: "/user/rekomendasi", label: "Rekomendasi Rombongan" },
  { href: "/user/wishlist", label: "Wishlist Saya" },
  { href: "/user/kalkulator", label: "Kalkulator Biaya" },
  { href: "/user/checkout", label: "Checkout Sewa" },
  { href: "/user/riwayat", label: "Riwayat & Status" },
  { href: "/user/profil", label: "Profil Saya" },
];

export const menuAdmin = [
  { href: "/admin/dashboard", label: "Dashboard Admin" },
  { href: "/admin/approval", label: "Approval Pengajuan" },
  { href: "/admin/katalog", label: "Katalog Alat" },
  { href: "/admin/packages", label: "Paket Bundling" },
  { href: "/admin/accounts", label: "Akun Pengguna" },
  { href: "/admin/pendapatan", label: "Rekap Penghasilan" },
  { href: "/admin/reports", label: "Laporan Sistem" },
  { href: "/admin/history", label: "Histori Peminjaman" },
];

export function MountainIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M2 20 9 7l4 7 2.5-4L22 20H2Z" />
    </svg>
  );
}

export function ArrowBackIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function Brand({ onClick, role }) {
  const href = role === "admin" ? "/admin/dashboard" : "/";
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ridge text-amber">
        <MountainIcon />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-ink">HIKERENT</span>
    </Link>
  );
}
