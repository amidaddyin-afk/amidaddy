import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getOrderByPaymentSession,
  markOrderPaid,
  markRefundProcessed,
  registerWebhookEvent,
} from "@/lib/orders";

function validSignature(payload: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return (
    expected.length === signature.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  );
}
export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature");
  const payload = await request.text();
  if (!secret || !signature || !validSignature(payload, signature, secret))
    return new NextResponse("Invalid signature", { status: 400 });
  const body = JSON.parse(payload) as {
    event?: string;
    payload?: {
      payment?: {
        entity?: { id?: string; order_id?: string; status?: string };
      };
      order?: { entity?: { id?: string; status?: string } };
      refund?: { entity?: { id?: string; status?: string } };
    };
  };
  const event = body.event ?? "unknown";
  if (!(await registerWebhookEvent(event, payload)))
    return NextResponse.json({ received: true, duplicate: true });
  const payment = body.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id ?? body.payload?.order?.entity?.id;
  if (
    (event === "payment.captured" || event === "order.paid") &&
    razorpayOrderId
  ) {
    const order = await getOrderByPaymentSession(razorpayOrderId);
    if (order) await markOrderPaid(order.id, razorpayOrderId, payment?.id);
  }
  const refund = body.payload?.refund?.entity;
  if (event === "refund.processed" && refund?.id)
    await markRefundProcessed(refund.id);
  return NextResponse.json({ received: true });
}
