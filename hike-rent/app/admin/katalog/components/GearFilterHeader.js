"use client";

export default function GearFilterHeader({
  syncing,
  handleManualSync,
  openAddForm,
  activeCategories,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 lg:p-8 shadow-sm backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold">
              Panel Admin
            </span>
            <span className="h-1 w-1 rounded-full bg-ink/30" />
            <span className="font-mono text-[11px] text-ink/50">Inventaris Database (hikerent/gear)</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Katalog Peralatan Pendakian
          </h1>
          <p className="mt-1.5 text-sm text-ink/65 max-w-2xl">
            Kelola inventaris peralatan pendakian. Formulir ini terhubung 100% dengan atribut tabel{" "}
            <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs font-semibold text-ridge">
              hikerent/gear
            </code>{" "}
            di basis data backend.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={syncing}
            onClick={handleManualSync}
            className="shrink-0 rounded-xl border border-line bg-white/70 px-4 py-2.5 text-xs font-semibold text-ink shadow-sm hover:border-ridge/40 hover:bg-white transition-all disabled:opacity-50"
          >
            {syncing ? "Menyinkronkan..." : "↻ Sinkronkan Data"}
          </button>
          <button
            type="button"
            onClick={openAddForm}
            className="shrink-0 rounded-xl bg-ridge px-5 py-2.5 text-sm font-semibold text-fog hover:bg-ink shadow-sm transition-all"
          >
            + Tambah Alat Baru
          </button>
        </div>
      </div>

      {/* Baris Filter & Pencarian */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-ink/50">Kategori:</span>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter("Semua")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              selectedCategoryFilter === "Semua"
                ? "bg-ridge text-fog shadow-xs"
                : "bg-paper/70 text-ink/70 hover:bg-paper"
            }`}
          >
            Semua
          </button>
          {activeCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategoryFilter(c.name)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategoryFilter.toLowerCase() === c.name.toLowerCase()
                  ? "bg-ridge text-fog shadow-xs"
                  : "bg-paper/70 text-ink/70 hover:bg-paper"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="🔍 Cari nama alat atau slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-1.5 text-xs text-ink outline-none transition-all focus:border-ridge focus:bg-white focus:ring-2 focus:ring-ridge/10"
          />
        </div>
      </div>
    </div>
  );
}
