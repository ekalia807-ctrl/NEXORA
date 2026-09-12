"use client";

import { usePathname } from "next/navigation";
import { useRole } from "@/lib/useRole";
import RequireAuth from "@/app/components/shared/RequireAuth";

// Layout area user.
// Khusus rute /user/katalog dapat diakses oleh Tamu (guest) untuk melihat ketersediaan alat.
// Rute lainnya atau tindakan checkout wajib login sebagai "user".
// Seluruh navigasi user sekarang dipusatkan pada satu menu samping (drawer) yang bisa dibuka/ditutup.
export default function UserLayout({ children }) {
  const pathname = usePathname();
  const role = useRole();

  const isPublicCatalog = pathname === "/user/katalog";

  // Jika pengunjung adalah tamu di /user/katalog, berikan akses langsung
  if (isPublicCatalog && !role) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <main className="min-h-[70vh] w-full">{children}</main>
      </div>
    );
  }

  // Pengguna terautentikasi (role user) atau halaman terproteksi lainnya
  return (
    <RequireAuth allow={["user"]}>
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <main className="min-h-[70vh] w-full">{children}</main>
      </div>
    </RequireAuth>
  );
}
