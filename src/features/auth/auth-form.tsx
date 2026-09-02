"use client";

import Link from "next/link";
import Photo from "@/components/Photo";
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
    <main data-surface="commerce" className="auth-shell">
      {/* Editorial split. These pages were a bare form on an empty field;
          the campaign frame gives the account flow the same footing as the
          rest of the house. Hidden below lg so the form stays the whole
          screen on a phone. */}
      <aside className="auth-aside" aria-hidden="true">
        <Photo
          src="/curated/product-detail-2.webp"
          alt=""
          fill
          sizes="(max-width: 1024px) 0px, 45vw"
          className="object-cover"
        />
        <div className="auth-aside-scrim" />
        <p className="auth-aside-copy">Presence, before words.</p>
      </aside>
      <form
        action={formAction}
        className="auth-panel border-line bg-raised border p-7 sm:p-9"
      >
        {isLogin && <input type="hidden" name="next" value={safeNext} />}
        <p className="text-accent mb-3 text-xs tracking-[0.2em] uppercase">
          Amidaddy account
        </p>
        <h1 className="font-cinzel text-fg mb-6 text-2xl">
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
          <p className="text-accent mb-4 text-sm" role="status">
            Your admin session expired. Sign in again to continue.
          </p>
        )}
        {state.error && (
          <p className="mb-4 text-sm text-red-300" role="alert">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="text-accent mb-4 text-sm" role="status">
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
          <div className="text-muted mt-5 flex justify-between text-sm">
            <Link href="/signup" className="hover:text-accent">
              Create account
            </Link>
            <Link href="/forgot-password" className="hover:text-accent">
              Forgot password?
            </Link>
          </div>
        )}
        {isSignup && (
          <p className="text-muted mt-5 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-accent">
              Sign in
            </Link>
          </p>
        )}
      </form>
    </main>
  );
}
