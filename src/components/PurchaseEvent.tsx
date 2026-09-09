"use client";

import { useEffect } from "react";
import { analytics, type AnalyticsItem } from "@/lib/analytics";

/**
 * Fires GA4 `purchase` from the confirmation page, and only when the order is
 * server-confirmed as PAID. GA4 dedupes on transaction_id, so a page refresh or
 * a payment retry that lands here again reports one purchase, not two. A
 * sessionStorage guard also stops a same-session refresh from re-sending.
 */
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
  }, [order]);
  return null;
}
