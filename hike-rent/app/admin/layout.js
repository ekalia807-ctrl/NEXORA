"use client";

import RequireAuth from "@/app/components/shared/RequireAuth";

// Semua rute di bawah /admin/* wajib lewat sini dulu.
// RequireAuth allow=["admin"] artinya: kalau belum login -> /login,
// kalau login tapi role "user" -> otomatis dilempar ke /user/dashboard.
// Seluruh navigasi admin sekarang dipusatkan pada satu menu samping (drawer) yang bisa dibuka/ditutup.
export default function AdminLayout({ children }) {
  return (
    <RequireAuth allow={["admin"]}>
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <main className="min-h-[70vh] w-full">{children}</main>
      </div>
    </RequireAuth>
  );
}
