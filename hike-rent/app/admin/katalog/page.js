"use client";

import { useAdminCatalog } from "./hooks/useAdminCatalog";
import GearFilterHeader from "./components/GearFilterHeader";
import GearFormModal from "./components/GearFormModal";
import GearTable from "./components/GearTable";

export default function AdminCatalogPage() {
  const {
    form,
    setForm,
    editingId,
    confirmDeleteId,
    setConfirmDeleteId,
    showForm,
    toast,
    setToast,
    syncing,
    submitting,
    searchQuery,
    setSearchQuery,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    uploadingImage,
    fileInputRef,
    activeCategories,
    stockOptions,
    filteredGear,
    openAddForm,
    openEditForm,
    closeForm,
    handleNameChange,
    handleStockNumberChange,
    handleImageFileSelect,
    handleRemoveImage,
    handleManualSync,
    handleSubmit,
    handleDelete,
  } = useAdminCatalog();

  return (
    <div className="space-y-6">
      {/* Header Panel Admin & Filter Bar */}
      <GearFilterHeader
        syncing={syncing}
        handleManualSync={handleManualSync}
        openAddForm={openAddForm}
        activeCategories={activeCategories}
        selectedCategoryFilter={selectedCategoryFilter}
        setSelectedCategoryFilter={setSelectedCategoryFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {toast && (
        <div
          className={`rounded-xl border p-4 text-xs font-medium flex items-center justify-between shadow-sm ${
            toast.type === "success"
              ? "border-moss/40 bg-moss/10 text-moss"
              : toast.type === "info"
              ? "border-sky-500/40 bg-sky-500/10 text-sky-800"
              : "border-alert/40 bg-alert/10 text-alert"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            <span>
              {toast.type === "success" ? "✓ [Sukses]" : toast.type === "info" ? "ℹ [Info]" : "✕ [Peringatan]"}
            </span>
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="opacity-60 hover:opacity-100 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Formulir Tambah / Ubah Alat */}
      <GearFormModal
        showForm={showForm}
        form={form}
        setForm={setForm}
        editingId={editingId}
        submitting={submitting}
        uploadingImage={uploadingImage}
        fileInputRef={fileInputRef}
        activeCategories={activeCategories}
        stockOptions={stockOptions}
        handleNameChange={handleNameChange}
        handleStockNumberChange={handleStockNumberChange}
        handleImageFileSelect={handleImageFileSelect}
        handleRemoveImage={handleRemoveImage}
        handleSubmit={handleSubmit}
        closeForm={closeForm}
      />

      {/* Tabel Inventaris Terstandar */}
      <GearTable
        filteredGear={filteredGear}
        confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId}
        openEditForm={openEditForm}
        handleDelete={handleDelete}
        searchQuery={searchQuery}
        selectedCategoryFilter={selectedCategoryFilter}
      />
    </div>
  );
}
