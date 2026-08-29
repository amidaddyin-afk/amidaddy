"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const signatureCatalog = [
  {
    name: "Cold War",
    profile: "Fresh · Cool and focused",
    number: "01",
    href: "/products/coldwar",
    image: "/curated/cold-war.JPG",
  },
  {
    name: "Heavenly",
    profile: "Floral · Soft and elegant",
    number: "02",
    href: "/products/heavenly",
    image: "/curated/heavenly.JPG",
  },
  {
    name: "Old Love",
    profile: "Amber · Warm and intimate",
    number: "03",
    href: "/products/old-love",
    image: "/curated/old-love.JPG",
  },
  {
    name: "Billionaire",
    profile: "Woody · Bold and magnetic",
    number: "04",
    href: "/products/billionaire",
    image: "/curated/billionaire.JPG",
  },
] as const;

export default function CuratedHero() {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const coverTransition = {
    duration: reduceMotion ? 0.01 : 1.4,
    ease: [0.65, 0, 0.35, 1] as const,
  };

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const visitProduct = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => router.push(href), 420);
  };

  return (
    <section
      className={`book-hero ${open ? "is-open" : ""} ${leaving ? "is-leaving" : ""}`}
      aria-label="Enter the Amidaddy fragrance collection"
      aria-busy={leaving}
    >
      <div className="book-hero-reveal" aria-hidden={!open}>
        <div className="book-reveal-heading">
          <p className="eyebrow">The signature collection</p>
          <h1>Choose the scent that feels like you.</h1>
          <p>
            Meet all four Amidaddy perfumes, each composed around a distinct
            mood.
          </p>
        </div>
        <nav className="family-gateway" aria-label="Shop Amidaddy perfumes">
          {signatureCatalog.map((product) => (
            <Link
              key={product.name}
              href={product.href}
              onClick={(event) => visitProduct(event, product.href)}
              tabIndex={open ? undefined : -1}
            >
              <span>{product.number}</span>
              <strong>{product.name}</strong>
              <div className="family-product-image">
                <Image
                  src={product.image}
                  alt={`${product.name} perfume`}
                  fill
                  sizes="(max-width: 700px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <small>{product.profile}</small>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="book-close"
          onClick={() => setOpen(false)}
          tabIndex={open ? undefined : -1}
        >
          Close the cover
        </button>
      </div>

      <div className="book-cover" aria-hidden={open}>
        <motion.div
          className="book-leaf book-leaf-left"
          initial={false}
          animate={{ rotateY: open ? -96 : 0 }}
          transition={coverTransition}
        >
          <div className="book-image-half">
            <Image
              src="/curated/hero-models.JPG"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </motion.div>
        <motion.div
          className="book-leaf book-leaf-right"
          initial={false}
          animate={{ rotateY: open ? 96 : 0 }}
          transition={coverTransition}
        >
          <div className="book-image-half">
            <Image
              src="/curated/hero-models.JPG"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </motion.div>
        <div className="book-cover-shade" />
        <div className="book-cover-copy">
          <p className="eyebrow">The house of Amidaddy</p>
          <h1>
            Wear the
            <br />
            feeling.
          </h1>
          <p>Four fragrances. Four versions of you.</p>
        </div>
        <span className="book-spine" />
      </div>

      <button
        type="button"
        className="book-open-trigger"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Open the fragrance collection"
        disabled={open}
      >
        <span>Explore the four signatures</span>
        <ArrowDown aria-hidden="true" />
      </button>
      {!open && (
        <button
          type="button"
          className="book-skip"
          onClick={() => setOpen(true)}
        >
          Skip intro
        </button>
      )}
    </section>
  );
}
