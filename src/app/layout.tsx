import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import AnnouncementBar from "@/components/AnnouncementBar";

import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import ConsentBanner from "@/components/ConsentBanner";
import OfferLauncher from "@/components/OfferLauncher";
import PageViewTracker from "@/components/PageViewTracker";
import ScrollToTopOnNavigate from "@/components/ScrollToTopOnNavigate";

// Serif display for headings, geometric sans for body and UI. Cormorant sets
// close to Inter's width, so headings keep their line breaks. No 300 weight:
// Cormorant is too thin there, and the browser falls back to 400.
const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
const sans = Jost({
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
        <Analytics />
        <PageViewTracker />
        <ScrollToTopOnNavigate />
        <CartProvider>
          <div data-surface="chrome">
            <AnnouncementBar />
            <Navbar />
            <CartSidebar />
          </div>
          {children}
          <div data-surface="chrome">
            <Footer />
            <ConsentBanner />
            <OfferLauncher />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
