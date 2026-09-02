import "server-only";

import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { appendAuditEvent } from "@/lib/audit";
import {
  couponDiscountPaise,
  DEFAULT_FREE_SHIPPING_PAISE,
  isCustomerCancellationAllowed,
  isFulfillmentTransitionAllowed,
  refundablePaise,
  shippingPaise,
} from "@/lib/commerce";
import { db, transaction } from "@/lib/db";
import { includedGstPaise } from "@/lib/money";
import { recordLeadCheckoutStarted, recordLeadOrderPaid } from "@/lib/leads";
import { brandedEmailHtml, sendMail } from "@/lib/mailer";

export type OrderStatus =
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "EXPIRED";
export type PaymentStatus =
  | "UNPAID"
  | "PAID"
  | "REFUND_PENDING"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "FAILED";
export type RefundStatus = "PENDING" | "PROCESSED" | "FAILED";

export interface OrderLine {
  id?: string;
  productId: string;
  variantId: string | null;
  name: string;
  size: string;
  qty: number;
  unitPricePaise: number;
  lineTotalPaise: number;
  gstRate: number;
  taxPaise: number;
}

export interface OrderRecord {
  id: string;
  customerId: string | null;
  email: string;
  customerName: string;
  phone: string;
  address: string;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  totalPaise: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  couponCode: string | null;
  paymentOrderId: string | null;
  paymentId: string | null;
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  expiresAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  lines: OrderLine[];
  refundedPaise: number;
}

type CheckoutInput = {
  id: string;
  customerId?: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: Array<{ variantId: string; qty: number }>;
  couponCode?: string;
};

type CheckoutPricingInput = {
  email: string;
  items: Array<{ variantId: string; qty: number }>;
  couponCode?: string;
};

type CheckoutLine = OrderLine & { productDbId: string };

