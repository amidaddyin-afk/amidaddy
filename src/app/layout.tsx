import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import { QueryProvider } from "@/providers/query-provider";
import AnnouncementBar from "@/components/AnnouncementBar";
import SprayEffect from "@/components/SprayEffect";

export const metadata: Metadata = {
  title: "Amidaddy — Luxury Fragrances",
  description:
    "Experience the world of unisex fragrances from Amidaddy.",
  openGraph: {
    title: "Amidaddy — Luxury Fragrances",
    description:
      "Handle every room with presence. Explore our curated collection of premium perfumes.",
    siteName: "Amidaddy",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white antialiased">
        <QueryProvider>
          <CartProvider>
            <AnnouncementBar />
            <Navbar />
            <CartSidebar />
            {children}
            <SprayEffect />
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
