"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, ViewTransition } from "react";
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
import { analytics, toItem } from "@/lib/analytics";
import Photo from "@/components/Photo";
import ProductStory, { type StoryTile } from "@/components/ProductStory";
import ProductGallery from "@/components/ProductGallery";
import FragranceSwitcher from "@/components/FragranceSwitcher";
import Certifications from "@/components/Certifications";
import StickyBuyBar from "@/components/StickyBuyBar";
import HeroVideo from "@/components/HeroVideo";

/**
 * Folder name under /perfumeNotes for each fragrance. The photography is
 * shot per tier — top.jpeg, heart.jpeg, base.jpeg — for these four singles;
 * the combos have no note pyramid of their own and so get no section.
 */
const NOTE_IMAGE_DIRS: Partial<Record<string, string>> = {
  "old-love": "OldLove",
  coldwar: "ColdWar",
  heavenly: "Heavenly",
  billionaire: "Billionaire",
};

/** Campaign hero loops encoded into public/videos/ (see
 *  scripts/encode-product-video.mjs). The combos have no film, so they keep the
 *  still hero. */
const VIDEO_SLUGS = ["coldwar", "old-love", "heavenly", "billionaire"];

/** Per-fragrance PDP intro paragraph (plan §8.1–8.4). Falls back to
 *  product.description where a slug is not listed. */
const pdpIntros: Partial<Record<string, string>> = {
  billionaire:
    "Billionaire opens on a warm whiskey note, then spice: cinnamon and coriander settle in. The dry-down is tobacco, oud and resin, the part people remember after you have left the room.",
  coldwar:
    "Cold War opens sharp: plum, bergamot, mandarin. Pepper and juniper keep it from turning sweet. It ends dry on oakmoss and cedar, the kind of fresh that reads as composure rather than soap.",
  heavenly:
    "Heavenly opens on vanilla orchid and jasmine, then tonka and vanilla absolute settle in. Brown sugar and musk in the base keep it soft and close to the skin, a scent people notice when they are already near you.",
  "old-love":
    "Old Love opens on saffron and mango, bright for a moment. Then amber, sugar and ambergris pull it warm and low. Fir resin, ambroxan and cedar hold the base, the kind of scent that reads as a memory rather than a first impression.",
};

/** Per-fragrance "how it unfolds" captions (plan §8.1–8.4, "Unfold" rows). */
const unfoldCaptions: Partial<Record<string, [string, string, string]>> = {
  billionaire: [
    "An opening of whiskey notes.",
    "Spice, cinnamon and coriander come forward.",
    "Tobacco, woods and resin shape the dry-down.",
  ],
  coldwar: [
    "Plum, bergamot and mandarin, cold at first.",
    "Pepper and juniper hold the centre.",
    "Oakmoss and cedar in the dry-down.",
  ],
  heavenly: [
    "Vanilla orchid and jasmine open it.",
    "Tonka bean and vanilla absolute at the heart.",
    "Brown sugar and musk in the trail.",
  ],
  "old-love": [
    "Saffron and mango, bright for a moment.",
    "Amber, sugar and ambergris pull it warm.",
    "Fir resin, ambroxan and cedar hold the base.",
  ],
};

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

/** How many frames the vertical story shows at most. */
const STORY_TILE_COUNT = 4;

/**
 * The note journey.
 *
 * For the four singles this is told over the note photography — one still per
 * tier, shot for that ingredient — so the section that names the notes is the
 * section that shows them. The tiers are the content, which is why there is no
 * separate note grid elsewhere on the page.
 *
 * The combos have no note pyramid of their own, so they keep the earlier
 * behaviour: product photography with copy derived from their note lists.
 */
