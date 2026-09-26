"use client";

import RequireAuth from "@/components/shared/RequireAuth";

// Semua rute di bawah /admin/* wajib lewat sini.
// RequireAuth allow=["admin"] memproteksi seluruh area admin dari akses selain admin.
// Navigasi halaman admin kini terpusat di menu NavBar, selaras dengan tata letak pengguna.
export default function AdminLayout({ children }) {
  return (
    <RequireAuth allow={["admin"]}>
      <div className="min-h-[calc(100vh-4rem)] bg-[#f3f1ea] text-ink">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {children}
        </div>
      </div>
    </RequireAuth>
  );
}