export type CheckoutQuote = {
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  taxPaise: number;
  totalPaise: number;
  couponCode: string | null;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function orderLines(
  client: PoolClient | ReturnType<typeof db>,
  orderId: string,
): Promise<OrderLine[]> {
  const { rows } = await client.query(
    "select id, product_ref, variant_id, name, size, quantity, unit_price_paise, line_total_paise, gst_rate, tax_paise from public.order_items where order_id=$1 order by id",
    [orderId],
  );
  return rows.map((row) => ({
    id: String(row.id),
    productId: String(row.product_ref),
    variantId: row.variant_id ? String(row.variant_id) : null,
    name: String(row.name),
    size: String(row.size),
    qty: Number(row.quantity),
    unitPricePaise: Number(row.unit_price_paise),
    lineTotalPaise: Number(row.line_total_paise),
    gstRate: Number(row.gst_rate),
    taxPaise: Number(row.tax_paise),
  }));
}

async function mapOrder(
  row: Record<string, unknown>,
  client: PoolClient | ReturnType<typeof db> = db(),
): Promise<OrderRecord> {
  const lines = await orderLines(client, String(row.id));
  const refundResult = await client.query(
    "select coalesce(sum(amount_paise) filter (where status='PROCESSED'),0) amount from public.refunds where order_id=$1",
    [row.id],
  );
  const date = (value: unknown) =>
    value ? new Date(String(value)).toISOString() : null;
  return {
    id: String(row.id),
    customerId: row.customer_id ? String(row.customer_id) : null,
    email: String(row.email),
    customerName: String(row.customer_name),
    phone: String(row.phone),
    address: String(row.address),
    city: row.city ? String(row.city) : null,
    state: row.state ? String(row.state) : null,
    postalCode: row.postal_code ? String(row.postal_code) : null,
    country: String(row.country ?? "IN"),
    subtotalPaise: Number(row.subtotal_paise),
    discountPaise: Number(row.discount_paise),
    shippingPaise: Number(row.shipping_paise),
    taxPaise: Number(row.tax_paise),
    totalPaise: Number(row.total_paise),
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    couponCode: row.coupon_code ? String(row.coupon_code) : null,
    paymentOrderId: row.payment_order_id ? String(row.payment_order_id) : null,
    paymentId: row.payment_id ? String(row.payment_id) : null,
    courierName: row.courier_name ? String(row.courier_name) : null,
    trackingNumber: row.tracking_number ? String(row.tracking_number) : null,
    trackingUrl: row.tracking_url ? String(row.tracking_url) : null,
    expiresAt: date(row.expires_at),
    shippedAt: date(row.shipped_at),
    deliveredAt: date(row.delivered_at),
    cancelledAt: date(row.cancelled_at),
    cancellationReason: row.cancellation_reason
      ? String(row.cancellation_reason)
      : null,
    createdAt: date(row.created_at)!,
    updatedAt: date(row.updated_at)!,
    lines,
    refundedPaise: Number(refundResult.rows[0]?.amount ?? 0),
  };
}

async function releaseReservations(
  client: PoolClient,
  orderId: string,
  movement: "RELEASE" | "SALE",
) {
  const { rows } = await client.query(
    "select oi.variant_id, oi.quantity, pv.product_id from public.order_items oi join public.product_variants pv on pv.id=oi.variant_id where oi.order_id=$1",
    [orderId],
  );
  for (const row of rows) {
    if (movement === "SALE") {
      const result = await client.query(
        "update public.product_variants set stock=stock-$2,reserved=reserved-$2,updated_at=now() where id=$1 and stock >= $2 and reserved >= $2",
        [row.variant_id, row.quantity],
      );
      if (!result.rowCount)
        throw new Error("Reserved stock is no longer available.");
    } else {
      await client.query(
        "update public.product_variants set reserved=greatest(0,reserved-$2),updated_at=now() where id=$1",
        [row.variant_id, row.quantity],
      );
    }
    await client.query(
      "insert into public.inventory_movements(product_id,type,quantity,reason) values($1,$2,$3,$4)",
      [
        row.product_id,
        movement,
        movement === "SALE" ? -Number(row.quantity) : -Number(row.quantity),
        `${movement.toLowerCase()} for ${orderId}`,
      ],
    );
  }
}

async function restoreCommittedInventory(client: PoolClient, orderId: string) {
  const { rows } = await client.query(
    "select oi.variant_id, oi.quantity, pv.product_id from public.order_items oi join public.product_variants pv on pv.id=oi.variant_id where oi.order_id=$1",
    [orderId],
  );
  for (const row of rows) {
    await client.query(
      "update public.product_variants set stock=stock+$2,updated_at=now() where id=$1",
      [row.variant_id, row.quantity],
    );
    await client.query(
      "insert into public.inventory_movements(product_id,type,quantity,reason) values($1,'RETURN',$2,$3)",
      [row.product_id, Number(row.quantity), `cancelled order ${orderId}`],
    );
  }
}

async function calculateCheckoutPricing(
  client: PoolClient,
  input: CheckoutPricingInput,
  lockRows: boolean,
) {
  const variantIds = input.items.map((item) => item.variantId);
  if (new Set(variantIds).size !== variantIds.length)
    throw new Error("Each cart variant can only appear once.");
  if (!variantIds.every((id) => /^[0-9a-f-]{36}$/i.test(id)))
    throw new Error("The catalog is not synchronized with inventory yet.");
  const { rows: variants } = await client.query(
    `select pv.*,p.id product_id,p.slug,p.name product_name,p.gst_rate,p.active product_active,p.deleted_at from public.product_variants pv join public.products p on p.id=pv.product_id where pv.id=any($1::uuid[])${lockRows ? " for update" : ""}`,
    [variantIds],
  );
  if (variants.length !== variantIds.length)
    throw new Error("One or more cart items are unavailable.");
  const byId = new Map(
    variants.map((variant) => [String(variant.id), variant]),
  );
  const lines: CheckoutLine[] = input.items.map((item) => {
    const variant = byId.get(item.variantId);
    if (
      !variant ||
      !variant.active ||
      !variant.product_active ||
      variant.deleted_at ||
      Number(variant.stock) - Number(variant.reserved) < item.qty
    )
      throw new Error(
        `${variant?.product_name ?? "A fragrance"} is no longer available in that quantity.`,
      );
    const lineTotalPaise = Number(variant.price_paise) * item.qty;
    return {
      productId: String(variant.slug),
      productDbId: String(variant.product_id),
      variantId: String(variant.id),
      name: String(variant.product_name),
      size: String(variant.name),
      qty: item.qty,
      unitPricePaise: Number(variant.price_paise),
      lineTotalPaise,
      gstRate: Number(variant.gst_rate),
      taxPaise: includedGstPaise(lineTotalPaise, Number(variant.gst_rate)),
    };
  });
  const subtotalPaise = lines.reduce(
    (sum, line) => sum + line.lineTotalPaise,
    0,
  );
  let discountPaise = 0;
  let couponId: string | null = null;
  let couponCode: string | null = null;
  if (input.couponCode?.trim()) {
    const code = input.couponCode.trim().toUpperCase();
    const { rows } = await client.query(
      `select * from public.coupons where upper(code)=$1 and active and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>=now())${lockRows ? " for update" : ""}`,
      [code],
    );
    const coupon = rows[0];
    if (!coupon || subtotalPaise < Number(coupon.min_subtotal_paise))
      throw new Error("This coupon is not valid for the order.");
    const totalUses = Number(
      (
        await client.query(
          "select count(*) count from public.coupon_redemptions where coupon_id=$1",
          [coupon.id],
        )
      ).rows[0].count,
    );
    const customerUses = Number(
      (
        await client.query(
          "select count(*) count from public.coupon_redemptions where coupon_id=$1 and lower(email)=$2",
          [coupon.id, normalizeEmail(input.email)],
        )
      ).rows[0].count,
    );
    if (
      (coupon.usage_limit && totalUses >= Number(coupon.usage_limit)) ||
      customerUses >= Number(coupon.per_customer_limit)
    )
      throw new Error("This coupon has reached its usage limit.");
    discountPaise = couponDiscountPaise(
      subtotalPaise,
      coupon.type,
      Number(coupon.value),
      coupon.max_discount_paise ? Number(coupon.max_discount_paise) : null,
    );
    couponId = String(coupon.id);
    couponCode = String(coupon.code);
  }
  const settings = (
    await client.query("select * from public.store_settings where id=1")
  ).rows[0] ?? {
    shipping_fee_paise: 9900,
    free_shipping_above_paise: DEFAULT_FREE_SHIPPING_PAISE,
  };
  const discountedMerchandise = subtotalPaise - discountPaise;
  const orderShippingPaise = shippingPaise(
    discountedMerchandise,
    Number(settings.shipping_fee_paise),
    Math.min(
      Number(settings.free_shipping_above_paise),
      DEFAULT_FREE_SHIPPING_PAISE,
    ),
  );
  const taxPaise = includedGstPaise(discountedMerchandise, 18);
  const totalPaise = discountedMerchandise + orderShippingPaise;
  return {
    lines,
    couponId,
    couponCode,
    subtotalPaise,
    discountPaise,
    shippingPaise: orderShippingPaise,
    taxPaise,
    totalPaise,
  };
}

export async function quoteCheckout(
  input: CheckoutPricingInput,
): Promise<CheckoutQuote> {
  return transaction(async (client) => {
    const pricing = await calculateCheckoutPricing(client, input, false);
    return {
      subtotalPaise: pricing.subtotalPaise,
      discountPaise: pricing.discountPaise,
      shippingPaise: pricing.shippingPaise,
      taxPaise: pricing.taxPaise,
      totalPaise: pricing.totalPaise,
      couponCode: pricing.couponCode,
    };
  });
}

export async function createPendingOrder(input: CheckoutInput) {
  const result = await transaction(async (client) => {
    const pricing = await calculateCheckoutPricing(
      client,
      {
        email: input.customer.email,
        items: input.items,
        couponCode: input.couponCode,
      },
      true,
    );
    const {
      lines,
      couponId,
      couponCode,
      subtotalPaise,
      discountPaise,
      shippingPaise: orderShippingPaise,
      taxPaise,
      totalPaise,
    } = pricing;
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);
    await client.query(
      "insert into public.orders(id,customer_id,email,customer_name,phone,address,city,state,postal_code,country,subtotal_paise,discount_paise,shipping_paise,tax_paise,total_paise,status,payment_status,coupon_code,expires_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,'IN',$10,$11,$12,$13,$14,'PAYMENT_PENDING','UNPAID',$15,$16)",
      [
        input.id,
        input.customerId ?? null,
        normalizeEmail(input.customer.email),
        input.customer.name.trim(),
        input.customer.phone.trim(),
        input.customer.address.trim(),
        input.customer.city.trim(),
        input.customer.state.trim(),
        input.customer.postalCode.trim(),
        subtotalPaise,
        discountPaise,
        orderShippingPaise,
        taxPaise,
        totalPaise,
        couponCode,
        expiresAt,
      ],
    );
    for (const line of lines) {
      await client.query(
        "update public.product_variants set reserved=reserved+$2,updated_at=now() where id=$1",
        [line.variantId, line.qty],
      );
      await client.query(
        "insert into public.order_items(order_id,product_ref,variant_id,name,size,quantity,unit_price_paise,gst_rate,tax_paise,line_total_paise) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [
          input.id,
          line.productId,
          line.variantId,
          line.name,
          line.size,
          line.qty,
          line.unitPricePaise,
          line.gstRate,
          line.taxPaise,
          line.lineTotalPaise,
        ],
      );
      await client.query(
        "insert into public.inventory_movements(product_id,type,quantity,reason) values($1,'RESERVATION',$2,$3)",
        [line.productDbId, line.qty, `reservation for ${input.id}`],
      );
    }
    if (couponId)
      await client.query(
        "insert into public.coupon_redemptions(coupon_id,order_id,customer_id,email,amount_paise) values($1,$2,$3,$4,$5)",
        [
          couponId,
          input.id,
          input.customerId ?? null,
          normalizeEmail(input.customer.email),
          discountPaise,
        ],
      );
    return {
      id: input.id,
      amountPaise: totalPaise,
      subtotalPaise,
      discountPaise,
      shippingPaise: orderShippingPaise,
      taxPaise,
      expiresAt: expiresAt.toISOString(),
    };
  });
  await recordLeadCheckoutStarted(input.customer.email, {
    fullName: input.customer.name,
    phone: input.customer.phone,
    customerId: input.customerId ?? null,
  }).catch(() => {});
  return result;
}

