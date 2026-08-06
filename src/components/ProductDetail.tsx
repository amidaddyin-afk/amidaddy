"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";

export default function ProductDetail({ product, images }: { product: Product; images: string[] }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [size, setSize] = useState<"20ml" | "100ml">("100ml");
  const { addItem } = useCart();
  const price = size === "100ml" ? 1199 : 199;

  return (
    <main className="min-h-screen bg-black px-5 pb-20 pt-32 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
        <section>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">
            <Image src={selectedImage} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" priority />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <button key={image} onClick={() => setSelectedImage(image)} className={`relative aspect-square overflow-hidden border ${selectedImage === image ? "border-[#D4AF37]" : "border-white/10"}`} aria-label={`View ${product.name} photo ${index + 1}`}>
                <Image src={image} alt="" fill className="object-cover" sizes="(max-width: 640px) 50vw, 260px" />
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col justify-center lg:py-10">
          <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37]">{product.profile} fragrance</p>
          <h1 className="mt-4 font-cinzel text-4xl leading-tight text-white sm:text-5xl">{product.name}</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/65">{product.description}</p>
          <dl className="mt-8 space-y-4 border-y border-white/10 py-6 text-sm">
            <div className="flex justify-between gap-6"><dt className="uppercase tracking-[0.12em] text-white/40">Notes</dt><dd className="text-right text-white/80">{product.notes}</dd></div>
            <div className="flex justify-between gap-6"><dt className="uppercase tracking-[0.12em] text-white/40">Mood</dt><dd className="text-right text-white/80">{product.mood}</dd></div>
            <div className="flex justify-between gap-6"><dt className="uppercase tracking-[0.12em] text-white/40">Longevity</dt><dd className="text-right text-white/80">{product.longevity}</dd></div>
          </dl>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {(["20ml", "100ml"] as const).map((option) => (
              <button key={option} onClick={() => setSize(option)} className={`min-h-12 border text-sm font-medium ${size === option ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]" : "border-white/15 text-white/60"}`}>
                {option} {option === "20ml" ? "- Rs. 199" : "- Rs. 1,199"}
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between"><span className="text-3xl font-semibold text-white">Rs. {price.toLocaleString()}</span><span className="text-sm text-white/40">Inclusive of taxes</span></div>
          <button onClick={() => addItem(product, size)} className="mt-6 flex min-h-14 items-center justify-center gap-3 bg-[#D4AF37] px-6 text-sm font-bold uppercase tracking-[0.14em] text-black hover:bg-[#c9a02e]"><ShoppingBag size={18} />Add to cart</button>
        </section>
      </div>
    </main>
  );
}
