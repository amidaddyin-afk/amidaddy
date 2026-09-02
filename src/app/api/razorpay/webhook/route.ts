import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getOrderByPaymentSession,
  markOrderPaid,
  markRefundProcessed,
  registerWebhookEvent,
  unregisterWebhookEvent,
} from "@/lib/orders";
import { isMatchingCapturedPayment } from "@/lib/razorpay";
import { z } from "zod";

const entitySchema = z.object({
  id: z.string().min(1).max(200).optional(),
  order_id: z.string().min(1).max(200).optional(),
  amount: z.number().int().nonnegative().optional(),
  currency: z.string().max(8).optional(),
  status: z.string().max(40).optional(),
});
const webhookSchema = z.object({
  event: z.string().min(1).max(100),
  payload: z
    .object({
      payment: z.object({ entity: entitySchema }).optional(),
      order: z.object({ entity: entitySchema }).optional(),
      refund: z.object({ entity: entitySchema }).optional(),
    })
    .optional(),
});

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
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 256 * 1024)
    return new NextResponse("Payload too large", { status: 413 });
  const payload = await request.text();
  if (payload.length > 256 * 1024)
    return new NextResponse("Payload too large", { status: 413 });
  if (!secret || !signature || !validSignature(payload, signature, secret))
    return new NextResponse("Invalid signature", { status: 400 });
  let decoded: unknown;
  try {
    decoded = JSON.parse(payload);
  } catch {
    return new NextResponse("Invalid payload", { status: 400 });
  }
  const parsed = webhookSchema.safeParse(decoded);
  if (!parsed.success)
    return new NextResponse("Invalid payload", { status: 400 });
  const body = parsed.data;
  const event = body.event;
  const eventId = await registerWebhookEvent(event, payload);
  if (!eventId) return NextResponse.json({ received: true, duplicate: true });
  try {
    const payment = body.payload?.payment?.entity;
    if (event === "payment.captured" && payment?.order_id) {
      const order = await getOrderByPaymentSession(payment.order_id);
      if (
        order &&
        isMatchingCapturedPayment(
          {
            orderId: payment.order_id,
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
          },
          payment.order_id,
          order.totalPaise,
        )
      )
        await markOrderPaid(order.id, payment.order_id, payment.id);
    }
    const razorpayOrder = body.payload?.order?.entity;
    if (event === "order.paid" && razorpayOrder?.id) {
      const order = await getOrderByPaymentSession(razorpayOrder.id);
      const orderPaymentId = body.payload?.payment?.entity?.id;
      if (
        order &&
        orderPaymentId &&
        razorpayOrder.status === "paid" &&
        razorpayOrder.amount === order.totalPaise &&
        razorpayOrder.currency === "INR"
      )
        await markOrderPaid(order.id, razorpayOrder.id, orderPaymentId);
    }
    const refund = body.payload?.refund?.entity;
    if (event === "refund.processed" && refund?.id)
      await markRefundProcessed(refund.id);
  } catch (error) {
    await unregisterWebhookEvent(eventId);
    throw error;
  }
  return NextResponse.json({ received: true });
}
