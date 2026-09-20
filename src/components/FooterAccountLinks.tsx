"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AuthState = "unknown" | "signed-out" | "signed-in";

/**
 * Account links for the footer.
 *
 * Deliberately client-side. The footer renders from the root layout, so reading
 * the session on the server would call cookies() on every route and turn the
 * statically prerendered pages (/login, /policies/*, /scent-school, ...) into
 * per-request renders. Resolving it in the browser keeps those pages static.
 *
 * Until the session resolves - and for visitors without JavaScript - the
 * signed-out links are shown, which is the correct default for most traffic.
 *
 * The Supabase client is imported inside the effect rather than at module
 * scope. The footer is in the root layout, so a static import pulled the whole
 * auth client (~200KB, measured 82% unused on the homepage) into the first-load
 * bundle of every route to decide between two pairs of links. Deferring it
 * moves that cost off the critical path; the resolved markup is unchanged.
 */
export default function FooterAccountLinks() {
  const [state, setState] = useState<AuthState>("unknown");

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const resolve = (next: AuthState) => {
      if (active) setState(next);
    };

    import("@/lib/supabase/client")
      .then(({ createClient }) => {
        // The import resolves a tick later, so the component may already be
        // unmounted; bail before opening a subscription nothing will clean up.
        if (!active) return;
        const supabase = createClient();
        supabase.auth
          .getUser()
          .then(({ data }) => resolve(data.user ? "signed-in" : "signed-out"))
          .catch(() => resolve("signed-out"));
        const { data } = supabase.auth.onAuthStateChange((_event, session) =>
          resolve(session?.user ? "signed-in" : "signed-out"),
        );
        unsubscribe = () => data.subscription.unsubscribe();
      })
      .catch(() => {
        // Supabase env vars missing or the chunk failed to load - settle on the
        // signed-out links, which is the correct default.
        resolve("signed-out");
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  if (state === "signed-in") {
    return (
      <>
        <Link href="/account">My account</Link>
        <Link href="/account/orders">Order history</Link>
      </>
    );
  }

  return (
    <>
      <Link href="/login">Sign in</Link>
      <Link href="/signup">Create account</Link>
    </>
  );
}
