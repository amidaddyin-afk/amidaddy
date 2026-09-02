"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertLoginAllowed, recordLoginAttempt } from "@/lib/rate-limit";
import { recordLeadSignup, recordLeadSignupStarted } from "@/lib/leads";
import {
  resendOtpSchema,
  resetSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
  verifyOtpSchema,
} from "./schemas";

export type AuthActionState = { error?: string; message?: string };

function appUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  return url;
}

async function verifyCaptcha(token?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!token) return false;
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      cache: "no-store",
    },
  );
  return (
    response.ok &&
    Boolean(((await response.json()) as { success?: boolean }).success)
  );
}

export async function signUpAction(
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid registration details.",
    };
  if (!(await verifyCaptcha(parsed.data["cf-turnstile-response"])))
    return { error: "CAPTCHA verification failed." };

  const supabase = await createClient();
  // No emailRedirectTo: signup is confirmed with a 6-digit code (see
  // verifySignupOtpAction below), not a magic link. The Supabase "Confirm
  // signup" email template must use {{ .Token }} for this to show a code.
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });
  if (error)
    return { error: "Unable to create the account. Please try again." };
  await recordLeadSignupStarted(parsed.data.email, parsed.data.fullName).catch(
    () => {},
  );
  redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function verifySignupOtpAction(
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = verifyOtpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Enter the 6-digit code.",
    };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "email",
  });
  if (error || !data.user)
    return { error: "That code is incorrect or has expired." };
  await recordLeadSignup(
    parsed.data.email,
    (data.user.user_metadata?.full_name as string | undefined) ?? null,
    data.user.id,
  ).catch(() => {});
  redirect("/account");
}

export async function resendSignupOtpAction(
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resendOtpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email address." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
  });
  if (error) return { error: "Unable to resend the code right now." };
  return { message: "A new code is on its way." };
}

export async function signInAction(
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: "Enter a valid email address and password." };
  if (!(await verifyCaptcha(parsed.data["cf-turnstile-response"])))
    return { error: "CAPTCHA verification failed." };
  if (!(await assertLoginAllowed(parsed.data.email)))
    return { error: "This account is temporarily locked. Try again later." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  await recordLoginAttempt(parsed.data.email, !error);
  if (error) return { error: "Invalid email or password." };
  const requestedNext = formData.get("next");
  redirect(
    typeof requestedNext === "string" &&
      requestedNext.startsWith("/") &&
      !requestedNext.startsWith("//")
      ? requestedNext
      : "/account",
  );
}

export async function requestPasswordResetAction(
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (
    !parsed.success ||
    !(await verifyCaptcha(parsed.data["cf-turnstile-response"]))
  )
    return { message: "If the account exists, a reset link has been sent." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl()}/auth/callback?next=/reset-password`,
  });
  return { message: "If the account exists, a reset link has been sent." };
}

export async function updatePasswordAction(
  _: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid password." };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Your reset session has expired." };
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: "Unable to update your password." };
  redirect("/account");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
