import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ridge text-fog">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="font-display text-lg font-bold">NEXORA</div>
            <p className="mt-3 max-w-xs text-sm text-fog/70">
              Platform sewa alat pendakian. Dari katalog sampai alat kembali
              ke gudang, satu alur yang bisa dipantau.
            </p>
          </div>

          <div>
            <div className="text-sm font-medium text-fog/90">Layanan</div>
            <ul className="mt-3 space-y-2 text-sm text-fog/70">
              <li><Link href="/user/katalog" className="hover:text-fog">Katalog alat</Link></li>
              <li><Link href="/user/kalkulator" className="hover:text-fog">Kalkulator biaya</Link></li>
              <li><Link href="/user/rekomendasi" className="hover:text-fog">Rekomendasi rombongan</Link></li>
              <li><Link href="/user/checkout" className="hover:text-fog">Ajukan sewa</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-medium text-fog/90">Akun</div>
            <ul className="mt-3 space-y-2 text-sm text-fog/70">
              <li><Link href="/user/riwayat" className="hover:text-fog">Riwayat & status</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-fog/15 pt-6 text-xs text-fog/50 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} NEXORA. Semua alat diperiksa sebelum berangkat.</span>
        </div>
      </div>
    </footer>
  );
}
