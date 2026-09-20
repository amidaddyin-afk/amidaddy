"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, readConsent, writeConsent } from "@/lib/consent";

/**
 * DPDP Act notice-and-consent banner. Shown until the visitor makes a choice;
 * neither button is pre-selected and declining is a single click, same as
 * accepting. Analytics does not load until `accept` is pressed.
 */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(readConsent() === null);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and analytics consent"
      className="consent-banner"
    >
      <div>
        <strong>We ask before we measure.</strong>
        <p>
          Cookies needed for your cart, sign-in and security are always on.
          Optional analytics cookies help us understand how the store is used —
          only with your consent. You can change this any time from the footer.{" "}
          <Link href="/policies/privacy-policy">Privacy policy</Link>
        </p>
      </div>
      <div className="consent-banner-actions">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => writeConsent(false)}
        >
          Essential only
        </button>
        <button
          type="button"
          className="btn-gold"
          onClick={() => writeConsent(true)}
        >
          Accept analytics
        </button>
      </div>
    </div>
  );
}
