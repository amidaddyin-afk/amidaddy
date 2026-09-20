"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { beacon } from "@/lib/analytics";
import { readConsent } from "@/lib/consent";

/**
 * Beacons one `page_view` to /api/track on every App Router navigation, feeding
 * the first-party geo map in /admin. Gated on DPDP analytics consent: without
 * it we record nothing about the visitor.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    // Skip admin/account — internal traffic, not customer telemetry.
    if (pathname.startsWith("/admin") || pathname.startsWith("/account"))
      return;
    if (readConsent()?.analytics !== true) return;
    beacon("page_view");
  }, [pathname]);
  return null;
}
