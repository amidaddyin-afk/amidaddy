"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const messages = [
  "Best offers applied at checkout",
  "Four unisex signatures · Made for a feeling",
  "Complimentary shipping on orders of ₹599 or more",
];

export default function AnnouncementBar() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(
      () => setActive((value) => (value + 1) % messages.length),
      3500,
    );
    return () => window.clearInterval(id);
  }, [reduceMotion]);
  return (
    <div className="announcement-bar" role="status">
      {messages[active]}
    </div>
  );
}
