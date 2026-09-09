"use client";

/**
 * GA4 funnel tracking.
 *
 * Loaded only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set (see Analytics.tsx).
 * Everything routes through `track()`, which is a no-op until gtag exists, so
 * calling it from components is always safe.
 *
 * Rules enforced here, not left to callers:
 *  - INR currency on every ecommerce event.
 *  - No PII: callers pass product/variant data only. `track()` shallow-strips
 *    any obvious contact keys as a backstop.
 *  - `purchase` must carry a transaction_id; GA4 dedupes on it, so a payment
 *    retry landing on the same success page reports one purchase, not two.
 */

type Params = Record<string, unknown>;

const PII_KEYS = new Set([
  "email",
  "phone",
  "contact",
  "name",
  "customer_name",
  "address",
  "street",
  "postal_code",
  "postalcode",
  "pincode",
]);

function stripPii(params: Params): Params {
  const clean: Params = {};
  for (const [key, value] of Object.entries(params)) {
    if (PII_KEYS.has(key.toLowerCase())) continue;
    clean[key] = value;
  }
  return clean;
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
    .gtag;
  if (gtag) gtag("event", event, stripPii(params));
}

// ---- first-party sink (/api/track) ----------------------------------------

/**
 * Opaque per-tab session id. Used only to count unique sessions and to link
 * add_to_cart -> purchase within one visit. Not a user id, not persisted past
 * the tab, never sent to GA4.
 */
function sessionId(): string {
  try {
    const KEY = "amidaddy-sid";
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "nostorage";
  }
}

/** Mirror a funnel step to the store's own telemetry table. Always on (no key
 *  to configure); the server drops anything malformed. `purchase` is recorded
 *  server-side from the confirmed order, never beaconed. */
export function beacon(
  type: "page_view" | "view_item" | "add_to_cart" | "begin_checkout",
  extra: { productRef?: string; metadata?: Params } = {},
) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    type,
    sessionId: sessionId(),
    path: location.pathname,
    productRef: extra.productRef,
    metadata: extra.metadata,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }
  } catch {
    // fall through to fetch
  }
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

// ---- ecommerce item shape ----------------------------------------------------

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_variant?: string;
  item_category?: string;
  price?: number; // rupees, not paise
  quantity?: number;
}

const rupees = (paise: number) => Math.round(paise) / 100;

/** Build a GA4 item from a catalog product + chosen size. */
export function toItem(
  product: {
    slug: string;
    name: string;
    collection?: string;
    variants: Array<{ name: string; pricePaise: number }>;
  },
  size?: string,
  quantity = 1,
): AnalyticsItem {
  const variant =
    product.variants.find((v) => v.name === size) ?? product.variants[0];
  return {
    item_id: product.slug,
    item_name: product.name,
    item_variant: variant?.name,
    item_category: product.collection,
    price: variant ? rupees(variant.pricePaise) : undefined,
    quantity,
  };
}

export const analytics = {
  viewItemList(listId: string, items: AnalyticsItem[]) {
    track("view_item_list", { item_list_id: listId, items });
  },
  selectItem(listId: string, item: AnalyticsItem) {
    track("select_item", { item_list_id: listId, items: [item] });
  },
  viewItem(item: AnalyticsItem) {
    track("view_item", {
      currency: "INR",
      value: (item.price ?? 0) * (item.quantity ?? 1),
      items: [item],
    });
    beacon("view_item", { productRef: item.item_id });
  },
  addToCart(item: AnalyticsItem) {
    track("add_to_cart", {
      currency: "INR",
      value: (item.price ?? 0) * (item.quantity ?? 1),
      items: [item],
    });
    beacon("add_to_cart", { productRef: item.item_id });
  },
  removeFromCart(item: AnalyticsItem) {
    track("remove_from_cart", {
      currency: "INR",
      value: (item.price ?? 0) * (item.quantity ?? 1),
      items: [item],
    });
  },
  viewCart(valuePaise: number, items: AnalyticsItem[]) {
    track("view_cart", { currency: "INR", value: rupees(valuePaise), items });
  },
  beginCheckout(valuePaise: number, items: AnalyticsItem[], coupon?: string) {
    track("begin_checkout", {
      currency: "INR",
      value: rupees(valuePaise),
      coupon,
      items,
    });
    beacon("begin_checkout");
  },
  addShippingInfo(valuePaise: number, items: AnalyticsItem[]) {
    track("add_shipping_info", {
      currency: "INR",
      value: rupees(valuePaise),
      shipping_tier: "Standard",
      items,
    });
  },
  addPaymentInfo(valuePaise: number, items: AnalyticsItem[]) {
    track("add_payment_info", {
      currency: "INR",
      value: rupees(valuePaise),
      payment_type: "Razorpay",
      items,
    });
  },
  purchase(order: {
    id: string;
    subtotalPaise: number;
    shippingPaise: number;
    taxPaise: number;
    discountPaise: number;
    couponCode?: string | null;
    items: AnalyticsItem[];
  }) {
    track("purchase", {
      transaction_id: order.id,
      currency: "INR",
      value: rupees(
        order.subtotalPaise + order.shippingPaise - order.discountPaise,
      ),
      tax: rupees(order.taxPaise),
      shipping: rupees(order.shippingPaise),
      coupon: order.couponCode ?? undefined,
      items: order.items,
    });
  },
  // ---- custom events ----
  discoveryCtaClick(location: string) {
    track("discovery_cta_click", { location });
  },
  scentFinderStart() {
    track("scent_finder_start", {});
  },
  scentFinderComplete(recommendation: string) {
    track("scent_finder_complete", { recommendation });
  },
  scentRecommendationClick(recommendation: string) {
    track("scent_recommendation_click", { recommendation });
  },
  supportClick(location: string) {
    track("support_click", { location });
  },
};
