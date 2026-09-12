"use client";

import RequireAuth from "@/app/components/shared/RequireAuth";
import AdminSidebar from "@/app/components/admin/AdminSidebar";

// Semua rute di bawah /admin/* wajib lewat sini dulu.
// RequireAuth allow=["admin"] artinya: kalau belum login -> /login,
// kalau login tapi role "user" -> otomatis dilempar ke /dashboard (lihat RequireAuth.js).
export default function AdminLayout({ children }) {
  return (
    <RequireAuth allow={["admin"]}>
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <AdminSidebar />
          <main className="min-h-[70vh] w-full">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
