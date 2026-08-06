import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { quoteCheckout } from "@/lib/orders";

const quoteSchema = z.object({
  email: z.string().trim().email().max(254),
  couponCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{3,24}$/),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        qty: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(30),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = quoteSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.path[0] === "email"
              ? "Enter a valid email address before applying the coupon."
              : "Enter a valid coupon code.",
        },
        { status: 400 },
      );
    const current = await getCurrentUser();
    const email =
      current?.user.email_confirmed_at && current.user.email
        ? current.user.email
        : parsed.data.email;
    const quote = await quoteCheckout({ ...parsed.data, email });
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to apply coupon.",
      },
      { status: 400 },
    );
  }
}
