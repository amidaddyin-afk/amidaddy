"use client";

import { useEffect } from "react";
import { analytics, type AnalyticsItem } from "@/lib/analytics";

/**
 * Fires `purchase` from the confirmation page when the order is server-
 * confirmed PAID:
 *  - GA4 `purchase` (deduped on transaction_id).
 *  - first-party POST to /api/track/purchase, carrying the browser session id
 *    so the store's own funnel can link this back to the add_to_cart session.
 *    That route re-checks PAID server-side and a unique index dedupes.
 * A sessionStorage guard also stops a same-session refresh from re-sending.
 */

function currentSessionId() {
  try {
    return sessionStorage.getItem("amidaddy-sid") ?? "nostorage";
  } catch {
    return "nostorage";
  }
}
export default function PurchaseEvent({
  order,
}: {
  order: {
    id: string;
    subtotalPaise: number;
    shippingPaise: number;
    taxPaise: number;
    discountPaise: number;
    couponCode?: string | null;
    items: AnalyticsItem[];
  };
}) {
  useEffect(() => {
    const key = `amidaddy-purchase-${order.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // private mode / storage disabled — GA4's transaction_id dedupe still covers us
    }
    analytics.purchase(order);

    const payload = JSON.stringify({
      orderId: order.id,
      sessionId: currentSessionId(),
    });
    try {
      if (
        navigator.sendBeacon?.(
          "/api/track/purchase",
          new Blob([payload], { type: "application/json" }),
        )
      )
        return;
    } catch {
      // fall through
    }
    fetch("/api/track/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [order]);
  return null;
}
