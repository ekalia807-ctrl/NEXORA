"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/katalog", label: "Katalog" },
  { href: "/kalkulator", label: "Kalkulator" },
  { href: "/rekomendasi", label: "Rombongan" },
  { href: "/riwayat", label: "Riwayat" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink">
          NEXORA
        </Link>

        <nav className="hidden gap-7 md:flex">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[15px] transition-colors ${
                  active ? "font-medium text-ink" : "text-ink/60 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/pengajuan"
            className="rounded-sm bg-ridge px-5 py-2.5 text-sm text-fog transition-colors hover:bg-ink"
          >
            Ajukan sewa
          </Link>
        </div>

        <button
          className="md:hidden"
          aria-label="Buka menu"
          onClick={() => setOpen(!open)}
        >
          <span className="block h-0.5 w-6 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-6 bg-ink" />
          <span className="mt-1.5 block h-0.5 w-4 bg-ink" />
        </button>
      </div>

      {open && (
        <div className="border-t border-line px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-[15px] text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/pengajuan"
              onClick={() => setOpen(false)}
              className="mt-2 inline-block rounded-sm bg-ridge px-5 py-2.5 text-center text-sm text-fog"
            >
              Ajukan sewa
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
