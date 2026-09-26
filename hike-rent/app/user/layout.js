"use client";

import { usePathname } from "next/navigation";
import { useRole } from "@/lib/hooks/useRole";
import RequireAuth from "@/components/shared/RequireAuth";

// Layout area user.
// Navigasi terpusat pada menu Navbar, halaman membentang full-width menyesuaikan layar desktop.
export default function UserLayout({ children }) {
  const pathname = usePathname();
  const role = useRole();

  const isPublicCatalog = pathname === "/user/katalog";

  // Jika pengunjung adalah tamu di /user/katalog, berikan akses langsung
  if (isPublicCatalog && !role) {
    return (
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <main className="min-h-[70vh] w-full">{children}</main>
      </div>
    );
  }

  // Pengguna terautentikasi (role user): navigasi terpusat di navbar, konten full-width
  return (
    <RequireAuth allow={["user"]}>
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <main className="min-h-[70vh] w-full">{children}</main>
      </div>
    </RequireAuth>
  );
}