export async function recordPaymentOrder(
  orderId: string,
  paymentOrderId: string,
) {
  await db().query(
    "update public.orders set payment_order_id=$2,updated_at=now() where id=$1",
    [orderId, paymentOrderId],
  );
}
export async function getOrderByPaymentSession(paymentOrderId: string) {
  const { rows } = await db().query(
    "select * from public.orders where payment_order_id=$1 limit 1",
    [paymentOrderId],
  );
  return rows[0] ? mapOrder(rows[0]) : undefined;
}
export async function getOrder(orderId: string) {
  const { rows } = await db().query(
    "select * from public.orders where id=$1 limit 1",
    [orderId],
  );
  return rows[0] ? mapOrder(rows[0]) : undefined;
}

export async function markOrderPaid(
  orderId: string,
  paymentOrderId?: string,
  paymentId?: string,
) {
  const changed = await transaction(async (client) => {
    const { rows } = await client.query(
      "select * from public.orders where id=$1 for update",
      [orderId],
    );
    const order = rows[0];
    if (!order || order.payment_status === "PAID") return false;
    if (order.status !== "PAYMENT_PENDING") return false;
    await releaseReservations(client, orderId, "SALE");
    await client.query(
      "update public.orders set status='CONFIRMED',payment_status='PAID',payment_order_id=coalesce($2,payment_order_id),payment_id=coalesce($3,payment_id),expires_at=null,updated_at=now() where id=$1",
      [orderId, paymentOrderId ?? null, paymentId ?? null],
    );
    return true;
  });
  if (changed) {
    await sendOrderEmail(orderId, "order-confirmed");
    const order = await getOrder(orderId);
    if (order)
      await recordLeadOrderPaid(
        order.email,
        order.id,
        order.totalPaise,
        order.customerId ?? null,
      ).catch(() => {});
  }
}

