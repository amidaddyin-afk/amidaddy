import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import { QueryProvider } from "@/providers/query-provider";
import AnnouncementBar from "@/components/AnnouncementBar";

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
    template: "%s · Amidaddy",
  },
  description:
    "Four unisex Eau de Parfum signatures composed around mood, memory and presence.",
  openGraph: {
    title: "Amidaddy Perfumes · Presence, before words",
    description: "Four unisex signatures. Find the scent that feels like you.",
    siteName: "Amidaddy",
    images: [
      { url: "/og.png", width: 1536, height: 1024, alt: "Amidaddy Perfumes" },
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
        <QueryProvider>
          <CartProvider>
            <AnnouncementBar />
            <Navbar />
            <CartSidebar />
            {children}
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
