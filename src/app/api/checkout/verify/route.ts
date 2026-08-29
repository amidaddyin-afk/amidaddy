import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrderByPaymentSession, markOrderPaid } from "@/lib/orders";
import { takeRequestLimit } from "@/lib/request-rate-limit";
import { isMatchingCapturedPayment } from "@/lib/razorpay";

const verificationSchema = z.object({
  razorpayOrderId: z.string().regex(/^order_[A-Za-z0-9]+$/),
  razorpayPaymentId: z.string().regex(/^pay_[A-Za-z0-9]+$/),
  razorpaySignature: z.string().regex(/^[a-f0-9]{64}$/i),
});

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!(await takeRequestLimit("checkout-verify", 30, 10 * 60)))
      return NextResponse.json(
        { error: "Too many verification attempts." },
        { status: 429 },
      );

    const parsed = verificationSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid payment verification response." },
        { status: 400 },
      );

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret)
      return NextResponse.json(
        { error: "Payment verification is unavailable." },
        { status: 503 },
      );

    const input = parsed.data;
    const order = await getOrderByPaymentSession(input.razorpayOrderId);
    if (!order?.paymentOrderId)
      return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${order.paymentOrderId}|${input.razorpayPaymentId}`)
      .digest("hex");
    if (!signaturesMatch(expectedSignature, input.razorpaySignature))
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 },
      );

    if (order.paymentStatus === "PAID")
      return NextResponse.json({ confirmed: true });

    const paymentResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(input.razorpayPaymentId)}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        },
        cache: "no-store",
      },
    );
    const payment = (await paymentResponse.json()) as {
      order_id?: string;
      amount?: number;
      currency?: string;
      status?: string;
    };
    if (!paymentResponse.ok)
      return NextResponse.json(
        { error: "Payment details could not be confirmed." },
        { status: 400 },
      );

    if (payment.status !== "captured")
      return NextResponse.json({ confirmed: false }, { status: 202 });

    if (
      !isMatchingCapturedPayment(
        {
          orderId: payment.order_id,
          paymentId: input.razorpayPaymentId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
        },
        order.paymentOrderId,
        order.totalPaise,
      )
    )
      return NextResponse.json(
        { error: "Payment details could not be confirmed." },
        { status: 400 },
      );

    await markOrderPaid(
      order.id,
      order.paymentOrderId,
      input.razorpayPaymentId,
    );
    return NextResponse.json({ confirmed: true });
  } catch {
    return NextResponse.json(
      { error: "Payment confirmation is delayed." },
      { status: 502 },
    );
  }
}