export async function listOrders(filters?: {
  search?: string;
  status?: string;
}) {
  const values: unknown[] = [];
  const where: string[] = [];
  if (filters?.search) {
    values.push(`%${filters.search}%`);
    where.push(
      `(id ilike $${values.length} or email ilike $${values.length} or customer_name ilike $${values.length})`,
    );
  }
  if (filters?.status) {
    values.push(filters.status);
    where.push(`status=$${values.length}::public."OrderStatus"`);
  }
  const { rows } = await db().query(
    `select * from public.orders ${where.length ? `where ${where.join(" and ")}` : ""} order by created_at desc limit 250`,
    values,
  );
  return Promise.all(rows.map((row) => mapOrder(row)));
}

export async function claimAndListCustomerOrders(
  customerId: string,
  verifiedEmail: string,
) {
  const email = normalizeEmail(verifiedEmail);
  await db().query(
    "update public.orders set customer_id=$1,updated_at=now() where customer_id is null and lower(email)=$2",
    [customerId, email],
  );
  const { rows } = await db().query(
    "select * from public.orders where customer_id=$1 order by created_at desc",
    [customerId],
  );
  return Promise.all(rows.map((row) => mapOrder(row)));
}

export async function getCustomerOrder(orderId: string, customerId: string) {
  const { rows } = await db().query(
    "select * from public.orders where id=$1 and customer_id=$2",
    [orderId, customerId],
  );
  return rows[0] ? mapOrder(rows[0]) : undefined;
}

