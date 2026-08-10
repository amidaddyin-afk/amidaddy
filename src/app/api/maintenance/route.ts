import { NextRequest, NextResponse } from "next/server";
import { expirePendingOrders } from "@/lib/orders";
import { pruneRequestLimits } from "@/lib/request-rate-limit";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [expired, prunedRateLimits] = await Promise.all([
    expirePendingOrders(),
    pruneRequestLimits(),
  ]);
  return NextResponse.json({ expired, prunedRateLimits });
}
