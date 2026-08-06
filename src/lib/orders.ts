import "server-only";

import { Pool } from "pg";
import type { Order, OrderLine } from "@/lib/store";

const globalForPool = globalThis as unknown as { orderPool?: Pool };

function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  globalForPool.orderPool ??= new Pool({ connectionString });
  return globalForPool.orderPool;
}

function toOrder(row: Record<string, unknown>, lines: OrderLine[]): Order {
  return { id: String(row.id), email: String(row.email), customerName: String(row.customer_name), phone: String(row.phone), address: String(row.address), total: Number(row.total), status: row.status as Order["status"], paymentStatus: row.payment_status as Order["paymentStatus"], stripeSessionId: row.payment_order_id ? String(row.payment_order_id) : undefined, createdAt: new Date(String(row.created_at)).toISOString(), lines };
}

async function linesForOrder(orderId: string) {
  const { rows } = await getPool().query("select product_id, name, size, quantity, unit_price from public.order_items where order_id = $1 order by id", [orderId]);
  return rows.map((row) => ({ productId: row.product_id, name: row.name, size: row.size, qty: row.quantity, unitPrice: row.unit_price })) as OrderLine[];
}

export async function createOrder(order: Order) {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    await client.query("insert into public.orders (id, email, customer_name, phone, address, total, status, payment_status, created_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [order.id, order.email, order.customerName, order.phone, order.address, order.total, order.status, order.paymentStatus, order.createdAt]);
    for (const line of order.lines) await client.query("insert into public.order_items (order_id, product_id, name, size, quantity, unit_price) values ($1, $2, $3, $4, $5, $6)", [order.id, line.productId, line.name, line.size, line.qty, line.unitPrice]);
    await client.query("commit");
    return order;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function recordPaymentOrder(orderId: string, paymentOrderId: string) {
  await getPool().query("update public.orders set payment_order_id = $2 where id = $1", [orderId, paymentOrderId]);
}

export async function getOrderByPaymentSession(paymentOrderId: string) {
  const { rows } = await getPool().query("select * from public.orders where payment_order_id = $1 limit 1", [paymentOrderId]);
  if (!rows[0]) return undefined;
  return toOrder(rows[0], await linesForOrder(String(rows[0].id)));
}

export async function markOrderPaid(orderId: string, paymentOrderId?: string) {
  await getPool().query("update public.orders set status = 'paid', payment_status = 'paid', payment_order_id = coalesce($2, payment_order_id) where id = $1", [orderId, paymentOrderId]);
}

export async function listOrders() {
  const { rows } = await getPool().query("select * from public.orders order by created_at desc");
  return Promise.all(rows.map(async (row) => toOrder(row, await linesForOrder(String(row.id)))));
}
