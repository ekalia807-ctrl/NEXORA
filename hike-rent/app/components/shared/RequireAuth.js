"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/useRole";

// allow: opsional, misal ["admin"] kalau cuma admin yang boleh masuk,
// atau ["user"] kalau cuma peminjam. Kalau role sudah login tapi gak
// cocok sama `allow`, arahkan ke home area role itu sendiri (bukan
// selalu "/dashboard"), supaya gak infinite-redirect antara area
// admin <-> peminjam.
export default function RequireAuth({ children, allow }) {
  const role = useRole();
  const router = useRouter();

  const allowed = role && (!allow || allow.includes(role));
  const roleHome = role === "admin" ? "/admin/dashboard" : "/user/dashboard";

  useEffect(() => {
    if (!allowed) {
      if (role) {
        router.replace(roleHome);
      } else {
        const currentPath =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "";
        const loginUrl =
          currentPath && currentPath !== "/"
            ? `/login?redirect=${encodeURIComponent(currentPath)}`
            : "/login";
        router.replace(loginUrl);
      }
    }
  }, [allowed, role, roleHome, router]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center text-sm text-ink/50">
        Mengalihkan ke halaman masuk...
      </div>
    );
  }

  return children;
}