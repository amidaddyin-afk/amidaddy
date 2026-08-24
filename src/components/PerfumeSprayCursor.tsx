"use client";

import { useEffect, useRef } from "react";

const MIST_DROPS = Array.from({ length: 9 });

export default function PerfumeSprayCursor() {
  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const spray = (event: PointerEvent) => {
      if (
        !event.isPrimary ||
        event.button !== 0 ||
        reducedMotion.matches ||
        !templateRef.current
      )
        return;

      const burst = templateRef.current.cloneNode(true) as HTMLDivElement;
      burst.removeAttribute("id");
      burst.classList.remove("perfume-spray-template");
      burst.style.left = `${event.clientX}px`;
      burst.style.top = `${event.clientY}px`;
      document.body.appendChild(burst);
      window.setTimeout(() => burst.remove(), 950);
    };

    window.addEventListener("pointerdown", spray, { passive: true });
    return () => window.removeEventListener("pointerdown", spray);
  }, []);

  return (
    <div
      ref={templateRef}
      id="perfume-spray-template"
      className="perfume-spray-burst perfume-spray-template"
      aria-hidden="true"
    >
      <svg
        className="perfume-spray-bottle"
        viewBox="0 0 46 62"
        focusable="false"
      >
        <path className="spray-cap" d="M18 3h18v7H18z" />
        <path className="spray-nozzle" d="M31 5h11v4H31z" />
        <path className="spray-neck" d="M20 10h14v8H20z" />
        <path
          className="spray-glass"
          d="M13 18h27l3 7v29c0 3-2 5-5 5H11c-3 0-5-2-5-5V25l7-7Z"
        />
        <path className="spray-shine" d="M14 24h5v27h-5z" />
        <path className="spray-label" d="M17 33h16v12H17z" />
      </svg>
      <span className="perfume-spray-cloud" />
      <span className="perfume-spray-cloud perfume-spray-cloud-soft" />
      <span className="perfume-spray-jet" />
      <span className="perfume-spray-mist">
        {MIST_DROPS.map((_, index) => (
          <i key={index} />
        ))}
      </span>
    </div>
  );
}
