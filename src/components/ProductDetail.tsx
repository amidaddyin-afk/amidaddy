"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, ViewTransition } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
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
import ProductStory, { type StoryTile } from "@/components/ProductStory";
import StickyBuyBar from "@/components/StickyBuyBar";

/** The horizontal note-ingredient strips that exist for the four singles. */
const ingredientVisuals: Partial<
  Record<string, { src: string; width: number; height: number }>
> = {
  "old-love": {
    src: "/ingredients/old-love-notes.webp",
    width: 915,
    height: 223,
  },
  coldwar: { src: "/ingredients/coldwar-notes.webp", width: 915, height: 223 },
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

/** Studio close-ups live at /products/detail/<slug>/ for these four. */
const DETAIL_SLUGS = ["coldwar", "old-love", "heavenly", "billionaire"];

/**
 * Fallback copy for the vertical story when a product has no dedicated studio
 * close-ups (the combos). Kept so the gallery still says something specific.
 */
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

/**
 * The note journey. When studio close-ups exist it is three beats over three
 * macro frames of the bottle in its own world; otherwise it falls back to four
 * frames of the campaign photography with the copy above.
 */
function buildStoryTiles(
  product: Product,
  images: string[],
  size: "20ml" | "100ml",
): StoryTile[] {
  if (DETAIL_SLUGS.includes(product.slug)) {
    const base = `/products/detail/${product.slug}`;
    return [
      {
        image: `${base}/01.webp`,
        heading: "The opening",
        copy: `${product.topNotes.join(", ")}. Bright and immediate, the note you meet first.`,
        alt: `${product.name} ${product.concentration}, the opening notes`,
      },
      {
        image: `${base}/02.webp`,
        heading: "The heart",
        copy: `${product.heartNotes.join(", ")}. The character of the scent as it settles on skin.`,
        alt: `${product.name} ${product.concentration}, the heart notes`,
      },
      {
        image: `${base}/03.webp`,
        heading: "The trail",
        copy: `${product.baseNotes.slice(0, 4).join(", ")} in the dry-down. ${product.longevity} of wear, remembered after you leave.`,
        alt: `${product.name} ${product.concentration}, the base notes`,
      },
    ];
  }
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
  const hasDetail = DETAIL_SLUGS.includes(product.slug);
  const objectImage = hasDetail
    ? `/products/detail/${product.slug}/hero.webp`
    : (activeImages[1] ?? activeImages[0]);
  const storyTiles = buildStoryTiles(product, activeImages, size);
  const sizeLabel =
    product.packSize && product.packSize > 1
      ? `${product.packSize} × ${size}`
      : size;
  const inStock = !!variant && variant.stock > variant.reserved;
  const onSale = !!variant && variant.mrpPaise > variant.pricePaise;

  const add = () => {
    addItem(product, size);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <main data-surface="story" className="product-page cinematic">
      {/* ---- cinematic hero: the campaign frame, the name, the first CTA ---- */}
      <section className="pdp-hero">
        <div className="pdp-hero-media">
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
              sizes="100vw"
              className="object-cover"
            />
          </ViewTransition>
        </div>
        <div className="pdp-hero-veil" />
        <div className="pdp-hero-copy">
          <Link
            href="/shop"
            transitionTypes={["nav-back"]}
            className="pdp-back"
          >
            <ArrowLeft size={14} /> All fragrances
          </Link>
          <p className="pdp-kicker">
            {product.genderPositioning} · {product.profile}{" "}
            {product.concentration}
          </p>
          <h1 className="pdp-name">{product.name}</h1>
          <p className="pdp-story">&ldquo;{product.story}&rdquo;</p>
          <div className="pdp-hero-buy">
            <span className="pdp-hero-price">
              {variant ? formatInr(variant.pricePaise) : "Unavailable"}
              {onSale && variant && <s>{formatInr(variant.mrpPaise)}</s>}
            </span>
            <button
              onClick={add}
              disabled={!inStock}
              className="lux-button pdp-hero-add"
            >
              {added ? <Check size={16} /> : <ShoppingBag size={16} />}
              {added ? "Added to your bag" : "Add to bag"}
            </button>
          </div>
        </div>
      </section>

      {/* ---- the object: a studio close-up beside the buy rail ----
          Static, never revealed on scroll: the buy rail must not depend on a
          motion trigger firing. */}
      <section className="pdp-object">
        <div className="pdp-object-media">
          <Photo
            src={objectImage}
            alt={`${product.name} ${product.concentration}, studio detail`}
            fill
            sizes="(max-width: 900px) 100vw, 52vw"
            className="object-cover"
          />
        </div>
        <div className="pdp-buy lg:sticky lg:top-28 lg:h-fit">
          <p className="pdp-buy-notes">
            {product.topNotes.slice(0, 3).join(" · ")}
          </p>
          <h2 className="pdp-buy-name">{product.name}</h2>
          <p className="pdp-buy-desc">{product.description}</p>

          <div className="pdp-price-row">
            <strong>
              {variant ? formatInr(variant.pricePaise) : "Unavailable"}
            </strong>
            {onSale && variant && <s>{formatInr(variant.mrpPaise)}</s>}
            <span>{sizeLabel} · Inclusive of GST</span>
          </div>

          <button
            ref={addButtonRef}
            onClick={add}
            disabled={!inStock}
            className="lux-button pdp-add"
          >
            {added ? <Check size={17} /> : <ShoppingBag size={17} />}
            {added ? "Added to your bag" : "Add to bag"}
          </button>
          {!inStock && (
            <p className="pdp-oos">Currently out of stock. Check back soon.</p>
          )}

          <ul className="pdp-assure">
            <li>
              <Truck size={14} /> ₹99 delivery, free over ₹599
            </li>
            <li>
              <ShieldCheck size={14} /> Secure Razorpay payment
            </li>
            <li>
              <Sparkles size={14} /> Authentic Eau de Parfum
            </li>
          </ul>

          <dl className="pdp-facts">
            <div>
              <dt>Wears</dt>
              <dd>{product.longevity}</dd>
            </div>
            <div>
              <dt>Best for</dt>
              <dd>{product.occasion}</dd>
            </div>
            <div>
              <dt>Character</dt>
              <dd>{character.join(" · ")}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ---- the note journey, told over the close-ups ---- */}
      <section className="pdp-unfolds">
        <div className="pdp-section-head">
          <h2 className="display-title">How it unfolds.</h2>
          <p>Three moments, from the first spray to the trail it leaves.</p>
        </div>
        <ProductStory tiles={storyTiles} />
      </section>

      {/* ---- ingredients + how to wear ---- */}
      {ingredientVisual && (
        <section className="pdp-detail">
          <figure className="pdp-ingredients">
            <Image
              src={ingredientVisual.src}
              alt={`${product.name} top, heart and base note ingredients`}
              width={ingredientVisual.width}
              height={ingredientVisual.height}
              sizes="(max-width: 1024px) 100vw, 44vw"
            />
            <figcaption>Top, heart and base, shown for reference.</figcaption>
          </figure>
          <div className="pdp-wear">
            <h2 className="display-title">Make the trail last.</h2>
            <ol>
              <li>
                <strong>Spray the pulse points.</strong> Wrists, neck and behind
                the ears, from 15 to 20 cm away.
              </li>
              <li>
                <strong>Do not rub.</strong> Let it settle so the composition
                develops as it should.
              </li>
              <li>
                <strong>Store it cool.</strong> Away from direct sunlight,
                moisture and heat.
              </li>
            </ol>
          </div>
        </section>
      )}

      {/* ---- objection handling ---- */}
      <section className="pdp-faq">
        <h2 className="display-title">Before it becomes yours.</h2>
        <div className="pdp-faq-list">
          <details>
            <summary>
              How long does {product.name} last?<span>+</span>
            </summary>
            <p>
              {product.longevity}. Performance varies with skin, climate and how
              much you apply.
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
          {!isCombo && (
            <details>
              <summary>
                Is the 20ml different from the 100ml?<span>+</span>
              </summary>
              <p>
                No. Both formats carry the same Eau de Parfum composition. The
                20ml is for discovery and travel.
              </p>
            </details>
          )}
        </div>
      </section>

      {/* ---- close ---- */}
      <section className="pdp-close">
        <p className="pdp-close-line">
          Four signatures. Yours is one click away.
        </p>
        <Link href="/shop" className="cine-end-cta">
          Explore the collection <ArrowUpRight size={16} />
        </Link>
      </section>

      <StickyBuyBar
        name={product.name}
        size={sizeLabel}
        pricePaise={variant?.pricePaise}
        disabled={!inStock}
        onAdd={add}
        added={added}
        anchorRef={addButtonRef}
      />
    </main>
  );
}
