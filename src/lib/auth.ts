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

export async function requireUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  return currentUser;
}

export async function isAdmin() {
  return (await getCurrentUser())?.profile?.role === "ADMIN";
}

export async function requireAdminPage() {
  if (!(await isAdmin())) redirect("/login?next=/admin");
}
