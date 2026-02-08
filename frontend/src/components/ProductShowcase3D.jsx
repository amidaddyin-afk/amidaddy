"use client";

import { useEffect, useMemo, useState } from "react";

const FALLBACK_SLIDES = [
  {
    id: "placeholder",
    name: "Citrus Veil",
    category: "Trial set",
    price: "399",
    src: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1600&auto=format&fit=crop"
  }
];

function buildSlides(products = [], baseURL = "") {
  const slides = products
    .filter((product) => product?.images?.length)
    .map((product) => {
      const raw = product.images[0];
      const src = raw?.startsWith("http") ? raw : `${baseURL}${raw}`;
      return {
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        src
      };
    });

  return slides.length ? slides : FALLBACK_SLIDES;
}

export default function ProductShowcase3D({ products = [], baseURL = "" }) {
  const slides = useMemo(() => buildSlides(products, baseURL), [products, baseURL]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (index >= slides.length) {
      setIndex(0);
    }
  }, [index, slides.length]);

  const goNext = () => setIndex((current) => (current + 1) % slides.length);
  const goPrev = () => setIndex((current) => (current - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/70 via-white/40 to-white/10 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,164,0.18),_transparent_55%)]" />
      <div className="relative grid gap-8 p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.5em] text-black/50">
            Valentine Sale Live
          </p>
          <h2 className="font-display text-3xl leading-tight md:text-4xl">
            Buy 1 get 1 on signature perfumes.
          </h2>
          <p className="max-w-md text-sm text-black/60">
            Stock up on bestsellers, trial sets, and long-lasting blends with
            free shipping above ₹399.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_15px_30px_rgba(15,23,42,0.35)]">
              Shop now
            </button>
            <button className="rounded-full border border-black/20 bg-white/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black/70">
              View trial set
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-black/50">
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">
              10-12 hr wear
            </span>
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">
              Easy returns
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/20 shadow-[0_20px_60px_rgba(14,165,164,0.18)] backdrop-blur">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {slides.map((slide) => (
                <div key={slide.id} className="relative min-w-full">
                  <div className="h-[320px] md:h-[380px]">
                    <img
                      src={slide.src}
                      alt={slide.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-6 text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                      {slide.category}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <h3 className="font-display text-lg">{slide.name}</h3>
                      <span className="text-sm font-semibold">₹{slide.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-full border border-white/40 bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-full border border-white/40 bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/70"
            >
              Next
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(slideIndex)}
                className={`h-2 w-8 rounded-full transition-all ${
                  slideIndex === index
                    ? "bg-ink shadow-[0_0_10px_rgba(15,23,42,0.6)]"
                    : "bg-black/20"
                }`}
                aria-label={`Go to slide ${slideIndex + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
