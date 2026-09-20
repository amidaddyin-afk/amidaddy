"use client";

import { useActionState } from "react";
import {
  correctPersonalDataAction,
  erasePersonalDataAction,
  updateMarketingConsentAction,
  type PrivacyActionState,
} from "./actions";

const empty: PrivacyActionState = {};

function Status({ state }: { state: PrivacyActionState }) {
  if (state.error) return <p className="error-banner">{state.error}</p>;
  if (state.message) return <p className="privacy-note">{state.message}</p>;
  return null;
}

export function MarketingConsentForm({ optedIn }: { optedIn: boolean }) {
  const [state, action, pending] = useActionState(
    updateMarketingConsentAction,
    empty,
  );
  return (
    <form action={action}>
      <label className="checkout-consent">
        <input
          type="checkbox"
          name="marketingOptIn"
          value="yes"
          defaultChecked={optedIn}
        />
        <span>
          Email me new releases and offers. Order and account email is separate
          and continues either way.
        </span>
      </label>
      <button className="btn-ghost mt-4" disabled={pending}>
        {pending ? "Saving…" : "Save preference"}
      </button>
      <Status state={state} />
    </form>
  );
}

export function CorrectionForm({ fullName }: { fullName: string }) {
  const [state, action, pending] = useActionState(
    correctPersonalDataAction,
    empty,
  );
  return (
    <form action={action}>
      <input
        name="fullName"
        defaultValue={fullName}
        required
        minLength={2}
        maxLength={80}
        aria-label="Full name"
        className="checkout-input w-full"
      />
      <button className="btn-ghost mt-4" disabled={pending}>
        {pending ? "Saving…" : "Correct my name"}
      </button>
      <Status state={state} />
    </form>
  );
}

export function ErasureForm() {
  const [state, action, pending] = useActionState(
    erasePersonalDataAction,
    empty,
  );
  return (
    <form action={action}>
      <input
        name="confirm"
        required
        placeholder="Type ERASE to confirm"
        aria-label="Type ERASE to confirm"
        className="checkout-input w-full"
      />
      <button className="btn-ghost mt-4" disabled={pending}>
        {pending ? "Erasing…" : "Erase my data"}
      </button>
      <Status state={state} />
    </form>
  );
}
