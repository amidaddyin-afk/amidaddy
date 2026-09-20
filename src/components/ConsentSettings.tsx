"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_EVENT,
  clearConsent,
  readConsent,
  writeConsent,
} from "@/lib/consent";

/**
 * Cookie-consent control for the privacy centre and footer. Withdrawal is a
 * single click, the same cost as giving consent (DPDP s.6(4)).
 */
export default function ConsentSettings() {
  const [analytics, setAnalytics] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setAnalytics(readConsent()?.analytics ?? null);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  return (
    <div>
      <label className="checkout-consent">
        <input
          type="checkbox"
          checked={analytics === true}
          onChange={(event) => writeConsent(event.target.checked)}
        />
        <span>
          Allow optional analytics cookies. Essential cookies for your cart,
          sign-in and security stay on and are not covered by this choice.
        </span>
      </label>
      <p className="privacy-note">
        {analytics === null
          ? "You have not made a choice yet — analytics is off until you do."
          : analytics
            ? "Analytics is on. Untick the box to withdraw consent immediately."
            : "Analytics is off."}
      </p>
      <button type="button" className="btn-ghost mt-3" onClick={clearConsent}>
        Reset and ask me again
      </button>
    </div>
  );
}
