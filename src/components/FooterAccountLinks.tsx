"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
 */
export default function FooterAccountLinks() {
  const [state, setState] = useState<AuthState>("unknown");

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const resolve = (next: AuthState) => {
      if (active) setState(next);
    };

    try {
      const supabase = createClient();
      supabase.auth
        .getUser()
        .then(({ data }) => resolve(data.user ? "signed-in" : "signed-out"))
        .catch(() => resolve("signed-out"));
      const { data } = supabase.auth.onAuthStateChange((_event, session) =>
        resolve(session?.user ? "signed-in" : "signed-out"),
      );
      unsubscribe = () => data.subscription.unsubscribe();
    } catch {
      // Supabase env vars missing - settle on the signed-out links, but do it
      // asynchronously so this is not a synchronous setState inside the effect.
      queueMicrotask(() => resolve("signed-out"));
    }

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
