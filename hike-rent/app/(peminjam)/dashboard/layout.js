"use client";

import RequireAuth from "@/app/components/shared/RequireAuth";
import DashboardSidebar from "@/app/components/peminjam/DashboardSidebar";

// Layout khusus area peminjam (bukan admin). Dibatasi ke role "user"
// lewat RequireAuth supaya admin diarahkan ke /admin/dashboard, bukan ke sini.
export default function DashboardLayout({ children }) {
  return (
    <RequireAuth allow={["user"]}>
      <div className="mx-auto max-w-7xl sm:px-8">
        <div className="flex flex-col md:flex-row md:items-start">
          <DashboardSidebar />
          <main className="min-h-[60vh] flex-1 px-6 py-8 sm:px-0 md:px-8 md:py-12">
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
