"use client";

export default function ApprovalFilterBar({
  tabs,
  activeTab,
  onSelectTab,
  search,
  onSearchChange,
}) {
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-4 sm:p-5 shadow-sm backdrop-blur-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  active
                    ? "bg-ridge text-fog shadow-sm"
                    : "bg-paper/50 text-ink/70 hover:bg-paper hover:text-ink border border-line/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                    active ? "bg-white/20 text-fog" : "bg-black/5 text-ink/60"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari ID, peminjam, alat, WA..."
            className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-xs text-ink placeholder:text-ink/40 outline-none focus:border-ridge focus:bg-white transition-all"
          />
        </div>
      </div>
    </div>
  );
}
