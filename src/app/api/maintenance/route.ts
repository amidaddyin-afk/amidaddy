import { NextRequest, NextResponse } from "next/server";
import { expirePendingOrders } from "@/lib/orders";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const expired = await expirePendingOrders();
  return NextResponse.json({ expired });
}
