import Link from "next/link";

// Warna footer mengikuti sidebar admin: bg-ridge (hijau lumut) + teks fog.
// Kalau sidebar admin memakai kelas warna lain, ganti "bg-ridge" di <footer>.
const linkClass =
  "rounded-sm text-fog/75 underline-offset-2 transition-colors hover:text-fog hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fog/60";

const GROUPS = [
  {
    title: "Layanan",
    links: [
      { href: "/katalog", label: "Katalog alat" },
      { href: "/user/kalkulator", label: "Kalkulator biaya" },
      { href: "/user/rekomendasi", label: "Rekomendasi rombongan" },
      { href: "/user/checkout", label: "Ajukan sewa" },
    ],
  },
  {
    title: "Akun",
    links: [
      { href: "/login", label: "Masuk" },
      { href: "/register", label: "Daftar" }, // ganti kalau rute daftar berbeda
      { href: "/user/riwayat", label: "Riwayat & status" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-ridge text-xs leading-relaxed text-fog/75">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[minmax(0,2fr)_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <h2 className="font-semibold text-fog">NEXORA</h2>
            <p className="mt-3 max-w-sm">
              Platform sewa alat pendakian, dari katalog sampai alat kembali
              ke gudang dalam satu alur yang bisa dipantau. Semua alat
              diperiksa sebelum berangkat.
            </p>
          </div>

          {GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="font-semibold text-fog">{group.title}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-fog/15 pt-4 text-fog/60">
          Hak cipta © {new Date().getFullYear()} NEXORA. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
}