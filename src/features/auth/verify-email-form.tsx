"use client";

import Link from "next/link";
import Photo from "@/components/Photo";
import { useActionState } from "react";
import {
  resendSignupOtpAction,
  verifySignupOtpAction,
  type AuthActionState,
} from "./actions";

const initialState: AuthActionState = {};

export function VerifyEmailForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    verifySignupOtpAction,
    initialState,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendSignupOtpAction,
    initialState,
  );
  return (
    <main data-surface="commerce" className="auth-shell">
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
      <div className="auth-panel border-line bg-raised border p-7 sm:p-9">
        <form action={formAction}>
          <input type="hidden" name="email" value={email} />
          <p className="text-accent mb-3 text-xs tracking-[0.2em] uppercase">
            Amidaddy account
          </p>
          <h1 className="font-cinzel text-fg mb-3 text-2xl">
            Verify your email
          </h1>
          <p className="text-muted mb-6 text-sm">
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below
            to finish creating your account.
          </p>
          <input
            name="token"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            placeholder="000000"
            className="checkout-input mb-3 w-full text-center tracking-[0.5em]"
          />
          {state.error && (
            <p className="mb-4 text-sm text-red-300" role="alert">
              {state.error}
            </p>
          )}
          <button
            disabled={pending}
            className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Verifying" : "Verify and continue"}
          </button>
        </form>
        <form action={resendAction} className="mt-5">
          <input type="hidden" name="email" value={email} />
          {resendState.message && (
            <p className="text-accent mb-2 text-sm" role="status">
              {resendState.message}
            </p>
          )}
          {resendState.error && (
            <p className="mb-2 text-sm text-red-300" role="alert">
              {resendState.error}
            </p>
          )}
          <button
            disabled={resendPending}
            className="text-muted hover:text-accent text-sm underline disabled:opacity-60"
          >
            {resendPending ? "Sending" : "Resend code"}
          </button>
        </form>
        <p className="text-muted mt-5 text-sm">
          Wrong address?{" "}
          <Link href="/signup" className="text-accent">
            Start over
          </Link>
        </p>
      </div>
    </main>
  );
}
