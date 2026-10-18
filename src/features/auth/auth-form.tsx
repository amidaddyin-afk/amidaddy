"use client";

import Link from "next/link";
import Photo from "@/components/Photo";
import { Eye, EyeOff } from "lucide-react";
import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { safeRedirectPath } from "@/lib/safe-redirect";
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
  const safeNext = safeRedirectPath(next);
  const [showPassword, setShowPassword] = useState(false);
  const [mismatch, setMismatch] = useState(false);

  // A Turnstile token is single-use: after a failed attempt the widget must
  // issue a fresh one or every retry fails CAPTCHA verification.
  useEffect(() => {
    if (state.error)
      (window as { turnstile?: { reset: () => void } }).turnstile?.reset();
  }, [state]);

  // Submitting through onSubmit instead of letting React run the form action
  // keeps what the customer typed: React resets a form after its action
  // completes, which wiped every field whenever the server returned an error.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const isMismatch =
      isSignup && formData.get("password") !== formData.get("confirmPassword");
    setMismatch(isMismatch);
    if (isMismatch) return;
    startTransition(() => formAction(formData));
  }
  return (
    <main data-surface="commerce" className="auth-shell">
      {/* Editorial split. These pages were a bare form on an empty field;
          the campaign frame gives the account flow the same footing as the
          rest of the house. Hidden below lg so the form stays the whole
          screen on a phone. */}
      <aside className="auth-aside" aria-hidden="true">
        <Photo
          src="/site/account/sign-in.webp"
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
        onSubmit={handleSubmit}
        className="auth-panel border-line bg-raised border p-7 sm:p-9"
      >
        {isLogin && <input type="hidden" name="next" value={safeNext} />}
        <p className="text-accent mb-3 text-xs tracking-[0.2em] uppercase">
          Amidaddy™ account
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
          <div className="relative mb-3">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={isLogin ? undefined : 12}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={
                isLogin ? "Password" : "Password (min. 12 characters)"
              }
              className="checkout-input w-full pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="text-muted hover:text-fg absolute inset-y-0 right-0 flex w-11 items-center justify-center"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        )}
        {isSignup && (
          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Confirm password"
            aria-invalid={mismatch || undefined}
            className="checkout-input mb-3 w-full"
          />
        )}
        {isSignup && (
          <label className="checkout-consent">
            {/* DPDP s.6: unticked by default. Account and order email is
                separate and does not depend on this box. */}
            <input type="checkbox" name="marketingOptIn" value="yes" />
            <span>
              Email me new releases and offers from Amidaddy&trade;. Optional —
              you can withdraw any time from the footer of any email. See our{" "}
              <Link href="/policies/privacy-policy">privacy policy</Link>.
            </span>
          </label>
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
        {(mismatch || state.error) && (
          <p className="mb-4 text-sm text-red-700" role="alert">
            {mismatch ? "Passwords do not match." : state.error}
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
