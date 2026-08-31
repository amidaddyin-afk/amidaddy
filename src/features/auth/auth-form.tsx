"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
  type AuthActionState,
} from "./actions";

type Mode = "login" | "signup" | "forgot-password" | "reset-password";
const initialState: AuthActionState = {};

export function AuthForm({
  mode,
  turnstileSiteKey,
}: {
  mode: Mode;
  turnstileSiteKey?: string;
}) {
  const action =
    mode === "login"
      ? signInAction
      : mode === "signup"
        ? signUpAction
        : mode === "forgot-password"
          ? requestPasswordResetAction
          : updatePasswordAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const isSignup = mode === "signup";
  const isLogin = mode === "login";
  const isResetRequest = mode === "forgot-password";
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const adminSessionExpired =
    searchParams.get("reason") === "admin-session-expired";
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return (
    <main className="auth-shell min-h-screen px-6 pt-36">
      <form
        action={formAction}
        className="auth-panel mx-auto max-w-md border border-white/10 bg-[#0e0e0e] p-7 sm:p-9"
      >
        {isLogin && <input type="hidden" name="next" value={safeNext} />}
        <p className="mb-3 text-xs tracking-[0.2em] text-[#D4AF37] uppercase">
          Amidaddy account
        </p>
        <h1 className="font-cinzel mb-6 text-2xl text-white">
          {isLogin
            ? "Sign in"
            : isSignup
              ? "Create account"
              : isResetRequest
                ? "Reset password"
                : "Choose a new password"}
        </h1>
        {isSignup && (
          <input
            name="fullName"
            required
            autoComplete="name"
            placeholder="Full name"
            className="checkout-input mb-3 w-full"
          />
        )}
        {!(!isSignup && mode === "reset-password") && (
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email address"
            className="checkout-input mb-3 w-full"
          />
        )}
        {!isResetRequest && (
          <input
            name="password"
            type="password"
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder="Password"
            className="checkout-input mb-3 w-full"
          />
        )}
        {mode !== "reset-password" && turnstileSiteKey && (
          <>
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
              strategy="afterInteractive"
            />
            <div
              className="cf-turnstile mb-4"
              data-sitekey={turnstileSiteKey}
              data-theme="light"
            />
          </>
        )}
        {isLogin && adminSessionExpired && (
          <p className="mb-4 text-sm text-[#D4AF37]" role="status">
            Your admin session expired. Sign in again to continue.
          </p>
        )}
        {state.error && (
          <p className="mb-4 text-sm text-red-300" role="alert">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="mb-4 text-sm text-[#D4AF37]" role="status">
            {state.message}
          </p>
        )}
        <button
          disabled={pending}
          className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Please wait"
            : isLogin
              ? "Sign in"
              : isSignup
                ? "Create account"
                : isResetRequest
                  ? "Send reset link"
                  : "Update password"}
        </button>
        {isLogin && (
          <div className="mt-5 flex justify-between text-sm text-white/60">
            <Link href="/signup" className="hover:text-[#D4AF37]">
              Create account
            </Link>
            <Link href="/forgot-password" className="hover:text-[#D4AF37]">
              Forgot password?
            </Link>
          </div>
        )}
        {isSignup && (
          <p className="mt-5 text-sm text-white/60">
            Already have an account?{" "}
            <Link href="/login" className="text-[#D4AF37]">
              Sign in
            </Link>
          </p>
        )}
      </form>
    </main>
  );
}
