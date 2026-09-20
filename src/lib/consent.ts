/**
 * DPDP Act 2023 consent state. Essential cookies (cart, auth, security) need
 * no consent; analytics does. Stored in localStorage under a versioned key so
 * a policy change can re-prompt everyone by bumping CONSENT_VERSION.
 */
export const CONSENT_VERSION = 1;
export const CONSENT_KEY = `amidaddy.consent.v${CONSENT_VERSION}`;
export const CONSENT_EVENT = "amidaddy:consent";

export type ConsentState = { analytics: boolean; decidedAt: string };

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return typeof parsed?.analytics === "boolean"
      ? { analytics: parsed.analytics, decidedAt: parsed.decidedAt ?? "" }
      : null;
  } catch {
    return null;
  }
}

/** Persists a decision and notifies listeners in this tab. */
export function writeConsent(analytics: boolean): ConsentState {
  const state: ConsentState = {
    analytics,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
    // Private mode / blocked storage: the banner simply asks again next visit.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
  return state;
}

/** Withdrawal must be as easy as giving consent (DPDP s.6(4)). */
export function clearConsent() {
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}
