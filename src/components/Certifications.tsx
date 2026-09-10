import Image from "next/image";

/**
 * The certification marks, in the order they appear.
 *
 * `label` is the visible caption in the strip and the accessible name
 * everywhere; the overlay variants hide the caption and rely on the alt text,
 * so every badge must read correctly on its own.
 */
export const CERTIFICATIONS = [
  { slug: "ifra-certified", label: "IFRA certified" },
  { slug: "fda-approved", label: "FDA approved" },
  { slug: "cruelty-free", label: "Cruelty free" },
  { slug: "phthalate-free", label: "Phthalate free" },
  { slug: "silicone-free", label: "Silicone free" },
  { slug: "recyclable", label: "Recyclable" },
  { slug: "made-in-india", label: "Made in India" },
] as const;

/** Marks that speak to authenticity, for the compact overlay placements. */
const KEY_MARKS = [
  "ifra-certified",
  "fda-approved",
  "cruelty-free",
] as const satisfies readonly (typeof CERTIFICATIONS)[number]["slug"][];

type Variant = "strip" | "overlay" | "row";

/**
 * Certification marks in three presentations:
 *
 *  - `strip`   the full set with captions, for a standalone band
 *  - `row`     the full set, compact and captionless, for the buy rail
 *  - `overlay` the three key marks only, to sit over photography or video
 *
 * The overlay carries its own translucent plate: the badges are dark line art
 * keyed to transparency, which would disappear against a dark photograph
 * without something behind it.
 */
export default function Certifications({
  variant = "strip",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const marks =
    variant === "overlay"
      ? CERTIFICATIONS.filter((item) =>
          KEY_MARKS.includes(item.slug as (typeof KEY_MARKS)[number]),
        )
      : CERTIFICATIONS;
  // The strip is the one place the artwork is meant to be read, so it gets a
  // size where the detail inside each mark survives.
  const size = variant === "strip" ? 88 : 34;

  return (
    <ul
      className={`certifications certifications--${variant} ${className}`.trim()}
      aria-label="Certifications and product standards"
    >
      {marks.map((item) => (
        <li key={item.slug}>
          <Image
            src={`/certifications/web/${item.slug}.png`}
            alt={item.label}
            width={size}
            height={size}
            // Ask for a 2x asset: the strip renders at 88px and the source is
            // 256px, so without this the served 96px variant looks soft on a
            // retina screen.
            sizes={`${size * 2}px`}
            loading="lazy"
          />
          {variant === "strip" && <span>{item.label}</span>}
        </li>
      ))}
    </ul>
  );
}
