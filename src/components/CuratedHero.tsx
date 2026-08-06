"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  "/curated/hero-models.JPG",
  "/curated/hero-models-2.JPG",
  "/curated/hero-models-3.JPG",
  "/curated/billionaire.JPG",
  "/curated/cold-war.JPG",
  "/curated/heavenly.JPG",
  "/curated/old-love.JPG",
  "/curated/product-detail-1.jpg",
  "/curated/product-detail-2.JPG",
];

export default function CuratedHero() {
  const [active, setActive] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 5500); return () => window.clearInterval(id); }, []);
  return <section className="curated-hero"><div className="curated-slides">{slides.map((src, index) => <Image key={src} src={src} alt="Amidaddy fragrance" fill priority={index === 0} className={index === active ? "is-active" : ""} />)}</div><div className="curated-copy"><p>Unisex fragrance collection</p><h1>Four scents.<br />One signature.</h1><span>100 ml Rs. 1,199. Discovery bottles from Rs. 199.</span><a href="#collection-grid">Shop fragrances</a></div><div className="curated-dots">{slides.map((_, index) => <button key={index} onClick={() => setActive(index)} aria-label={`Show slide ${index + 1}`} className={index === active ? "active" : ""} />)}</div></section>;
}
