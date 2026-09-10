import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { takeRequestLimit } from "@/lib/request-rate-limit";
import {
  isAnalyticsEventType,
  recordAnalyticsEvent,
} from "@/lib/analytics-server";

export const dynamic = "force-dynamic";

/**
 * First-party telemetry sink. The client beacons page views and funnel steps
 * here; geo is read from the CDN edge headers, never from a stored IP.
 *
 * Purchase events are NOT accepted here — a client could forge them. The
 * confirmation page records the purchase server-side (see
 * src/app/checkout/success/page.tsx) from the verified-PAID order.
 */

const schema = z.object({
  type: z.string().max(32),
  sessionId: z.string().trim().min(1).max(64),
  path: z.string().max(512).optional(),
  productRef: z.string().max(128).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  // Telemetry must never surface an error to the client or fill the logs with
  // 5xx — every path here returns 204, success or not.
  try {
    // Generous: this fires on most page views. Enough to stop a single client
    // flooding the table, not so tight that a fast browse trips it.
    if (!(await takeRequestLimit("track", 120, 60)))
      return new NextResponse(null, { status: 204 });

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return new NextResponse(null, { status: 204 });

    const { type } = parsed.data;
    if (!isAnalyticsEventType(type) || type === "purchase")
      return new NextResponse(null, { status: 204 });

    const h = request.headers;
    await recordAnalyticsEvent({
      type,
      sessionId: parsed.data.sessionId,
      path: parsed.data.path ?? null,
      // Vercel sets x-vercel-ip-*; Cloudflare sets cf-* — support both.
      region:
        h.get("x-vercel-ip-country-region") ?? h.get("cf-region-code") ?? null,
      country: h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? null,
      productRef: parsed.data.productRef ?? null,
      metadata: parsed.data.metadata ?? {},
    });
  } catch (error) {
    console.error("[track] failed:", error);
  }
  return new NextResponse(null, { status: 204 });
}
