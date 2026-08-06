"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownRight, Pause, Play } from "lucide-react";

const slides = [
  {
    image: "/curated/hero-models.JPG",
    kicker: "Amidaddy Eau de Parfum",
    title: "Presence, before words.",
    copy: "Four unisex signatures composed for the moods you remember.",
    href: "/shop",
  },
  {
    image: "/curated/billionaire.JPG",
    kicker: "Billionaire Noir",
    title: "Enter like you mean it.",
    copy: "Bergamot, polished cedar and amber with a magnetic dry-down.",
    href: "/products/billionaire",
  },
  {
    image: "/curated/cold-war.JPG",
    kicker: "Cold War",
    title: "Clarity has a temperature.",
    copy: "Mineral freshness, pepper and clean musk cut through the noise.",
    href: "/products/coldwar",
  },
  {
    image: "/curated/old-love.JPG",
    kicker: "Old Love",
    title: "Some feelings stay.",
    copy: "Saffron, warm resin and vanilla, held close to the skin.",
    href: "/products/old-love",
  },
];

export default function CuratedHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(
      () => setActive((value) => (value + 1) % slides.length),
      6500,
    );
    return () => window.clearInterval(id);
  }, [paused]);
  const slide = slides[active];
  return (
    <section
      className="cinematic-hero"
      aria-roledescription="carousel"
      aria-label="Featured fragrances"
    >
      <div className="hero-media">
        {slides.map((item, index) => (
          <Image
            key={item.image}
            src={item.image}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={index === active ? "active" : ""}
          />
        ))}
      </div>
      <div className="hero-wash" />
      <div className="hero-copy" aria-live="polite">
        <p className="eyebrow">{slide.kicker}</p>
        <h1>{slide.title}</h1>
        <p className="hero-description">{slide.copy}</p>
        <Link href={slide.href} className="lux-button">
          Discover the scent <ArrowDownRight size={17} />
        </Link>
      </div>
      <div className="hero-controls">
        <button
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <div>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActive(index)}
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === active}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="hero-index">
        {String(active + 1).padStart(2, "0")}
        <span /> {String(slides.length).padStart(2, "0")}
      </div>
    </section>
  );
}
