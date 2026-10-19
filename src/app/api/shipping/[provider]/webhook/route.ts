import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { providerById, syncShipmentByAwb } from "@/lib/shipping";

// Courier status callback, e.g. /api/shipping/shadowfax/webhook?token=...
// The token may instead come as an Authorization header ("Token x" or bare),
// which is how the SFX 360 portal's "Token Number" field sends it.
//
// Shadowfax callbacks carry no signature, so the payload is never trusted:
// it only names an AWB, and the status itself is re-read from the courier's
// tracking API. A forged callback can at worst trigger a harmless refresh.
// The token stops strangers from making us call the courier API at will.
const sameSecret = (a: string, b: string) =>
  timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const secret = process.env.SHIPPING_WEBHOOK_TOKEN;
  const token =
    request.nextUrl.searchParams.get("token") ??
    request.headers
      .get("authorization")
      ?.replace(/^(Token|Bearer)\s+/i, "")
      .trim() ??
    "";
  if (!secret || !providerById(provider) || !sameSecret(token, secret))
    return new NextResponse("Unauthorized", { status: 401 });
  if (Number(request.headers.get("content-length") ?? 0) > 64 * 1024)
    return new NextResponse("Payload too large", { status: 413 });
  const body = (await request.json().catch(() => null)) as {
    awb_number?: unknown;
    awb?: unknown;
  } | null;
  const awb = body?.awb_number ?? body?.awb;
  if (typeof awb !== "string" || !/^[A-Za-z0-9-]{4,64}$/.test(awb))
    return new NextResponse("Invalid payload", { status: 400 });
  // Answer 200 even on a sync failure: the courier does not retry anyway, and
  // the daily cron plus the on-view refresh pick the update up.
  const known = await syncShipmentByAwb(provider, awb).catch((error) => {
    console.error("[shipping] webhook sync failed:", provider, awb, error);
    return true;
  });
  return NextResponse.json({ received: true, known });
}
