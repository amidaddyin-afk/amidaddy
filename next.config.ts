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
