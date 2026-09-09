import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Clear the cached storefront renders after a catalogue change.
 *
 * The storefront pages (`/`, `/shop`, `/products/[slug]`) are cached with a
 * `revalidate` window so a burst of visitors does not become a burst of
 * identical Supabase queries. That window would otherwise mean an admin edit
 * takes minutes to appear publicly — calling this from every mutation path
 * makes edits show immediately instead.
 *
 * Every admin write that can change what a shopper sees must call this:
 * product create/update/delete/restore, stock adjustments, and store settings
 * (which carry the shipping fee and free-delivery threshold shown on the
 * homepage and in the FAQ).
 *
 * `/products/[slug]` is revalidated by layout rather than per-slug: a rename or
 * a slug change would otherwise leave the old page cached, and there are only a
 * handful of products, so refreshing all of them is cheaper than tracking which
 * one moved.
 */
export function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/products/[slug]", "page");
}