function buildStoryTiles(
  product: Product,
  images: string[],
  size: "20ml" | "100ml",
): StoryTile[] {
  const noteDir = NOTE_IMAGE_DIRS[product.slug];
  const unfold = unfoldCaptions[product.slug];

  if (noteDir) {
    const tiers = [
      { key: "top", label: "Top notes", notes: product.topNotes },
      { key: "heart", label: "Heart notes", notes: product.heartNotes },
      { key: "base", label: "Base notes", notes: product.baseNotes },
    ] as const;
    return tiers.map((tier, index) => ({
      image: `/perfumeNotes/${noteDir}/${tier.key}.jpeg`,
      heading: tier.label,
      // The hand-written line where there is one, the note list otherwise.
      copy: unfold?.[index] ?? tier.notes.join(", "),
      alt: `${tier.label} of ${product.name}: ${tier.notes.join(", ")}`,
    }));
  }

  const entries = STORY_COPY.map((entry) => ({
    heading: entry.heading,
    copy: entry.from(product),
  }));
  return entries
    .slice(0, Math.min(STORY_TILE_COUNT, images.length))
    .map((entry, index) => ({
      image: images[index],
      heading: entry.heading,
      copy: entry.copy,
      alt: `${product.name} ${product.concentration}, ${size} — ${entry.heading.toLowerCase()}`,
    }));
}

