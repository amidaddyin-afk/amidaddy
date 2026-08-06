import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await listOrders());
}
