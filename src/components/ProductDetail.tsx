"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, ViewTransition } from "react";
import {
  ArrowLeft,
  Check,
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
import ProductStory, { type StoryTile } from "@/components/ProductStory";
import StickyBuyBar from "@/components/StickyBuyBar";

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

/** Copy for the vertical gallery, derived from the product's own note
 *  pyramid so the tiles say something specific rather than generic filler.
 *  Capped at four images: the catalogue holds ten to fifteen per product,
 *  which is a scroll nobody finishes. */
const STORY_COPY = [
  { heading: "The bottle", from: (p: Product) => p.description },
  {
    heading: "The opening",
    from: (p: Product) =>
      `Top notes of ${p.topNotes.join(", ")}. The first impression, and the one that draws someone closer.`,
  },
  {
    heading: "The heart",
    from: (p: Product) =>
      `${p.heartNotes.join(", ")} settle into the skin as the opening softens.`,
  },
  {
    heading: "The trail",
    from: (p: Product) =>
      `${p.baseNotes.slice(0, 4).join(", ")} in the dry-down. ${p.longevity} of wear.`,
  },
] as const;

function buildStoryTiles(
  product: Product,
  images: string[],
  size: "20ml" | "100ml",
): StoryTile[] {
  return STORY_COPY.slice(0, Math.min(4, images.length)).map(
    (entry, index) => ({
      image: images[index],
      heading: entry.heading,
      copy: entry.from(product),
      alt: `${product.name} ${product.concentration}, ${size} — ${entry.heading.toLowerCase()}`,
    }),
  );
}

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
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const variant = product.variants.find((item) => item.name === size);
  const isCombo = product.collection === "combos";
  const ingredientVisual = ingredientVisuals[product.slug];
  const character = product.mood.split(/,| and /).filter(Boolean);
  const activeImages =
    product.variantImages?.[size]?.length && product.variantImages[size]
      ? product.variantImages[size]!
      : product.images;
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const heroImage = activeImages[0];
  const storyTiles = buildStoryTiles(product, activeImages, size);
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
            {/* Single primary frame. The carousel that used to live here is
                replaced by the vertical <ProductStory> sequence further down
                the page, so there is one way to browse the photography. */}
            <div className="product-hero-image">
              <ViewTransition
                name={`product-${product.slug}-${size}`}
                share="morph"
                default="none"
              >
                <Photo
                  src={heroImage}
                  alt={`${product.name} — ${product.genderPositioning} ${product.profile} ${product.concentration}${
                    product.packSize && product.packSize > 1
                      ? `, pack of ${product.packSize}`
                      : ""
                  }, ${size} bottle`}
                  fill
                  priority
                  fadeIn={false}
                  sizes="(max-width:1024px) 100vw, 58vw"
                  className="object-cover"
                />
              </ViewTransition>
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
              ref={addButtonRef}
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
      <ProductStory tiles={storyTiles} />
      <StickyBuyBar
        name={product.name}
        size={
          product.packSize && product.packSize > 1
            ? `${product.packSize} × ${size}`
            : size
        }
        pricePaise={variant?.pricePaise}
        disabled={!variant || variant.stock <= variant.reserved}
        onAdd={add}
        added={added}
        anchorRef={addButtonRef}
      />
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
