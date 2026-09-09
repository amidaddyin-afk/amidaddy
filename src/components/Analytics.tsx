import Script from "next/script";

/**
 * GA4 loader. Renders nothing unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set, so
 * local and preview environments stay out of production reporting simply by not
 * having the key. `send_page_view` stays on (GA4 default) for SPA navigations.
 *
 * No consent gate is wired yet: add one before enabling this for EU/UK traffic.
 * For India-only traffic it is acceptable to ship without it; revisit if the
 * store expands. (ponytail: no CMP, add when the store serves GDPR regions.)
 */
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;
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
          gtag('config', '${id}', { currency: 'INR' });
        `}
      </Script>
    </>
  );
}
