import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import AnnouncementBar from "@/components/AnnouncementBar";
import PerfumeSprayCursor from "@/components/PerfumeSprayCursor";
import Footer from "@/components/Footer";
import { getSiteTheme } from "@/lib/theme";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Amidaddy Perfumes · Presence, before words",
    template: "%s · Amidaddy Perfumes",
  },
  description:
    "Four unisex Eau de Parfum signatures composed around mood, memory and presence.",
  openGraph: {
    title: "Amidaddy Perfumes · Presence, before words",
    description: "Four unisex signatures. Find the scent that feels like you.",
    siteName: "Amidaddy Perfumes",
    images: [
      { url: "/og.png", width: 1200, height: 800, alt: "Amidaddy Perfumes" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amidaddy Perfumes · Presence, before words",
    description: "Four unisex signatures. Find the scent that feels like you.",
    images: ["/og.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getSiteTheme();
  return (
    <html lang="en" data-theme={theme}>
      <body className={`${display.variable} ${sans.variable}`}>
        <PerfumeSprayCursor />
        <CartProvider>
          <div data-surface="chrome">
            <AnnouncementBar />
            <Navbar />
            <CartSidebar />
          </div>
          {children}
          <div data-surface="chrome">
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