export default function ProductDetail({ product }: { product: Product }) {
  const available = product.variants.filter(
    (variant) => variant.active && variant.stock > variant.reserved,
  );
  const [size, setSize] = useState<"20ml" | "100ml">(
    available.find((item) => item.name === "100ml")?.name ??
      available[0]?.name ??
      "100ml",
  );

  // Honour `?size=` from links like /products/x?size=20ml.
  //
  // Read from window rather than useSearchParams(): this page is prerendered,
  // and useSearchParams() forces a Suspense boundary whose fallback would ship
  // an empty product page to crawlers. Reading in an effect keeps the full
  // product HTML static and just adjusts the preselection after hydration.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("size");
    if (requested !== "20ml" && requested !== "100ml") return;
    if (available.some((item) => item.name === requested)) setSize(requested);
    // Only on mount: after this the shopper's own size clicks own the state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCart();
  const router = useRouter();
  const variant = product.variants.find((item) => item.name === size);
  const isCombo = product.collection === "combos";
  // Set when this fragrance has note photography; buildStoryTiles uses it, and
  // the "how to wear" steps below are shown for the same four singles.
  const noteDir = NOTE_IMAGE_DIRS[product.slug];
  const character = [
    ...(isCombo ? [] : [product.profile]),
    ...product.mood.split(/,| and /),
  ]
    .map((word) => word.trim())
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  const sizeOptions = product.variants.filter((item) => item.active);
  const activeImages =
    product.variantImages?.[size]?.length && product.variantImages[size]
      ? product.variantImages[size]!
      : product.images;
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const heroImage = activeImages[0];
  // The gallery shows the size-correct bottle first, then the rest of the
  // shoot — campaign frames included. variantImages alone is deliberately
  // narrow (often a single pack shot), which would leave nothing to swipe, so
  // the full image list follows it. Deduped, since the lead frame usually
  // appears in both.
  const galleryImages = [...new Set([...activeImages, ...product.images])];
  // The story runs further down the same page as the hero and the gallery's
  // opening frame, both of which lead on galleryImages[0]. Starting the story
  // at the same photograph shows the visitor one image three times, so it
  // begins after the frames those two already used and only falls back to the
  // full set when there is not enough photography to go around.
  const storyImages =
    galleryImages.length > STORY_TILE_COUNT
      ? galleryImages.slice(1)
      : galleryImages;
  const storyTiles = buildStoryTiles(product, storyImages, size);
  const sizeLabel =
    product.packSize && product.packSize > 1
      ? `${product.packSize} × ${size}`
      : size;
  const inStock = !!variant && variant.stock > variant.reserved;
  const onSale = !!variant && variant.mrpPaise > variant.pricePaise;

  const buyDesc = pdpIntros[product.slug] ?? product.description;

  // Fire view_item once per product, and again when the shopper switches size.
  useEffect(() => {
    analytics.viewItem(toItem(product, size));
  }, [product, size]);

  const add = () => {
    addItem(product, size);
    openCart();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const buyNow = () => {
    addItem(product, size);
    router.push("/checkout");
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
          {/* Campaign loop, layered over the still once it can play. The image
              above stays put so the hero is never blank and keeps its morph
              from the product card. */}
          {VIDEO_SLUGS.includes(product.slug) && (
            <HeroVideo slug={product.slug} className="pdp-hero-video" />
          )}
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
          <div
            className="pdp-hero-sizes"
            role="group"
            aria-label="Choose bottle size"
          >
            {sizeOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.name === size}
                disabled={item.stock <= item.reserved}
                onClick={() => setSize(item.name)}
              >
                {product.packSize && product.packSize > 1
                  ? `${product.packSize} × ${item.name}`
                  : item.name}
              </button>
            ))}
          </div>
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
            <button
              type="button"
              onClick={buyNow}
              disabled={!inStock}
              className="pdp-buy-now pdp-hero-buy-now"
            >
              Buy it now
            </button>
          </div>
        </div>
      </section>

      {/* ---- the object: the full gallery beside the buy rail ----
          Static, never revealed on scroll: the buy rail must not depend on a
          motion trigger firing. */}
      <section className="pdp-object">
        <div className="pdp-object-media">
          <ProductGallery
            images={galleryImages}
            name={product.name}
            concentration={product.concentration}
          />
        </div>
        <div className="pdp-buy lg:sticky lg:top-28 lg:h-fit">
          <p className="pdp-buy-notes">
            {product.topNotes.slice(0, 3).join(" · ")}
          </p>
          <h2 className="pdp-buy-name">{product.name}</h2>
          <p className="pdp-buy-desc">{buyDesc}</p>

          {sizeOptions.length > 1 && (
            <div
              className="pdp-sizes"
              role="group"
              aria-label="Choose bottle size"
            >
              {sizeOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pdp-size ${item.name === size ? "active" : ""}`}
                  aria-pressed={item.name === size}
                  disabled={item.stock <= item.reserved}
                  onClick={() => setSize(item.name)}
                >
                  <span>{item.name}</span>
                  <small>
                    {item.name === "20ml" ? "Discover it" : "Make it yours"}
                  </small>
                </button>
              ))}
            </div>
          )}

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
          <button
            type="button"
            onClick={buyNow}
            disabled={!inStock}
            className="pdp-buy-now"
          >
            Buy it now
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

          {/* The marks themselves, at the point of decision. */}
          <Certifications variant="row" className="pdp-assure-marks" />

          <dl className="pdp-facts">
            <div>
              <dt>Wears</dt>
              <dd>{product.longevity}</dd>
            </div>
            {product.intensity ? (
              <div>
                <dt>Intensity</dt>
                <dd aria-label={`${product.intensity} out of 5`}>
                  {"★".repeat(product.intensity)}
                  {"☆".repeat(Math.max(0, 5 - product.intensity))}
                </dd>
              </div>
            ) : null}
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

      {/* ---- the note journey, told over the note photography ---- */}
      <section
        className="pdp-unfolds"
        data-story={noteDir ? "notes" : "photos"}
      >
        <div className="pdp-section-head">
          <h2 className="display-title">
            {noteDir ? "The notes." : "How it unfolds."}
          </h2>
          <p>
            {noteDir
              ? `What ${product.name} is built from, tier by tier — the opening, the heart it settles into, and the base it leaves behind.`
              : "Three moments, from the first spray to the trail it leaves."}
          </p>
        </div>
        <ProductStory tiles={storyTiles} />
      </section>

      {/* ---- how to wear ---- */}
      {noteDir && (
        <section className="pdp-detail">
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
      {/* Jump straight to another signature without going back to the shop. */}
      <FragranceSwitcher />
    </main>
  );
}
