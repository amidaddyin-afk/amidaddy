"use client";

import { useEffect, useState } from "react";

const messages = [
  "Four unisex signatures · Made for a feeling",
  "Discovery bottles from ₹199",
  "Complimentary shipping above ₹1,999",
];

export default function AnnouncementBar() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setActive((value) => (value + 1) % messages.length),
      3500,
    );
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="announcement-bar" role="status">
      {messages[active]}
    </div>
  );
}
