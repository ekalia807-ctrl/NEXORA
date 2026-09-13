import CatalogView from "@/app/components/shared/CatalogView";

export const metadata = { title: "Katalog Alat — NEXORA" };

export default function KatalogPublicPage() {
  return (
    <main className="bg-paper px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">
          Katalog Alat
        </h1>
        <p className="mt-2 max-w-xl text-ink/65">
          Cari dan bandingkan alat pendakian yang tersedia, lengkap dengan
          status stok terkini.
        </p>
        <div className="mt-10">
          <CatalogView />
        </div>
      </div>
    </main>
  );
}
