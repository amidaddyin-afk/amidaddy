"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import {
  cancelOrder,
  getCustomerOrder,
  issueRefund,
  updateOrderFulfillment,
} from "@/lib/orders";

export type OrderActionState = { error?: string; message?: string };

export async function cancelCustomerOrderAction(
  _: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const parsed = z
    .object({
      orderId: z.string().min(8).max(80),
      reason: z.string().trim().min(3).max(300),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Please provide a cancellation reason.",
    };
  const { user } = await requireUser();
  const owned = await getCustomerOrder(parsed.data.orderId, user.id);
  if (!owned) return { error: "Order not found." };
  try {
    await cancelOrder(parsed.data.orderId, parsed.data.reason, user.id);
    revalidatePath(`/account/orders/${parsed.data.orderId}`);
    revalidatePath("/account/orders");
    return { message: "Your order has been cancelled." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to cancel this order.",
    };
  }
}

export async function cancelAdminOrderAction(
  _: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const { user, profile } = await requireUser();
  if (profile?.role !== "ADMIN") return { error: "Unauthorized." };
  const parsed = z
    .object({
      orderId: z.string().min(8),
      reason: z.string().trim().min(3).max(300),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid cancellation.",
    };
  try {
    await cancelOrder(parsed.data.orderId, parsed.data.reason, user.id);
    revalidatePath("/admin");
    return { message: "Order cancelled and inventory restored." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to cancel the order.",
    };
  }
}

export async function updateFulfillmentAction(
  _: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const { user, profile } = await requireUser();
  if (profile?.role !== "ADMIN") return { error: "Unauthorized." };
  const parsed = z
    .object({
      orderId: z.string().min(8),
      status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED"]),
      courierName: z.string().trim().max(100).optional(),
      trackingNumber: z.string().trim().max(120).optional(),
      trackingUrl: z
        .union([z.literal(""), z.string().url().startsWith("https://")])
        .optional(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid fulfillment details.",
    };
  try {
    await updateOrderFulfillment(
      parsed.data.orderId,
      parsed.data.status,
      parsed.data,
      user.id,
    );
    revalidatePath("/admin");
    return { message: "Order status updated." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update the order.",
    };
  }
}

export async function refundOrderAction(
  _: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const { user, profile } = await requireUser();
  if (profile?.role !== "ADMIN") return { error: "Unauthorized." };
  const parsed = z
    .object({
      orderId: z.string().min(8),
      amountRupees: z.coerce.number().positive().max(10_000_000),
      reason: z.string().trim().min(3).max(300),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid refund." };
  try {
    await issueRefund(
      parsed.data.orderId,
      Math.round(parsed.data.amountRupees * 100),
      parsed.data.reason,
      user.id,
    );
    revalidatePath("/admin");
    return { message: "Refund submitted successfully." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to issue the refund.",
    };
  }
}
