import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { requestUsesHttps, secureCookieOptions } from "@/lib/security";

function adminSessionExpired(lastSignInAt?: string) {
  if (!lastSignInAt) return true;
  const configuredHours = Number(process.env.ADMIN_SESSION_MAX_AGE_HOURS);
  const maxAgeHours =
    Number.isFinite(configuredHours) && configuredHours > 0
      ? configuredHours
      : 12;
  const signedInAt = Date.parse(lastSignInAt);
  return (
    !Number.isFinite(signedInAt) ||
    Date.now() - signedInAt > maxAgeHours * 60 * 60 * 1000
  );
}

export async function proxy(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && !requestUsesHttps(request)) {
    const secureUrl = request.nextUrl.clone();
    secureUrl.protocol = "https:";
    return NextResponse.redirect(secureUrl, 308);
  }
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, secureCookieOptions(options)),
        );
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminPath =
    request.nextUrl.pathname === "/admin" ||
    request.nextUrl.pathname.startsWith("/admin/");

  if (user && adminPath && adminSessionExpired(user.last_sign_in_at)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === "ADMIN") {
      await supabase.auth.signOut({ scope: "local" });
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      loginUrl.searchParams.set("reason", "admin-session-expired");
      const redirect = NextResponse.redirect(loginUrl);
      response.cookies
        .getAll()
        .forEach((cookie) => redirect.cookies.set(cookie));
      return redirect;
    }
  }
  const protectedPath =
    request.nextUrl.pathname.startsWith("/account") || adminPath;
  if (!user && protectedPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