async function razorpayRefund(paymentId: string, amountPaise: number) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret)
    throw new Error("Razorpay refunds are not configured.");
  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: amountPaise, speed: "normal" }),
    },
  );
  const body = (await response.json()) as {
    id?: string;
    error?: { description?: string };
  };
  if (!response.ok || !body.id)
    throw new Error(
      body.error?.description ?? "Razorpay could not create the refund.",
    );
  return body.id;
}

export async function cancelOrder(
  orderId: string,
  reason: string,
  actorId?: string,
) {
  const order = await getOrder(orderId);
  if (!order) throw new Error("Order not found.");
  if (!isCustomerCancellationAllowed(order.status))
    throw new Error("This order can no longer be cancelled online.");
  let refundId: string | null = null;
  if (order.paymentStatus === "PAID") {
    if (!order.paymentId)
      throw new Error(
        "Payment details are still synchronizing. Please try again shortly.",
      );
    refundId = await razorpayRefund(
      order.paymentId,
      refundablePaise(order.totalPaise, order.refundedPaise),
    );
  }
  await transaction(async (client) => {
    const locked = (
      await client.query("select * from public.orders where id=$1 for update", [
        orderId,
      ])
    ).rows[0];
    if (!locked || !["PAYMENT_PENDING", "CONFIRMED"].includes(locked.status))
      throw new Error("Order status changed before cancellation completed.");
    if (locked.status === "PAYMENT_PENDING")
      await releaseReservations(client, orderId, "RELEASE");
    if (locked.status === "PAYMENT_PENDING")
      await client.query(
        "delete from public.coupon_redemptions where order_id=$1",
        [orderId],
      );
    if (locked.status === "CONFIRMED")
      await restoreCommittedInventory(client, orderId);
    if (refundId)
      await client.query(
        "insert into public.refunds(order_id,payment_refund_id,amount_paise,reason,status,requested_by,processed_at) values($1,$2,$3,$4,'PROCESSED',$5,now())",
        [
          orderId,
          refundId,
          refundablePaise(order.totalPaise, order.refundedPaise),
          reason,
          actorId ?? null,
        ],
      );
    await client.query(
      "update public.orders set status='CANCELLED',payment_status=$2::public.\"PaymentStatus\",cancelled_at=now(),cancellation_reason=$3,updated_at=now() where id=$1",
      [orderId, refundId ? "REFUNDED" : locked.payment_status, reason],
    );
    await appendAuditEvent(client, actorId ?? null, "order.cancelled", {
      orderId,
      refunded: Boolean(refundId),
    });
  });
  await sendOrderEmail(
    orderId,
    refundId ? "order-refunded" : "order-cancelled",
  );
}

export async function issueRefund(
  orderId: string,
  amountPaise: number,
  reason: string,
  actorId: string,
) {
  const order = await getOrder(orderId);
  if (!order?.paymentId || order.paymentStatus === "UNPAID")
    throw new Error("This order has no refundable payment.");
  const refundable = refundablePaise(order.totalPaise, order.refundedPaise);
  if (amountPaise < 100 || amountPaise > refundable)
    throw new Error("Refund amount exceeds the refundable balance.");
  const refundId = await razorpayRefund(order.paymentId, amountPaise);
  await transaction(async (client) => {
    await client.query(
      "insert into public.refunds(order_id,payment_refund_id,amount_paise,reason,status,requested_by,processed_at) values($1,$2,$3,$4,'PROCESSED',$5,now())",
      [orderId, refundId, amountPaise, reason, actorId],
    );
    await client.query(
      'update public.orders set payment_status=$2::public."PaymentStatus",updated_at=now() where id=$1',
      [orderId, amountPaise === refundable ? "REFUNDED" : "PARTIALLY_REFUNDED"],
    );
    await appendAuditEvent(client, actorId, "order.refunded", {
      orderId,
      amountPaise,
    });
  });
  await sendOrderEmail(orderId, "order-refunded");
}

