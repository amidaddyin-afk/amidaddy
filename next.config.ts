import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
// Google Analytics 4: gtag.js is served from googletagmanager.com; the
// collected events POST to *.google-analytics.com / *.analytics.google.com.
// Only referenced when NEXT_PUBLIC_GA_MEASUREMENT_ID is set (see
// src/components/Analytics.tsx), but the CSP must allow it either way.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://checkout.razorpay.com https://challenges.cloudflare.com https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  // Product hero loops are served from /public. Stated explicitly rather than
  // inherited from default-src, so a future default-src change cannot silently
  // stop video from playing.
  "media-src 'self'",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Local browser tooling (Playwright) hits the dev server on 127.0.0.1, which
  // Next treats as a cross-origin dev request and blocks by default - that
  // block also wedges the HMR client, which then stops flushing client effects
  // (framer-motion mount animations never run). Dev-only allowlist.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
  images: {
    // Photos uploaded through the admin portal live in Supabase Storage, not
    // in /public, so next/image needs their host on the allowlist - without it
    // every admin-managed photo renders as a broken image while the shipped
    // /ref/ photography keeps working, which makes the cause easy to miss.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // AVIF first: roughly 20-30% smaller than WebP on this photography, with
    // WebP as the fallback for older Safari.
    formats: ["image/avif", "image/webp"],
    // Trimmed to the widths this storefront actually renders at. Every extra
    // entry is another on-demand encode of the same source image.
    deviceSizes: [400, 640, 828, 1080, 1280, 1920, 2400],
    imageSizes: [64, 96, 128, 256, 384],
    // 75 is next/image's own default and must stay allowed, otherwise any
    // component that omits `quality` (or sets it explicitly) gets a 400.
    qualities: [70, 75, 82, 90],
    // 30 days, not a year. The optimizer keys its cache on path + width +
    // quality, so replacing a photo at the same filename serves the old bytes
    // until this expires. A year would make a swapped product shot effectively
    // unfixable without renaming the file.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // The hero films are immutable content at a stable filename: Next
        // serves everything in public/ with `max-age=0`, so every repeat visit
        // paid a revalidation round-trip before playback could start - the
        // "it loads slowly again even though I already watched it" stutter.
        // A year of immutable caching means a returning visitor plays from
        // disk with no network at all. Re-encoding a clip needs a new
        // filename (the encode script writes <slug>.webm/.mp4, so bump the
        // slug) or this header will keep serving the old bytes.
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Scent School scroll films and their posters. Same reasoning as
        // /videos: stable generated filenames written by
        // scripts/encode-scent-school.mjs. Byte-range requests matter more
        // here than anywhere else on the site - the scrubber seeks constantly,
        // and Next's static file handler serves 206 Partial Content for these
        // (verified with a Range request), which is what makes seeking cheap.
        // Re-encoding needs a new filename or this header keeps serving the
        // old bytes.
        source: "/scent-school/film/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Same reasoning as /videos, for the badge PNGs and brand marks that
        // are served straight from public/ rather than through next/image.
        // These are generated artwork with stable names that change only when
        // the source art does - regenerate under a new name if you replace one.
        // Photography under /ref, /gallery and friends is deliberately NOT
        // here: it is requested through next/image, which applies its own
        // 30-day cache keyed on path+width+quality and can be revalidated by
        // replacing the file.
        source: "/certifications/web/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/account/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
      {
        source: "/api/admin/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
      {
        source: "/api/checkout/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
};

export default nextConfig;
