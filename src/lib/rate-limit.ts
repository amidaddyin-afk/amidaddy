import "server-only";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function assertLoginAllowed(email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("login_allowed", { login_email: email });
  if (error) throw new Error("Unable to validate sign-in attempt.");
  return Boolean(data);
}

export async function recordLoginAttempt(email: string, succeeded: boolean) {
  const supabase = await createClient();
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const { error } = await supabase.rpc("record_login_attempt", {
    login_email: email,
    succeeded,
    source_ip: forwardedFor,
  });
  if (error) throw new Error("Unable to record sign-in attempt.");
}
