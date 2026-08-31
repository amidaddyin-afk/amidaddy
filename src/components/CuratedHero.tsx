import Image from "next/image";

export default function CuratedHero() {
  return (
    <section
      className="cinematic-hero"
      aria-label="Heavenly fragrance campaign"
    >
      <picture className="hero-picture">
        <source media="(min-width: 1024px)" srcSet="/hero/heavenly-wide.webp" />
        <source media="(min-width: 768px)" srcSet="/hero/heavenly-wide.webp" />
        <Image
          src="/hero/heavenly-mobile.webp"
          alt="Model holding an Amidaddy Heavenly perfume bottle beside her face"
          fill
          priority
          unoptimized
          sizes="100vw"
        />
      </picture>
    </section>
  );
}
