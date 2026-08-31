"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowDownRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function LandingGate() {
  const [phase, setPhase] = useState<"idle" | "leaving">("idle");
  const exiting = phase === "leaving";
  const reduceMotion = useReducedMotion();
  const router = useRouter();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const enter = () => {
    if (exiting) return;
    setPhase("leaving");
    window.setTimeout(
      () => {
        document.body.style.overflow = "";
        router.push("/shop");
      },
      reduceMotion ? 120 : 520,
    );
  };

  return (
    <motion.section
      className="landing-gate"
      aria-label="Enter the Amidaddy fragrance store"
      initial={false}
      animate={{ y: exiting ? "-100%" : 0 }}
      transition={{
        duration: reduceMotion ? 0.12 : 0.52,
        ease: [0.76, 0, 0.24, 1],
      }}
    >
      <motion.div
        className="landing-gate-brand"
        animate={{ opacity: exiting ? 0 : 1, y: exiting ? -18 : 0 }}
        transition={{ duration: 0.25 }}
      >
        <Image
          src="/brand/amidaddy-ad-signature-mark.png"
          alt="Ami Daddy AD mark"
          width={512}
          height={512}
          priority
        />
        <p className="landing-name" aria-label="Amidaddy">
          am<span>i</span>daddy
        </p>
        <small>Fine fragrances · Tap either portrait to enter</small>
      </motion.div>
      <button
        type="button"
        className="landing-panel"
        onClick={enter}
        aria-label="Enter Amidaddy store"
      >
        <span
          className="landing-photo landing-photo-old-love"
          role="img"
          aria-label="Old Love by Amidaddy"
        />
        <span className="landing-panel-shade" />
        <span className="landing-panel-label">
          Old Love <ArrowDownRight size={18} />
        </span>
      </button>
      <button
        type="button"
        className="landing-panel"
        onClick={enter}
        aria-label="Enter Amidaddy store"
      >
        <span
          className="landing-photo landing-photo-heavenly"
          role="img"
          aria-label="Heavenly by Amidaddy"
        />
        <span className="landing-panel-shade" />
        <span className="landing-panel-label">
          Heavenly <ArrowDownRight size={18} />
        </span>
      </button>
    </motion.section>
  );
}
