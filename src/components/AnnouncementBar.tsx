"use client";

import { useEffect, useState } from "react";

const messages = ["New launch: four unisex signatures", "Early bird: discovery bottles from Rs. 199", "Free shipping on orders above Rs. 999"];

export default function AnnouncementBar() {
  const [active, setActive] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setActive((value) => (value + 1) % messages.length), 3500); return () => window.clearInterval(id); }, []);
  return <div className="announcement-bar" role="status">{messages[active]}</div>;
}
