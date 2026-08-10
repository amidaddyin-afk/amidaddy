import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", data.user.id)
    .maybeSingle();

  return { user: data.user, profile };
});

const DEFAULT_ADMIN_SESSION_HOURS = 12;

export function isAdminSessionExpired(lastSignInAt?: string) {
  if (!lastSignInAt) return true;
  const configuredHours = Number(process.env.ADMIN_SESSION_MAX_AGE_HOURS);
  const maxAgeHours =
    Number.isFinite(configuredHours) && configuredHours > 0
      ? configuredHours
      : DEFAULT_ADMIN_SESSION_HOURS;
  return Date.now() - Date.parse(lastSignInAt) > maxAgeHours * 60 * 60 * 1000;
}

export async function requireUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  return currentUser;
}

export async function isAdmin() {
  const current = await getCurrentUser();
  return Boolean(
    current?.profile?.role === "ADMIN" &&
    !isAdminSessionExpired(current.user.last_sign_in_at),
  );
}

export async function requireAdminUser() {
  const current = await getCurrentUser();
  if (
    current?.profile?.role !== "ADMIN" ||
    isAdminSessionExpired(current.user.last_sign_in_at)
  )
    throw new Error("Your admin session has expired. Sign in again.");
  return current;
}

export async function requireAdminPage() {
  if (!(await isAdmin())) redirect("/login?next=/admin");
}
