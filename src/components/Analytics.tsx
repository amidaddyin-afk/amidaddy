"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

/**
 * GA4 loader, gated on DPDP analytics consent. Renders nothing unless
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is set AND the visitor has accepted analytics,
 * so no measurement cookie is written before consent. Withdrawing consent
 * unmounts the scripts; gtag calls then no-op until the next page load.
 */
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(readConsent()?.analytics === true);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!id || !allowed) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${id}', { currency: 'INR', anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
