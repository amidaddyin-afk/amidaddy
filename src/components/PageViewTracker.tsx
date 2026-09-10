"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { beacon } from "@/lib/analytics";

/**
 * Beacons one `page_view` to /api/track on every App Router navigation. GA4
 * records its own page_view separately; this feeds the first-party geo map in
 * /admin.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    // Skip admin/account — internal traffic, not customer telemetry.
    if (pathname.startsWith("/admin") || pathname.startsWith("/account"))
      return;
    beacon("page_view");
  }, [pathname]);
  return null;
}
