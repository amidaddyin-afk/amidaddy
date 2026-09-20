import Link from "next/link";

/**
 * The /shop opening frame.
 *
 * An ivory editorial banner: copy in the clear left third of the photograph,
 * all four bottles in the right. The photograph is the real product shot, so
 * nothing here crops a cap or a base - the desktop art keeps the original
 * composition and the mobile art is a tighter crop of the same file that still
 * holds all four bottles.
 *
 * This is a Server Component and ships no JavaScript. The previous version was
 * a client component running a scroll-linked parallax; the brief asks for a
 * stable, immediately visible photograph, and a one-time entrance is something
 * CSS does on its own. Keeping it server-rendered also means the copy is in the
 * HTML, so it survives a JavaScript failure.
 *
 * The art direction is a plain <picture> rather than two next/image elements.
 * Two elements would both carry `priority` and so preload on every viewport,
 * downloading the unused one; <source media> lets the browser fetch exactly
 * one. The files are pre-encoded to their final sizes by hand (see
 * public/ref/shop-hero-collection-*), so next/image's resizing would add work
 * without adding value here. width/height are set on the <img> so the box is
 * reserved before the bytes arrive and the hero contributes no layout shift.
 *
 * The entrance animation lives in shop.css behind prefers-reduced-motion, and
 * animates from a visible resting state rather than to one, so no content
 * depends on the animation running.
 */
export default function ShopHero() {
  return (
    <section className="shop-hero">
      <div className="shop-hero-inner">
        <div className="shop-hero-copy">
          <p className="eyebrow">The Amidaddy Collection</p>
          <h1>
            Four scents.
            <span>Every side of you.</span>
          </h1>
          <p className="shop-hero-lede">
            Discover your signature in 20ml, 100ml and discovery sets.
          </p>
          <div className="shop-hero-actions">
            <a href="#100ml" className="shop-hero-cta">
              Explore fragrances
            </a>
            {/* next/link, not a bare anchor: this is an internal route, so it
                gets client-side navigation and prefetch. The "Explore
                fragrances" link above stays a plain <a> because a same-page
                hash is not a route change. */}
            <Link
              href="/products/signature-combo-20ml"
              className="shop-hero-secondary"
            >
              Discover all four
            </Link>
          </div>
        </div>

        <div className="shop-hero-media">
          <picture>
            <source
              media="(min-width: 1240px)"
              type="image/avif"
              srcSet="/ref/shop-hero-collection-desktop.avif"
            />
            <source
              media="(min-width: 1240px)"
              type="image/webp"
              srcSet="/ref/shop-hero-collection-desktop.webp"
            />
            {/* 900-1239px: the copy column leaves a short, wide slot, and the
                16:9 original cropped to fill it cut the outer bottle in half.
                This crop is 1.31:1 and centred on the group, so `cover` trims
                only empty wall. */}
            <source
              media="(min-width: 900px)"
              type="image/avif"
              srcSet="/ref/shop-hero-collection-narrow.avif"
            />
            <source
              media="(min-width: 900px)"
              type="image/webp"
              srcSet="/ref/shop-hero-collection-narrow.webp"
            />
            <source
              type="image/avif"
              srcSet="/ref/shop-hero-collection-mobile.avif"
            />
            <source
              type="image/webp"
              srcSet="/ref/shop-hero-collection-mobile.webp"
            />
            <img
              src="/ref/shop-hero-collection-desktop.webp"
              alt="The four Amidaddy fragrances - Old Love, Heavenly, Billionaire and Cold War - in 100ml bottles on a travertine plinth"
              width={2400}
              height={1351}
              fetchPriority="high"
              decoding="async"
              className="shop-hero-img"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
