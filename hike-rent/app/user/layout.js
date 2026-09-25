"use client";

import { usePathname } from "next/navigation";
import { useRole } from "@/lib/useRole";
import RequireAuth from "@/components/shared/RequireAuth";
import DashboardSidebar from "@/components/user/DashboardSidebar";

// Layout area user.
// Khusus rute /user/katalog dapat diakses oleh Tamu (guest) untuk melihat ketersediaan alat.
// Rute lainnya atau tindakan checkout wajib login sebagai "user".
// Seluruh navigasi user dipusatkan pada satu sidebar samping yang responsif (desktop fixed, mobile collapsible).
export default function UserLayout({ children }) {
  const pathname = usePathname();
  const role = useRole();

  const isPublicCatalog = pathname === "/user/katalog";

  // Jika pengunjung adalah tamu di /user/katalog, berikan akses langsung tanpa sidebar user
  if (isPublicCatalog && !role) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <main className="min-h-[70vh] w-full">{children}</main>
      </div>
    );
  }

  // Pengguna terautentikasi (role user): tampilkan sidebar konsisten di seluruh /user/*
  return (
    <RequireAuth allow={["user"]}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <DashboardSidebar />
          <div className="min-w-0 flex-1 w-full">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
