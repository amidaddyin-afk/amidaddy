"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import type { FragranceFamily, Product } from "@/lib/data";
import { analytics } from "@/lib/analytics";

const questions: Array<{
  title: string;
  options: Array<{ label: string; family: FragranceFamily }>;
}> = [
  {
    title: "Which notes draw you in?",
    options: [
      { label: "Woods and spice", family: "Woody" },
      { label: "Fresh fruit and herbs", family: "Fresh" },
      { label: "Vanilla and florals", family: "Floral" },
      { label: "Amber and resin", family: "Amber" },
    ],
  },
  {
    title: "When will you wear it most?",
    options: [
      { label: "Daytime", family: "Fresh" },
      { label: "Evenings", family: "Amber" },
      { label: "A little of both", family: "Floral" },
    ],
  },
  {
    title: "How would you describe your mood?",
    options: [
      { label: "Bold", family: "Woody" },
      { label: "Composed", family: "Fresh" },
      { label: "Soft", family: "Floral" },
      { label: "Warm", family: "Amber" },
    ],
  },
];

/**
 * Three-question scent finder. Beside the questions, a live match meter shows
 * the four fragrances filling up as each answer lands, so the visitor watches
 * their result form rather than waiting for a reveal at the end.
 */
export default function ScentFinder({ products }: { products: Product[] }) {
  const [answers, setAnswers] = useState<FragranceFamily[]>([]);
  const step = answers.length;
  const done = step >= questions.length;
  const share = (product: Product) =>
    step ? answers.filter((a) => a === product.profile).length / step : 0;
  const result = useMemo(() => {
    if (!done) return null;
    const scores = answers.reduce<Record<string, number>>(
      (all, item) => ({ ...all, [item]: (all[item] ?? 0) + 1 }),
      {},
    );
    const family = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
    return (
      products.find((product) => product.profile === family) ?? products[0]
    );
  }, [answers, products, done]);
  const leader = step
    ? [...products].sort((a, b) => share(b) - share(a))[0]
    : undefined;

  const started = useRef(false);
  useEffect(() => {
    if (step === 1 && !started.current) {
      started.current = true;
      analytics.scentFinderStart();
    }
  }, [step]);
  useEffect(() => {
    if (result) analytics.scentFinderComplete(result.slug);
  }, [result]);

  return (
    <section className="finder-section sf" id="scent-finder">
      <div className="sf-panel">
        <div className="sf-intro">
          <p className="sf-eyebrow">
            <Sparkles size={14} aria-hidden="true" /> Scent finder
          </p>
          <h2 className="sf-title">What do you want to feel?</h2>
          <p className="sf-sub">
            Three quick questions. Watch your match take shape.
          </p>
          <ul className="sf-meter" aria-label="Your match so far">
            {products.map((product) => {
              const pct = Math.round(share(product) * 100);
              return (
                <li
                  key={product.id}
                  data-lead={
                    (result ?? leader)?.id === product.id && step
                      ? true
                      : undefined
                  }
                >
                  <span className="sf-meter-shot">
                    <Image
                      src={
                        product.variantImages?.["20ml"]?.[0] ?? product.image
                      }
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </span>
                  <span className="sf-meter-name">{product.name}</span>
                  <span className="sf-meter-bar" aria-hidden="true">
                    <i style={{ width: `${pct}%` }} />
                  </span>
                  <span className="sf-meter-pct">{step ? `${pct}%` : "–"}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="sf-card">
          {!result ? (
            <div key={step} className="sf-step">
              <div className="sf-progress" aria-hidden="true">
                {questions.map((_, index) => (
                  <span key={index} data-on={index <= step || undefined} />
                ))}
              </div>
              <p className="sf-count">
                Question {step + 1} of {questions.length}
              </p>
              <h3 className="sf-question">{questions[step].title}</h3>
              <div className="sf-options">
                {questions[step].options.map((option, index) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() =>
                      setAnswers((current) => [...current, option.family])
                    }
                    className="sf-option"
                    style={{ animationDelay: `${0.08 + index * 0.05}s` }}
                  >
                    <span className="sf-option-key">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option.label}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button
                  type="button"
                  className="sf-back"
                  onClick={() => setAnswers((current) => current.slice(0, -1))}
                >
                  <ArrowLeft size={14} aria-hidden="true" /> Back
                </button>
              )}
            </div>
          ) : (
            <div className="sf-result">
              <div className="sf-result-shot">
                <Image
                  src={result.image}
                  alt={`${result.name} — ${result.profile} ${result.concentration} by Amidaddy Perfumes`}
                  fill
                  sizes="(max-width: 900px) 90vw, 300px"
                  className="object-cover"
                />
              </div>
              <div className="sf-result-copy">
                <p className="sf-count">Your match</p>
                <h3 className="sf-result-name">{result.name}</h3>
                <p className="sf-result-desc">{result.description}</p>
                <Link
                  href={`/products/${result.slug}`}
                  onClick={() =>
                    analytics.scentRecommendationClick(result.slug)
                  }
                  className="sf-cta"
                >
                  Meet your scent <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => setAnswers([])}
                  className="sf-back"
                >
                  <RotateCcw size={13} aria-hidden="true" /> Start again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
