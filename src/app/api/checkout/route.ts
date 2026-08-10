import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { takeRequestLimit } from "@/lib/request-rate-limit";
import {
  cancelOrder,
  createPendingOrder,
  recordPaymentOrder,
} from "@/lib/orders";

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    phone: z
      .string()
      .trim()
      .regex(/^[+0-9 ()-]{8,20}$/),
    address: z.string().trim().min(8).max(300),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{6}$/),
  }),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1).max(80),
        qty: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(30),
  couponCode: z.string().trim().max(40).optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (!(await takeRequestLimit("checkout", 10, 10 * 60)))
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again shortly." },
        { status: 429 },
      );
    const parsed = checkoutSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Please check your delivery details.",
        },
        { status: 400 },
      );
    const current = await getCurrentUser();
    const verified = Boolean(
      current?.user.email_confirmed_at && current.user.email,
    );
    const customer = verified
      ? { ...parsed.data.customer, email: current!.user.email! }
      : parsed.data.customer;
    const applicationOrderId = `AM-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const pending = await createPendingOrder({
      id: applicationOrderId,
      customerId: verified ? current!.user.id : null,
      customer,
      items: parsed.data.items,
      couponCode: parsed.data.couponCode,
    });
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      await cancelOrder(
        applicationOrderId,
        "Payment provider is not configured.",
      );
      return NextResponse.json(
        { error: "Payments are temporarily unavailable." },
        { status: 503 },
      );
    }
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: pending.amountPaise,
        currency: "INR",
        receipt: applicationOrderId,
        notes: { amidaddy_order_id: applicationOrderId },
      }),
    });
    const razorpayOrder = (await razorpayResponse.json()) as {
      id?: string;
      amount?: number;
      currency?: string;
      error?: { description?: string };
    };
    if (!razorpayResponse.ok || !razorpayOrder.id) {
      await cancelOrder(applicationOrderId, "Payment order creation failed.");
      return NextResponse.json(
        {
          error:
            razorpayOrder.error?.description ??
            "Unable to create payment order.",
        },
        { status: 502 },
      );
    }
    await recordPaymentOrder(applicationOrderId, razorpayOrder.id);
    return NextResponse.json({
      applicationOrderId,
      razorpayOrderId: razorpayOrder.id,
      keyId,
      amount: pending.amountPaise,
      currency: "INR",
      customer,
      totals: pending,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to begin checkout.",
      },
      { status: 400 },
    );
  }
}
