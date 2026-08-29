"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Images,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { formatInr } from "@/lib/money";

export default function ProductDetail({
  product,
  initialSize,
}: {
  product: Product;
  initialSize?: "20ml" | "100ml";
}) {
  const available = product.variants.filter(
    (variant) => variant.active && variant.stock > variant.reserved,
  );
  const [size, setSize] = useState<"20ml" | "100ml">(
    available.find((item) => item.name === initialSize)?.name ??
      available.find((item) => item.name === "100ml")?.name ??
      available[0]?.name ??
      "100ml",
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const { addItem } = useCart();
  const variant = product.variants.find((item) => item.name === size);
  const isCombo = product.collection === "combos";
  const character = product.mood.split(/,| and /).filter(Boolean);
  const activeImages =
    product.variantImages?.[size]?.length && product.variantImages[size]
      ? product.variantImages[size]!
      : product.images;
  const selectedImage = activeImages[selectedImageIndex] ?? activeImages[0];
  const nextImage =
    activeImages.length > 1
      ? activeImages[(selectedImageIndex + 1) % activeImages.length]
      : undefined;
  const showImage = (index: number) => {
    const nextIndex = (index + activeImages.length) % activeImages.length;
    setSelectedImageIndex(nextIndex);
  };
  const finishSwipe = (x: number, y: number) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || activeImages.length < 2) return;
    const horizontalDistance = x - start.x;
    const verticalDistance = y - start.y;
    if (
      Math.abs(horizontalDistance) < 42 ||
      Math.abs(horizontalDistance) <= Math.abs(verticalDistance)
    )
      return;
    showImage(selectedImageIndex + (horizontalDistance < 0 ? 1 : -1));
  };
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
          <section className="product-gallery" data-reveal="left">
            <div
              className="product-hero-image"
              onTouchStart={(event) => {
                const touch = event.changedTouches[0];
                touchStart.current = { x: touch.clientX, y: touch.clientY };
              }}
              onTouchEnd={(event) => {
                const touch = event.changedTouches[0];
                finishSwipe(touch.clientX, touch.clientY);
              }}
              onTouchCancel={() => {
                touchStart.current = null;
              }}
            >
              <Image
                key={selectedImage}
                src={selectedImage}
                alt={`${product.name} ${product.packSize && product.packSize > 1 ? `${product.packSize} pack ` : ""}${size}`}
                fill
                priority
                sizes="(max-width:1024px) 100vw, 58vw"
                className="product-gallery-active-image object-cover"
              />
              {nextImage && nextImage !== selectedImage && (
                <Image
                  key={`preload-${nextImage}`}
                  src={nextImage}
                  alt=""
                  fill
                  loading="eager"
                  sizes="(max-width:1024px) 100vw, 58vw"
                  className="product-image-preload object-cover"
                  aria-hidden="true"
                />
              )}
              <div className="product-glow" />
              {activeImages.length > 1 && (
                <div className="gallery-controls">
                  <button
                    type="button"
                    onClick={() => showImage(selectedImageIndex - 1)}
                    aria-label="Show previous product photo"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span>
                    <Images size={14} />
                    {selectedImageIndex + 1} / {activeImages.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => showImage(selectedImageIndex + 1)}
                    aria-label="Show next product photo"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
            <div
              className="product-thumbnail-rail"
              aria-label={`${product.name} photo gallery`}
            >
              {activeImages.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`thumbnail ${selectedImageIndex === index ? "active" : ""}`}
                  aria-label={`Show ${product.name} image ${index + 1} of ${activeImages.length}`}
                  aria-pressed={selectedImageIndex === index}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="68px"
                  />
                </button>
              ))}
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
            <div className="product-guidance-grid">
              <div>
                <span>Character</span>
                <p>{character.join(" · ")}</p>
              </div>
              <div>
                <span>Best for</span>
                <p>{product.occasion}</p>
              </div>
              <div>
                <span>Performance</span>
                <p>{product.longevity}</p>
                <small>Varies by skin, weather and application.</small>
              </div>
              <div>
                <span>Intensity</span>
                <p aria-label="Four out of five intensity">● ● ● ● ○</p>
              </div>
            </div>
            <div className="mt-8">
              <p className="eyebrow mb-3">Choose your ritual</p>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((item) => (
                  <button
                    key={item.id}
                    disabled={!item.active || item.stock <= item.reserved}
                    onClick={() => {
                      setSize(item.name);
                      setSelectedImageIndex(0);
                    }}
                    className={`variant-card ${size === item.name ? "active" : ""}`}
                  >
                    <span>
                      {product.packSize && product.packSize > 1
                        ? `${product.packSize} × ${item.name}`
                        : item.name}
                    </span>
                    <strong>{formatInr(item.pricePaise)}</strong>
                    <small>
                      {item.stock > item.reserved
                        ? item.name === "20ml" && !isCombo
                          ? "Discover it"
                          : item.name === "100ml" && !isCombo
                            ? "Make it yours"
                            : "Ready to dispatch"
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
            <div
              className="purchase-assurance"
              aria-label="Purchase reassurance"
            >
              <span>
                <ShieldCheck size={15} /> Secure Razorpay payment
              </span>
              <span>
                <Sparkles size={15} /> Authentic Eau de Parfum
              </span>
              <span>
                <Truck size={15} /> Live order tracking
              </span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