export async function updateOrderFulfillment(
  orderId: string,
  status: Extract<OrderStatus, "PROCESSING" | "SHIPPED" | "DELIVERED">,
  tracking: {
    courierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  },
  actorId: string,
) {
  await transaction(async (client) => {
    const order = (
      await client.query("select * from public.orders where id=$1 for update", [
        orderId,
      ])
    ).rows[0];
    if (!order || !isFulfillmentTransitionAllowed(order.status, status))
      throw new Error("That fulfillment transition is not allowed.");
    if (
      status === "SHIPPED" &&
      (!tracking.courierName || !tracking.trackingNumber)
    )
      throw new Error(
        "Courier and tracking number are required to ship an order.",
      );
    await client.query(
      "update public.orders set status=$2::public.\"OrderStatus\",courier_name=coalesce($3::text,courier_name),tracking_number=coalesce($4::text,tracking_number),tracking_url=coalesce($5::text,tracking_url),shipped_at=case when $2::text='SHIPPED' then now() else shipped_at end,delivered_at=case when $2::text='DELIVERED' then now() else delivered_at end,updated_at=now() where id=$1",
      [
        orderId,
        status,
        tracking.courierName ?? null,
        tracking.trackingNumber ?? null,
        tracking.trackingUrl ?? null,
      ],
    );
    await appendAuditEvent(client, actorId, "order.status_changed", {
      orderId,
      status,
    });
  });
  await sendOrderEmail(
    orderId,
    status === "SHIPPED"
      ? "order-shipped"
      : status === "DELIVERED"
        ? "order-delivered"
        : "order-processing",
  );
}

export async function expirePendingOrders() {
  return transaction(async (client) => {
    const { rows } = await client.query(
      "select id from public.orders where status='PAYMENT_PENDING' and expires_at<now() for update skip locked",
    );
    for (const row of rows) {
      await releaseReservations(client, String(row.id), "RELEASE");
      await client.query(
        "delete from public.coupon_redemptions where order_id=$1",
        [row.id],
      );
      await client.query(
        "update public.orders set status='EXPIRED',payment_status='FAILED',updated_at=now() where id=$1",
        [row.id],
      );
    }
    return rows.length;
  });
}

export async function registerWebhookEvent(event: string, payload: string) {
  const id = createHash("sha256").update(`${event}:${payload}`).digest("hex");
  const result = await db().query(
    "insert into public.webhook_events(id,provider,event,payload_hash) values($1,'razorpay',$2,$3) on conflict do nothing",
    [id, event, createHash("sha256").update(payload).digest("hex")],
  );
  return result.rowCount ? id : null;
}

export async function unregisterWebhookEvent(id: string) {
  await db().query("delete from public.webhook_events where id=$1", [id]);
}

export async function markRefundProcessed(paymentRefundId: string) {
  await transaction(async (client) => {
    const { rows } = await client.query(
      "update public.refunds set status='PROCESSED',processed_at=now() where payment_refund_id=$1 returning order_id",
      [paymentRefundId],
    );
    if (!rows[0]) return;
    const orderId = String(rows[0].order_id);
    const totals = (
      await client.query(
        "select o.total_paise,coalesce(sum(r.amount_paise) filter(where r.status='PROCESSED'),0) refunded from public.orders o left join public.refunds r on r.order_id=o.id where o.id=$1 group by o.id",
        [orderId],
      )
    ).rows[0];
    await client.query(
      "update public.orders set payment_status=$2,updated_at=now() where id=$1",
      [
        orderId,
        Number(totals.refunded) >= Number(totals.total_paise)
          ? "REFUNDED"
          : "PARTIALLY_REFUNDED",
      ],
    );
  });
}

