"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    desktop: "/hero/heavenly-wide.webp",
    mobile: "/hero/heavenly-mobile.webp",
    alt: "Model holding an Amidaddy Heavenly perfume bottle beside her face",
  },
  {
    desktop: "/curated/product-detail-1.jpg",
    mobile: "/products/20ml/studio/pack-of-4.webp",
    alt: "The four Amidaddy signature fragrances",
  },
  {
    desktop: "/curated/products/billionaire/detail.JPG",
    mobile: "/gallery/billionaire/01.webp",
    alt: "Amidaddy Billionaire perfume campaign",
  },
  {
    desktop: "/curated/products/coldwar/detail.JPG",
    mobile: "/gallery/coldwar/02.webp",
    alt: "Amidaddy Cold War perfume campaign",
  },
  {
    desktop: "/curated/products/old-love/detail.JPG",
    mobile: "/gallery/old-love/01.webp",
    alt: "Amidaddy Old Love perfume campaign",
  },
  {
    desktop: "/products/combos/100ml/01.webp",
    mobile: "/products/20ml/studio/pack-of-4.webp",
    alt: "Amidaddy fragrance collection arranged in studio light",
  },
] as const;

export default function CuratedHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      5500,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  const show = (index: number) => {
    setActive((index + slides.length) % slides.length);
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
      {slides.map((slide, index) => (
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

      <div className="hero-carousel-controls">
        <button
          type="button"
          onClick={() => show(active - 1)}
          aria-label="Previous campaign image"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="hero-carousel-dots" aria-label="Choose campaign image">
          {slides.map((slide, index) => (
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
        {String(slides.length).padStart(2, "0")}
      </span>
    </section>
  );
}
