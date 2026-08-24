"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { HeroSlide } from "@/lib/hero";

export default function CuratedHero({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(
      () => setActive((value) => (value + 1) % slides.length),
      6500,
    );
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, slides.length]);
  const finishSwipe = (x: number, y: number) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || slides.length < 2) return;
    const horizontalDistance = x - start.x;
    const verticalDistance = y - start.y;
    if (
      Math.abs(horizontalDistance) < 42 ||
      Math.abs(horizontalDistance) <= Math.abs(verticalDistance)
    )
      return;
    setActive((value) =>
      horizontalDistance < 0
        ? (value + 1) % slides.length
        : (value - 1 + slides.length) % slides.length,
    );
    setPaused(true);
  };
  const slide = slides[active];
  return (
    <section
      className="cinematic-hero"
      aria-roledescription="carousel"
      aria-label="Featured fragrances"
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
          disabled={Boolean(reduceMotion)}
          aria-label={
            reduceMotion
              ? "Automatic slideshow disabled by motion preference"
              : paused
                ? "Play slideshow"
                : "Pause slideshow"
          }
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
