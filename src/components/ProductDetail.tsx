"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, ViewTransition } from "react";
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
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";

const ingredientVisuals: Partial<
  Record<string, { src: string; width: number; height: number }>
> = {
  "old-love": {
    src: "/ingredients/old-love-notes.webp",
    width: 915,
    height: 223,
  },
  coldwar: {
    src: "/ingredients/coldwar-notes.webp",
    width: 915,
    height: 223,
  },
  heavenly: {
    src: "/ingredients/heavenly-notes.webp",
    width: 915,
    height: 218,
  },
  billionaire: {
    src: "/ingredients/billionaire-notes.webp",
    width: 915,
    height: 194,
  },
};

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
  const [size] = useState<"20ml" | "100ml">(
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
  const ingredientVisual = ingredientVisuals[product.slug];
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
    <main data-surface="story" className="product-page">
      <div className="mx-auto max-w-[1500px]">
        <Link href="/shop" className="eyebrow inline-flex items-center gap-2">
          <ArrowLeft size={14} /> All fragrances
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
          <Reveal as="section" from="left" className="product-gallery">
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
              {/* Other half of the card -> hero morph. Only the first gallery
                  image carries the name: once the visitor browses the gallery
                  the pairing is no longer meaningful, and a name that moves
                  between elements would confuse the next transition. */}
              <ViewTransition
                name={
                  selectedImageIndex === 0
                    ? `product-${product.slug}-${size}`
                    : undefined
                }
                share="morph"
                default="none"
              >
                <Photo
                  key={selectedImage}
                  src={selectedImage}
                  alt={`${product.name} — ${product.genderPositioning} ${product.profile} ${product.concentration}${
                    product.packSize && product.packSize > 1
                      ? `, pack of ${product.packSize}`
                      : ""
                  }, ${size} bottle (photo ${selectedImageIndex + 1} of ${activeImages.length})`}
                  fill
                  priority
                  fadeIn={false}
                  sizes="(max-width:1024px) 100vw, 58vw"
                  className="product-gallery-active-image object-contain"
                />
              </ViewTransition>
              {nextImage && nextImage !== selectedImage && (
                <Image
                  key={`preload-${nextImage}`}
                  src={nextImage}
                  alt=""
                  fill
                  loading="eager"
                  sizes="(max-width:1024px) 100vw, 58vw"
                  className="product-image-preload object-contain"
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
                    alt={`${product.name} ${product.profile} ${product.concentration} thumbnail ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="68px"
                  />
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal
            as="section"
            delay={0.08}
            className="flex flex-col justify-center lg:sticky lg:top-28 lg:h-fit lg:py-8"
          >
            <p className="eyebrow">
              {product.genderPositioning} · {product.profile}
            </p>
            <h1 className="display-title mt-4 text-5xl sm:text-6xl">
              {product.name}
            </h1>
            <p className="text-muted mt-6 max-w-xl text-base leading-8">
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
            {ingredientVisual && (
              <figure className="ingredient-notes-visual">
                <Image
                  src={ingredientVisual.src}
                  alt={`${product.name} top, heart and base note ingredients`}
                  width={ingredientVisual.width}
                  height={ingredientVisual.height}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <figcaption>Ingredients shown for visual reference</figcaption>
              </figure>
            )}
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
              <p className="eyebrow mb-3">Selected format</p>
              <div className="grid grid-cols-1 gap-3">
                {product.variants
                  .filter((item) => item.name === size)
                  .map((item) => (
                    <button
                      key={item.id}
                      disabled={!item.active || item.stock <= item.reserved}
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
                <p className="text-subtle mt-1 text-xs">Inclusive of GST</p>
              </div>
              <p className="text-subtle text-right text-xs leading-5">
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
            <div className="text-subtle mt-5 flex items-center justify-center gap-2 text-xs">
              <Truck size={15} />
              <span>₹99 delivery · Complimentary on ₹599 or more</span>
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
          </Reveal>
        </div>
      </div>
      <section className="product-offers" aria-label="Current offers">
        <article>
          <span>DELIVERY · SAVE</span>
          <h2>Complimentary shipping</h2>
          <p>
            Free delivery is applied automatically when your order reaches ₹599.
          </p>
        </article>
        <article>
          <span>DISCOVERY · CHOOSE</span>
          <h2>Start with 20ml</h2>
          <p>
            Experience the same Eau de Parfum composition in a travel-ready
            format.
          </p>
        </article>
      </section>
      <section className="product-description-block">
        <p className="eyebrow">Product description</p>
        <h2 className="display-title">
          {product.name}, made for {product.mood.toLowerCase()}.
        </h2>
        <p>{product.description}</p>
        <p>{product.story}</p>
      </section>
      <section className="product-notes-block">
        <div className="product-notes-intro">
          <p className="eyebrow">The composition</p>
          <h2 className="display-title">How it unfolds.</h2>
        </div>
        <div className="product-note-columns">
          <article>
            <span>01 · Top notes</span>
            <h3>{product.topNotes.join(", ")}</h3>
            <p>
              The first impression: immediate, expressive and designed to draw
              you closer.
            </p>
          </article>
          <article>
            <span>02 · Heart notes</span>
            <h3>{product.heartNotes.join(", ")}</h3>
            <p>
              The character of the fragrance appears as it settles into the
              skin.
            </p>
          </article>
          <article>
            <span>03 · Base notes</span>
            <h3>{product.baseNotes.join(", ")}</h3>
            <p>
              The lasting trail: warm, grounded and remembered after you leave.
            </p>
          </article>
        </div>
      </section>
      <section className="product-application">
        <div>
          <p className="eyebrow">How to apply</p>
          <h2 className="display-title">Make the trail last.</h2>
        </div>
        <div className="application-steps">
          <article>
            <span>01</span>
            <h3>Spray pulse points</h3>
            <p>Apply to wrists, neck and behind the ears from 15–20 cm away.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Do not rub</h3>
            <p>
              Let the perfume settle naturally so the composition develops
              properly.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Store with care</h3>
            <p>Keep away from direct sunlight, moisture and excessive heat.</p>
          </article>
        </div>
      </section>
      <section className="product-faq-block">
        <div>
          <p className="eyebrow">Frequently asked</p>
          <h2 className="display-title">A little clarity.</h2>
        </div>
        <div>
          <details>
            <summary>
              How long does {product.name} last?<span>+</span>
            </summary>
            <p>
              {product.longevity}. Performance varies with skin, climate and
              application.
            </p>
          </details>
          <details>
            <summary>
              When should I wear it?<span>+</span>
            </summary>
            <p>{product.occasion}.</p>
          </details>
          <details>
            <summary>
              Is it unisex?<span>+</span>
            </summary>
            <p>
              Yes. Every Amidaddy fragrance is composed around character and
              mood rather than gender.
            </p>
          </details>
          <details>
            <summary>
              Is the 20ml fragrance different?<span>+</span>
            </summary>
            <p>No. Both formats contain the same Eau de Parfum composition.</p>
          </details>
        </div>
      </section>
    </main>
  );
}
