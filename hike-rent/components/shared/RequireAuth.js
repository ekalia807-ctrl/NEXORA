"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/useRole";
import { getMeAction } from "@/app/actions/auth";

export default function RequireAuth({ children, allow }) {
  const role = useRole();
  const router = useRouter();
  const [checkingServer, setCheckingServer] = useState(!role);

  // Jika di localStorage belum ada role, coba sinkronisasi dari server session cookie
  useEffect(() => {
    let isMounted = true;
    async function syncSession() {
      if (!role) {
        try {
          const res = await getMeAction();
          if (res?.success && res.data) {
            const userRole = res.data.role || "user";
            localStorage.setItem("role", userRole);
            localStorage.setItem("user", JSON.stringify(res.data));
            window.dispatchEvent(new Event("role-changed"));
            if (isMounted) setCheckingServer(false);
            return;
          }
        } catch {}
      }
      if (isMounted) setCheckingServer(false);
    }

    syncSession();
    return () => {
      isMounted = false;
    };
  }, [role]);

  const allowed = role && (!allow || allow.includes(role));
  const roleHome = role === "admin" ? "/admin/dashboard" : "/user/dashboard";

  useEffect(() => {
    if (checkingServer) return;

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
  }, [allowed, role, roleHome, router, checkingServer]);

  if (checkingServer) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-ink/60">
          <svg className="h-5 w-5 animate-spin text-ridge" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Memverifikasi sesi aman...</span>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return children;
}