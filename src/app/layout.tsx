import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import AnnouncementBar from "@/components/AnnouncementBar";

import Footer from "@/components/Footer";

// Single family for the whole system (the reference's Aeonik substitute).
// Both CSS vars point at the same font so every existing
// var(--font-display)/var(--font-sans) reference keeps working unchanged.
const display = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500"],
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500"],
});

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>
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
