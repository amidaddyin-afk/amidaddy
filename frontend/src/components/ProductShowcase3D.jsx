"use client";

import { useEffect, useMemo, useState } from "react";

const FALLBACK_SLIDES = [
  {
    id: "placeholder",
    name: "Citrus Veil",
    category: "Trial set",
    price: "699",
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
    <div className="w-full rounded-2xl border border-black/10 bg-white p-5">
      <div className="relative overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="relative min-w-full">
              <div className="h-[300px] md:h-[360px]">
                <img src={slide.src} alt={slide.name} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-black/40 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-white/80">{slide.category}</p>
                <div className="mt-1 flex items-center justify-between">
                  <h3 className="text-base font-semibold">{slide.name}</h3>
                  <span className="text-sm">INR {slide.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(slideIndex)}
              className={`h-1.5 w-7 rounded-full ${slideIndex === index ? "bg-ink" : "bg-black/20"}`}
              aria-label={`Go to slide ${slideIndex + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-2 text-sm">
          <button type="button" onClick={goPrev} className="rounded-full border border-black/15 px-3 py-1">
            Prev
          </button>
          <button type="button" onClick={goNext} className="rounded-full border border-black/15 px-3 py-1">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
