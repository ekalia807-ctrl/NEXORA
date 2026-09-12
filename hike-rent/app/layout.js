import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/app/components/shared/NavBar";
import Footer from "@/app/components/shared/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata = {
  title: "NEXORA — Sewa alat pendakian, tanpa drama",
  description:
    "Platform sewa alat pendakian dengan katalog real-time, kalkulator biaya otomatis, dan verifikasi dokumen dalam satu alur.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${inter.variable} ${jbMono.variable}`}>
      <body className="font-body bg-paper text-ink antialiased">
        <NavBar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
