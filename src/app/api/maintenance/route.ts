import { NextRequest, NextResponse } from "next/server";
import { expirePendingOrders } from "@/lib/orders";
import { pruneRequestLimits } from "@/lib/request-rate-limit";
import { runLeadNurtureCampaigns } from "@/lib/campaigns";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [expired, prunedRateLimits, leadNurture] = await Promise.all([
    expirePendingOrders(),
    pruneRequestLimits(),
    runLeadNurtureCampaigns().catch((error) => {
      console.error("[maintenance] lead nurture campaigns failed:", error);
      return { signupNudges: 0, checkoutNudges: 0 };
    }),
  ]);
  return NextResponse.json({ expired, prunedRateLimits, leadNurture });
}
