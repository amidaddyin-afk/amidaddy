"use client";

import { useEffect, useState } from "react";

/**
 * True when the primary pointer cannot hover - phones and tablets.
 *
 * Entrance animations that translate are the reason this exists: on touch they
 * run while a drag is still in progress, so the element slides under the finger
 * and the page reads as scrolling and springing back. Callers drop the travel
 * and keep the fade.
 *
 * Starts false so the server render and the first client render agree; the
 * effect corrects it before paint matters.
 */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return coarse;
}
