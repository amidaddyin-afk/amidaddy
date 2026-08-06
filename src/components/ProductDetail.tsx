"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, ShoppingBag, Truck } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { formatInr } from "@/lib/money";

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(
    product.images[0] ?? product.image,
  );
  const available = product.variants.filter(
    (variant) => variant.active && variant.stock > variant.reserved,
  );
  const [size, setSize] = useState<"20ml" | "100ml">(
    available.find((item) => item.name === "100ml")?.name ??
      available[0]?.name ??
      "100ml",
  );
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const variant = product.variants.find((item) => item.name === size);
  const add = () => {
    addItem(product, size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };
  return (
    <main className="product-page">
      <div className="mx-auto max-w-[1500px]">
        <Link href="/shop" className="eyebrow inline-flex items-center gap-2">
          <ArrowLeft size={14} /> All fragrances
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
          <section
            className="grid gap-3 sm:grid-cols-[88px_1fr]"
            data-reveal="left"
          >
            <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  className={`thumbnail ${selectedImage === image ? "active" : ""}`}
                  aria-label={`Show image ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="88px"
                  />
                </button>
              ))}
            </div>
            <div className="product-hero-image order-1 sm:order-2">
              <Image
                src={selectedImage}
                alt={`${product.name} bottle`}
                fill
                priority
                sizes="(max-width:1024px) 100vw, 58vw"
                className="object-cover"
              />
              <div className="product-glow" />
            </div>
          </section>
          <section
            className="flex flex-col justify-center lg:sticky lg:top-28 lg:h-fit lg:py-8"
            data-reveal
          >
            <p className="eyebrow">
              {product.genderPositioning} · {product.profile}
            </p>
            <h1 className="display-title mt-4 text-5xl sm:text-6xl">
              {product.name}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/62">
              {product.description}
            </p>
            <p className="text-champagne/85 mt-6 font-serif text-xl leading-8 italic">
              “{product.story}”
            </p>
            <div className="note-pyramid mt-9">
              <div>
                <span>Top</span>
                <p>{product.topNotes.join(" · ")}</p>
              </div>
              <div>
                <span>Heart</span>
                <p>{product.heartNotes.join(" · ")}</p>
              </div>
              <div>
                <span>Base</span>
                <p>{product.baseNotes.join(" · ")}</p>
              </div>
            </div>
            <div className="mt-8">
              <p className="eyebrow mb-3">Choose your ritual</p>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((item) => (
                  <button
                    key={item.id}
                    disabled={!item.active || item.stock <= item.reserved}
                    onClick={() => setSize(item.name)}
                    className={`variant-card ${size === item.name ? "active" : ""}`}
                  >
                    <span>{item.name}</span>
                    <strong>{formatInr(item.pricePaise)}</strong>
                    <small>
                      {item.stock > item.reserved
                        ? "Ready to dispatch"
                        : "Out of stock"}
                    </small>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-3xl">
                  {variant ? formatInr(variant.pricePaise) : "Unavailable"}
                </p>
                <p className="mt-1 text-xs text-white/40">Inclusive of GST</p>
              </div>
              <p className="text-right text-xs leading-5 text-white/40">
                {product.longevity}
                <br />
                {product.occasion}
              </p>
            </div>
            <button
              onClick={add}
              disabled={!variant || variant.stock <= variant.reserved}
              className="lux-button mt-6 w-full"
            >
              {added ? <Check size={17} /> : <ShoppingBag size={17} />}{" "}
              {added ? "Added to your bag" : "Add to bag"}
            </button>
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/45">
              <Truck size={15} />
              <span>₹99 delivery · Complimentary above ₹1,999</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
