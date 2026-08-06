import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getOrderByPaymentSession, markOrderPaid } from "@/lib/store";

function validSignature(payload: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature");
  const payload = await request.text();
  if (!secret || !signature || !validSignature(payload, signature, secret)) {
    return new NextResponse("Invalid Razorpay webhook signature", { status: 400 });
  }

  const event = JSON.parse(payload) as { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } } };
  const razorpayOrderId = event.payload?.payment?.entity?.order_id;
  if ((event.event === "payment.captured" || event.event === "order.paid") && razorpayOrderId) {
    const order = await getOrderByPaymentSession(razorpayOrderId);
    if (order) await markOrderPaid(order.id, razorpayOrderId);
  }
  console.info("razorpay.webhook", { event: event.event, paymentId: event.payload?.payment?.entity?.id, orderId: event.payload?.payment?.entity?.order_id });
  return NextResponse.json({ received: true });
}
