"use client";

import { useEffect } from "react";
import { analytics, toItem } from "@/lib/analytics";
import type { Product } from "@/lib/data";

/**
 * Fires GA4 `view_item_list` once for a rendered product grid. Rendered by
 * server components (homepage, /shop) which cannot call analytics directly.
 */
export default function ViewItemList({
  listId,
  products,
  size,
}: {
  listId: string;
  products: Product[];
  size?: "20ml" | "100ml";
}) {
  useEffect(() => {
    if (!products.length) return;
    analytics.viewItemList(
      listId,
      products.map((product) => toItem(product, size)),
    );
    // listId identifies the grid; product set is stable within a render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);
  return null;
}
