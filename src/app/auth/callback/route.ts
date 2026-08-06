import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNext(requestUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!code || !url || !key) return NextResponse.redirect(new URL("/login?error=callback", requestUrl.origin));

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.headers.get("cookie")?.split("; ").map((value) => {
        const [name, ...rest] = value.split("=");
        return { name, value: rest.join("=") };
      }) ?? [],
      setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=callback", requestUrl.origin));
  return response;
}
