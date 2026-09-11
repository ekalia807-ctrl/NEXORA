"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/useRole";

// allow: opsional, misal ["admin"] kalau cuma admin yang boleh masuk
export default function RequireAuth({ children, allow }) {
  const role = useRole();
  const router = useRouter();

  const allowed = role && (!allow || allow.includes(role));

  useEffect(() => {
    if (!allowed) {
      router.replace(role ? "/dashboard" : "/login");
    }
  }, [allowed, role, router]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center text-sm text-ink/50">
        Mengalihkan ke halaman masuk...
      </div>
    );
  }

  return children;
}