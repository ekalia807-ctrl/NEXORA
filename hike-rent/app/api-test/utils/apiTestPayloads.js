export function buildTestRequestOptions({
  id,
  method,
  defaultPath,
  activeToken,
  latestApiKey,
  baseUrl,
  projectId,
}) {
  let endpointPath = defaultPath.replace("/hikerent", "");
  endpointPath = endpointPath.replace("{id}", "1");

  const url = `${baseUrl}/${projectId}${endpointPath}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": latestApiKey,
    },
  };

  if (activeToken) {
    options.headers["Authorization"] = `Bearer ${activeToken}`;
  }

  if (id === "register") {
    delete options.headers["X-API-Key"];
    options.body = JSON.stringify({
      name: "Tester Peminjam",
      email: `peminjam_${Date.now().toString().slice(-4)}@nexora.id`,
      password: "password123",
    });
  } else if (id === "login") {
    options.body = JSON.stringify({
      email: "admin@nexora.id",
      password: "password123",
    });
  } else if (id === "cat-create") {
    options.body = JSON.stringify({
      name: `Kategori Baru ${Date.now().toString().slice(-3)}`,
      slug: `kategori-${Date.now().toString().slice(-3)}`,
    });
  } else if (id === "cat-update") {
    options.body = JSON.stringify({
      name: "Tenda Camping Update",
      slug: "tenda-camping",
    });
  } else if (id === "gear-create") {
    options.body = JSON.stringify({
      category_id: 1,
      name: "Tenda Dome Borneo 2P",
      slug: `tenda-dome-2p-${Date.now().toString().slice(-3)}`,
      price_per_day: 35000,
      total_stock: 4,
      unit: "per hari",
    });
  } else if (id === "gear-update") {
    options.body = JSON.stringify({
      price_per_day: 45000,
      total_stock: 8,
      available_stock: 8,
      stock_status: "hijau",
    });
  } else if (id === "rentals-create") {
    options.body = JSON.stringify({
      user_id: 12,
      start_date: "2026-09-20",
      end_date: "2026-09-23",
      total_price: 135000,
      ktp_number: "5201012304950001",
      note: "Pengajuan sewa pendakian uji coba",
    });
  } else if (id === "rentals-update") {
    options.body = JSON.stringify({
      status: "diverifikasi",
    });
  } else if (id === "items-create") {
    options.body = JSON.stringify({
      rental_id: 1,
      gear_id: 1,
      quantity: 1,
      price_per_day: 45000,
      subtotal: 135000,
    });
  } else if (id === "items-update") {
    options.body = JSON.stringify({
      quantity: 2,
      subtotal: 270000,
    });
  } else if (id === "pkg-create") {
    options.body = JSON.stringify({
      name: `Paket Rinjani ${Date.now().toString().slice(-3)}`,
      description: "Paket bundling komplit rombongan pendakian.",
      target: "4 orang",
    });
  } else if (id === "pkg-update") {
    options.body = JSON.stringify({
      name: "Paket Rinjani Premium",
      description: "Perlengkapan ultralight.",
    });
  } else if (id === "pkg-item-create") {
    options.body = JSON.stringify({
      package_id: 1,
      gear_id: 1,
      quantity: 2,
    });
  } else if (id === "pkg-item-update") {
    options.body = JSON.stringify({
      quantity: 3,
    });
  } else if (id === "wish-create") {
    options.body = JSON.stringify({
      user_id: 13,
      gear_id: 1,
    });
  } else if (id === "wish-update") {
    options.body = JSON.stringify({
      gear_id: 2,
    });
  } else if (id === "logs-create") {
    options.body = JSON.stringify({
      rental_id: 1,
      status: "diverifikasi",
      notes: "Verifikasi dokumen KTP peminjam lolos.",
      changed_by: "Admin Rental",
    });
  } else if (id === "logs-update") {
    options.body = JSON.stringify({
      notes: "Catatan audit log disesuaikan.",
    });
  }

  return { url, options };
}
