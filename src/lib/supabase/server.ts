import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { secureCookieOptions } from "@/lib/security";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error(
      "Supabase public environment variables are not configured.",
    );
  return { url, key };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, secureCookieOptions(options)),
          );
        } catch {
          // Proxy refreshes session cookies for Server Component renders.
        }
      },
    },
  });
}
