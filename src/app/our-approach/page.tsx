import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Our Approach",
  description:
    "Why Amidaddy makes fragrance on its own terms: original compositions, carefully chosen ingredients, and a scent built to be worn.",
  alternates: { canonical: "/our-approach" },
};

const blocks = [
  {
    heading: "Original, not a reference.",
    body: "Every Amidaddy scent is its own composition. We are not trying to reproduce another house's smell, and we do not name one on the label.",
    image: "/ref/billionaire-3994.webp",
    alt: "The Billionaire bottle in its campaign setting",
  },
  {
    heading: "The composition comes first.",
    body: "Our attention goes to what is in the bottle and how it develops on skin, from the first spray to the trail it leaves hours later.",
    image: "/ref/collection-4x100ml-desktop.webp",
    alt: "The four Amidaddy signatures in 100ml and 20ml, stacked together",
  },
  {
    heading: "Made to be worn, not saved.",
    body: "Fragrance you finish, in a size that fits your routine. Start with 20ml to discover; keep 100ml for every day.",
    image: "/ref/cold-war-3536.webp",
    alt: "Close detail of the Cold War bottle",
  },
];

export default function OurApproachPage() {
  return (
    <main data-surface="story" className="approach-page cinematic">
      <section className="approach-hero">
        <div className="approach-hero-copy">
          <h1 className="display-title">
            Everything begins inside the bottle.
          </h1>
          <p className="approach-lead">
            We started Amidaddy to make fragrance on our own terms: original
            compositions, carefully chosen ingredients, and a scent that earns
            its place in your day.
          </p>
        </div>
        <Reveal variant="clip" className="approach-hero-media">
          <Photo
            src="/ref/old-love-3804.webp"
            alt="Old Love photographed for the campaign"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </Reveal>
      </section>

      <section className="approach-blocks">
        {blocks.map((block, i) => (
          <Reveal
            as="article"
            key={block.heading}
            index={i}
            className={`approach-block ${i === 0 ? "approach-block--lead" : ""}`}
          >
            <div className="approach-block-media">
              <Photo
                src={block.image}
                alt={block.alt}
                fill
                sizes="(max-width: 860px) 100vw, 46vw"
                className="object-cover"
              />
            </div>
            <div className="approach-block-copy">
              <h2>{block.heading}</h2>
              <p>{block.body}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="approach-quote">
        <Reveal>
          <p>
            We are not chasing a trend or a dupe. We are building four scents we
            wanted to wear ourselves.
          </p>
        </Reveal>
      </section>

      <section className="approach-final">
        <Reveal>
          <p className="approach-founder">Find the one that fits you.</p>
          <Link href="/shop" className="lux-button">
            Explore the four signatures <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
