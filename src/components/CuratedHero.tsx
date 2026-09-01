"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    desktop: "/hero/heavenly-wide.webp",
    mobile: "/hero/heavenly-mobile.webp",
    alt: "Model holding an Amidaddy Heavenly perfume bottle beside her face",
    kicker: "Heavenly",
    title: "Leave a softer trace.",
    copy: "White florals, vanilla and musk with a quiet, lasting presence.",
    href: "/products/heavenly",
  },
  {
    desktop: "/curated/product-detail-1.jpg",
    mobile: "/products/20ml/studio/pack-of-4.webp",
    alt: "The four Amidaddy signature fragrances",
    kicker: "The discovery wardrobe",
    title: "Four signatures. One feeling.",
    copy: "Meet every mood in a travel-ready collection.",
    href: "/products/signature-combo-20ml",
  },
  {
    desktop: "/curated/products/billionaire/detail.JPG",
    mobile: "/gallery/billionaire/01.webp",
    alt: "Amidaddy Billionaire perfume campaign",
    kicker: "Billionaire",
    title: "Own the room.",
    copy: "Whiskey, spice and dark woods composed with confidence.",
    href: "/products/billionaire",
  },
  {
    desktop: "/curated/products/coldwar/detail.JPG",
    mobile: "/gallery/coldwar/02.webp",
    alt: "Amidaddy Cold War perfume campaign",
    kicker: "Cold War",
    title: "Make your move.",
    copy: "Bright fruit, aromatic herbs and woods with a sharp edge.",
    href: "/products/coldwar",
  },
  {
    desktop: "/curated/products/old-love/detail.JPG",
    mobile: "/gallery/old-love/01.webp",
    alt: "Amidaddy Old Love perfume campaign",
    kicker: "Old Love",
    title: "Stay unforgettable.",
    copy: "Warm saffron, amber and resin designed to linger.",
    href: "/products/old-love",
  },
  {
    desktop: "/products/combos/100ml/01.webp",
    mobile: "/products/20ml/studio/pack-of-4.webp",
    alt: "Amidaddy fragrance collection arranged in studio light",
    kicker: "The full collection",
    title: "Meet every mood.",
    copy: "All four signatures, composed for every side of you.",
    href: "/shop",
  },
] as const;

export default function CuratedHero({ slideOrder }: { slideOrder: number[] }) {
  const orderedSlides = slideOrder
    .map((index) => slides[index])
    .filter((slide): slide is (typeof slides)[number] => Boolean(slide));
  const carouselSlides =
    orderedSlides.length === slides.length ? orderedSlides : [...slides];
  const slideCount = carouselSlides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slideCount),
      5500,
    );
    return () => window.clearInterval(timer);
  }, [paused, slideCount]);

  const show = (index: number) => {
    setActive((index + carouselSlides.length) % carouselSlides.length);
  };

  return (
    <section
      className="cinematic-hero hero-carousel"
      aria-label="Amidaddy fragrance campaigns"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {carouselSlides.map((slide, index) => (
        <div
          key={slide.desktop}
          className={`hero-slide ${index === active ? "is-active" : ""}`}
          aria-hidden={index !== active}
        >
          <picture className="hero-picture">
            <source media="(min-width: 768px)" srcSet={slide.desktop} />
            <Image
              src={slide.mobile}
              alt={index === active ? slide.alt : ""}
              fill
              priority={index === 0}
              unoptimized
              sizes="100vw"
            />
          </picture>
        </div>
      ))}

      <div className="mobile-hero-copy" aria-live="polite">
        <p>{carouselSlides[active].kicker}</p>
        <h1>{carouselSlides[active].title}</h1>
        <span>{carouselSlides[active].copy}</span>
        <Link href={carouselSlides[active].href}>Discover the scent</Link>
      </div>

      <div className="hero-carousel-controls">
        <button
          type="button"
          onClick={() => show(active - 1)}
          aria-label="Previous campaign image"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="hero-carousel-dots" aria-label="Choose campaign image">
          {carouselSlides.map((slide, index) => (
            <button
              key={slide.desktop}
              type="button"
              className={index === active ? "is-active" : ""}
              onClick={() => show(index)}
              aria-label={`Show campaign image ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => show(active + 1)}
          aria-label="Next campaign image"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <span className="hero-carousel-count" aria-hidden="true">
        {String(active + 1).padStart(2, "0")} /{" "}
        {String(carouselSlides.length).padStart(2, "0")}
      </span>
    </section>
  );
}
