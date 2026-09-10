import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrder } from "@/lib/orders";
import { recordAnalyticsEvent } from "@/lib/analytics-server";
import { takeRequestLimit } from "@/lib/request-rate-limit";

export const dynamic = "force-dynamic";

/**
 * Records a first-party `purchase` event, linked to the browser session that
 * added to cart. Called only from the confirmation page.
 *
 * Not forgeable: the order must actually be PAID (re-checked here, server-side)
 * before anything is written, and a partial unique index on order_id means a
 * refresh or a retry inserts nothing. The client supplies only the session id —
 * the value/items come from the verified order.
 */

const schema = z.object({
  orderId: z.string().trim().min(1).max(64),
  sessionId: z.string().trim().min(1).max(64),
});

export async function POST(request: NextRequest) {
  try {
    if (!(await takeRequestLimit("track-purchase", 20, 60)))
      return new NextResponse(null, { status: 204 });

    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return new NextResponse(null, { status: 204 });

    const order = await getOrder(parsed.data.orderId).catch(() => null);
    if (!order || order.paymentStatus !== "PAID")
      return new NextResponse(null, { status: 204 });

    const h = request.headers;
    await recordAnalyticsEvent({
      type: "purchase",
      sessionId: parsed.data.sessionId,
      orderId: order.id,
      valuePaise:
        order.subtotalPaise + order.shippingPaise - order.discountPaise,
      region:
        h.get("x-vercel-ip-country-region") ?? h.get("cf-region-code") ?? null,
      country: h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? null,
      metadata: { items: order.lines.length },
    });
  } catch (error) {
    console.error("[track/purchase] failed:", error);
  }
  return new NextResponse(null, { status: 204 });
}