export async function sendOrderEmail(orderId: string, template: string) {
  const order = await getOrder(orderId);
  if (!order) return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const orderNotificationEmail = process.env.ORDER_NOTIFICATION_EMAIL;

  const itemsHtml = order.lines
    .map(
      (line) =>
        `<tr style="border-bottom:1px solid #e0d9ce">
          <td style="padding:12px;text-align:left">${line.name}<br/><span style="font-size:12px;color:#999">${line.size}</span></td>
          <td style="padding:12px;text-align:center">${line.qty}</td>
          <td style="padding:12px;text-align:right">₹${(line.unitPricePaise / 100).toLocaleString("en-IN")}</td>
          <td style="padding:12px;text-align:right"><strong>₹${(line.lineTotalPaise / 100).toLocaleString("en-IN")}</strong></td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="background:#f5f1e8;padding:20px">
      <div style="max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:4px">
        <div style="text-align:center;margin-bottom:30px">
          <p style="color:#d8b77a;letter-spacing:.3em;font-size:14px;margin:0">AMIDADDY</p>
        </div>

        <h1 style="font-size:24px;margin:20px 0;text-align:center">${emailSubject(template, order.id)}</h1>
        <p style="text-align:center;color:#666;margin-bottom:30px">Order #${order.id}</p>

        <div style="background:#f9f7f3;padding:15px;margin-bottom:30px;border-radius:4px">
          <p style="margin:0;color:#333"><strong>Status:</strong> ${order.status.replaceAll("_", " ")}</p>
          <p style="margin:8px 0 0;color:#333"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
        </div>

        <h3 style="font-size:16px;margin:20px 0 15px;color:#333">Order Items</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead>
            <tr style="border-bottom:2px solid #d8b77a">
              <th style="padding:12px;text-align:left;color:#333">Product</th>
              <th style="padding:12px;text-align:center;color:#333">Qty</th>
              <th style="padding:12px;text-align:right;color:#333">Price</th>
              <th style="padding:12px;text-align:right;color:#333">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="border-top:1px solid #e0d9ce;padding-top:15px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span>Subtotal:</span>
            <strong>₹${(order.subtotalPaise / 100).toLocaleString("en-IN")}</strong>
          </div>
          ${
            order.discountPaise > 0
              ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#d8b77a">
            <span>Discount:</span>
            <strong>-₹${(order.discountPaise / 100).toLocaleString("en-IN")}</strong>
          </div>`
              : ""
          }
          ${
            order.shippingPaise > 0
              ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span>Shipping:</span>
            <strong>₹${(order.shippingPaise / 100).toLocaleString("en-IN")}</strong>
          </div>`
              : ""
          }
          ${
            order.taxPaise > 0
              ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span>Tax:</span>
            <strong>₹${(order.taxPaise / 100).toLocaleString("en-IN")}</strong>
          </div>`
              : ""
          }
          <div style="display:flex;justify-content:space-between;font-size:18px;border-top:1px solid #e0d9ce;padding-top:12px;margin-top:12px">
            <span><strong>Total:</strong></span>
            <strong style="color:#d8b77a">₹${(order.totalPaise / 100).toLocaleString("en-IN")}</strong>
          </div>
        </div>

        <div style="background:#f9f7f3;padding:15px;margin-bottom:20px;border-radius:4px">
          <h4 style="margin:0 0 10px;font-size:14px">Shipping Address</h4>
          <p style="margin:0;font-size:13px;line-height:1.6">
            ${order.customerName}<br/>
            ${order.address}<br/>
            ${order.city}${order.state ? ", " + order.state : ""} ${order.postalCode ?? ""}<br/>
            ${order.country}
          </p>
        </div>

        ${
          order.trackingUrl
            ? `<div style="text-align:center;margin-bottom:20px">
          <a href="${order.trackingUrl}" style="background:#d8b77a;color:#fff;padding:12px 30px;text-decoration:none;border-radius:4px;display:inline-block">Track Your Order</a>
        </div>`
            : ""
        }

        <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #e0d9ce">
          <a href="${appUrl}/account/orders/${order.id}" style="color:#d8b77a;text-decoration:none;font-size:14px">View full order details</a>
        </div>

        <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #e0d9ce;font-size:12px;color:#999">
          <p style="margin:0">Questions? Reply to this email or visit our store at ${appUrl}</p>
          <p style="margin:8px 0 0">Thank you for your purchase!</p>
        </div>
      </div>
    </div>
  `;

  await sendMail({
    to: order.email,
    template,
    orderId,
    idempotencyKey: `${orderId}-${template}`,
    bcc:
      template === "order-confirmed" && orderNotificationEmail
        ? orderNotificationEmail
        : undefined,
    subject: emailSubject(template, order.id),
    html,
  });
}

function emailSubject(template: string, orderId: string) {
  const labels: Record<string, string> = {
    "order-confirmed": "Your Amidaddy order is confirmed",
    "order-processing": "Your order is being prepared",
    "order-shipped": "Your Amidaddy order is on the way",
    "order-delivered": "Your order has been delivered",
    "order-cancelled": "Your order has been cancelled",
    "order-refunded": "Your Amidaddy refund is complete",
  };
  return `${labels[template] ?? "Amidaddy order update"} · ${orderId}`;
}
