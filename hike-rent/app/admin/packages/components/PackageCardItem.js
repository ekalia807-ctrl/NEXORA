"use client";

export default function PackageCardItem({
  pkg,
  packageItems,
  gear,
  isSelected,
  onToggleSelect,
  onDeletePackage,
  itemForm,
  setItemForm,
  onAddItem,
  onRemoveItem,
}) {
  const itemsInPkg = packageItems.filter((it) => it.package_id === pkg.id);

  return (
    <div className="rounded-2xl border border-line bg-white/70 p-5 sm:p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs rounded-md bg-ridge/10 px-1.5 py-0.5 text-ridge border border-ridge/20 font-semibold">
              #{pkg.id}
            </span>
            <h3 className="font-display text-base font-bold text-ink">{pkg.name}</h3>
            {pkg.target && (
              <span className="rounded-full bg-amber/20 text-amber px-2.5 py-0.5 font-mono text-[11px] font-semibold">
                {pkg.target}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ink/65 leading-relaxed">
            {pkg.description || "Tidak ada rincian deskripsi."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleSelect}
            className="rounded-lg border border-line bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink hover:border-ridge hover:bg-white shadow-xs transition-all"
          >
            {isSelected ? "Tutup Kelola" : "+ Tambah Alat"}
          </button>
          <button
            type="button"
            onClick={() => onDeletePackage(pkg.id)}
            className="rounded-lg border border-alert/30 px-3 py-1.5 text-xs font-semibold text-alert hover:bg-alert hover:text-fog shadow-xs transition-all"
          >
            Hapus
          </button>
        </div>
      </div>

      {/* Form Tambah Item jika paket dipilih */}
      {isSelected && (
        <form
          onSubmit={onAddItem}
          className="mt-4 rounded-xl border border-line/70 bg-paper/60 p-4 flex flex-wrap items-end gap-3 shadow-inner"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
              Pilih Alat Inventaris
            </label>
            <select
              value={itemForm.gear_id}
              onChange={(e) => setItemForm({ ...itemForm, gear_id: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-ridge"
            >
              {gear.map((g) => {
                const val = g.backendId || (Number(g.id) ? Number(g.id) : g.id);
                return (
                  <option key={g.id} value={val}>
                    {g.name} {g.backendId ? `(#${g.backendId})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="w-24">
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink/70">
              Jumlah
            </label>
            <input
              type="number"
              min={1}
              value={itemForm.quantity}
              onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-ridge font-mono"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-ridge px-4 py-2 text-xs font-semibold text-fog hover:bg-ink shadow-sm transition-all"
          >
            Sematkan
          </button>
        </form>
      )}

      {/* Rincian Komposisi Alat dalam Paket */}
      <div className="mt-4 border-t border-line/60 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">
          Komposisi Alat dalam Paket ({itemsInPkg.length} Item):
        </p>
        {itemsInPkg.length === 0 ? (
          <p className="mt-1 text-xs text-ink/40 italic">
            Belum ada alat di paket ini. Klik &quot;+ Tambah Alat&quot; untuk menyematkan peralatan pendakian.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-line/40 text-xs">
            {itemsInPkg.map((it) => (
              <li key={it.id} className="py-2 flex items-center justify-between">
                <span className="font-medium text-ink flex items-center gap-1.5">
                  <span className="text-amber">●</span>
                  <span>{it.gear_name || `Alat #${it.gear_id}`}</span>
                  <span className="font-mono text-ink/60">× {it.quantity} unit</span>
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveItem(it.id)}
                  className="text-xs font-medium text-alert hover:underline"
                >
                  Keluarkan
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
