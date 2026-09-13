"use client";

import RequireAuth from "@/app/components/shared/RequireAuth";
import DashboardSidebar from "@/app/components/user/DashboardSidebar";
import CatalogView from "@/app/components/shared/CatalogView";

export default function UserKatalogPage() {
  return (
    <RequireAuth allow={["user"]}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:flex-row">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 space-y-6">
          <div className="border border-line bg-white/40 p-6">
            <h1 className="font-display text-2xl font-bold text-ink">Katalog Alat</h1>
            <p className="mt-2 text-sm text-ink/65">
              Cari dan bandingkan alat pendakian yang tersedia untuk disewa.
            </p>
          </div>
          <CatalogView />
        </main>
      </div>
    </RequireAuth>
  );
}
