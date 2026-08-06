"use client";

import { useEffect, useState } from "react";

type Spray = { id: number; x: number; y: number };

export default function SprayEffect() {
  const [sprays, setSprays] = useState<Spray[]>([]);

  useEffect(() => {
    let nextId = 0;
    const onPointerDown = (event: PointerEvent) => {
      const spray = { id: nextId++, x: event.clientX, y: event.clientY };
      setSprays((current) => [...current.slice(-3), spray]);
      window.setTimeout(() => setSprays((current) => current.filter((item) => item.id !== spray.id)), 850);
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div className="spray-layer" aria-hidden="true">
      {sprays.map((spray) => (
        <span key={spray.id} className="spray-mist" style={{ left: spray.x, top: spray.y }}>
          {Array.from({ length: 7 }, (_, index) => <i key={index} style={{ "--spray-index": index } as React.CSSProperties} />)}
        </span>
      ))}
    </div>
  );
}
