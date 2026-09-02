"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { FragranceFamily, Product } from "@/lib/data";
import Reveal from "@/components/Reveal";

const questions: Array<{
  title: string;
  options: Array<{ label: string; family: FragranceFamily }>;
}> = [
  {
    title: "Tonight, you are...",
    options: [
      { label: "The one everyone notices", family: "Woody" },
      { label: "The one nobody can read", family: "Fresh" },
      { label: "The one someone wants closer", family: "Floral" },
      { label: "The one someone remembers", family: "Amber" },
    ],
  },
  {
    title: "Your energy is...",
    options: [
      { label: "Powerful", family: "Woody" },
      { label: "Sharp", family: "Fresh" },
      { label: "Soft", family: "Floral" },
      { label: "Romantic", family: "Amber" },
    ],
  },
  {
    title: "Where are you going?",
    options: [
      { label: "A night out", family: "Woody" },
      { label: "The office", family: "Fresh" },
      { label: "Everyday", family: "Floral" },
      { label: "A date", family: "Amber" },
    ],
  },
];

export default function ScentFinder({ products }: { products: Product[] }) {
  const [answers, setAnswers] = useState<FragranceFamily[]>([]);
  const step = answers.length;
  const result = useMemo(() => {
    if (step < questions.length) return null;
    const scores = answers.reduce<Record<string, number>>(
      (all, item) => ({ ...all, [item]: (all[item] ?? 0) + 1 }),
      {},
    );
    const family = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
    return (
      products.find((product) => product.profile === family) ?? products[0]
    );
  }, [answers, products, step]);
  return (
    <section className="finder-section" id="scent-finder">
      <div className="finder-orbit" />
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.75fr_1.25fr]">
        <Reveal from="left">
          <p className="eyebrow">Scent finder · 60 seconds</p>
          <h2 className="display-title mt-5 text-5xl">
            Which version of you is here today?
          </h2>
          <p className="text-subtle mt-6 max-w-sm leading-7">
            Fragrance is difficult to describe and easy to feel. Three choices
            will bring you closer to yours.
          </p>
        </Reveal>
        <Reveal className="finder-card" delay={0.08}>
          {!result ? (
            <>
              <div className="finder-progress">
                {questions.map((_, index) => (
                  <span key={index} className={index <= step ? "active" : ""} />
                ))}
              </div>
              <p className="text-subtle mt-8 text-xs tracking-[.18em] uppercase">
                Question {step + 1} of {questions.length}
              </p>
              <h3 className="display-title mt-4 text-3xl">
                {questions[step].title}
              </h3>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {questions[step].options.map((option) => (
                  <button
                    key={option.label}
                    onClick={() =>
                      setAnswers((current) => [...current, option.family])
                    }
                    className="finder-option"
                  >
                    {option.label}
                    <ArrowRight size={15} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="grid items-center gap-8 sm:grid-cols-2">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={result.image}
                  alt={`${result.name} — ${result.profile} ${result.concentration} by Amidaddy Perfumes`}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="eyebrow">Your instinct says</p>
                <h3 className="display-title mt-3 text-4xl">{result.name}</h3>
                <p className="text-muted mt-4 leading-7">
                  {result.description}
                </p>
                <Link
                  href={`/products/${result.slug}`}
                  className="lux-button mt-7"
                >
                  Meet your scent <ArrowRight size={15} />
                </Link>
                <button
                  onClick={() => setAnswers([])}
                  className="text-subtle hover:text-fg mt-5 flex items-center gap-2 text-xs tracking-[.15em] uppercase"
                >
                  <RotateCcw size={13} /> Start again
                </button>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
