import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anonymous Supabase client for public catalogue reads.
 *
 * The session-aware client in ./server.ts calls `cookies()`, and reading
 * cookies opts a page out of Next's cache entirely — which meant the
 * storefront queried Supabase once per visitor no matter what `revalidate`
 * said. The catalogue is public data, so it does not need a session.
 *
 * Safe because the storefront queries already filter to
 * `active = true AND deleted_at IS NULL` explicitly, which is exactly what the
 * "catalog is publicly readable" RLS policy grants anonymous callers. This
 * client sees strictly less than the cookie-bearing one, never more — an admin
 * browsing the storefront sees the same rows a shopper does, which is correct.
 *
 * Admin reads (listAdminProducts, all writes) must keep using ./server.ts:
 * they depend on `is_admin()` in the RLS policies, which needs the session.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error(
      "Supabase public environment variables are not configured.",
    );
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
