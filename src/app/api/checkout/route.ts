import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getProduct, recordStripeSession, type OrderLine } from '@/lib/store';

const prices = { '20ml': 199, '100ml': 1199 } as const;

interface CheckoutItem { productId: string; size: keyof typeof prices; qty: number }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = body.items as CheckoutItem[];
  const customer = body.customer as { name: string; email: string; phone: string; address: string };
  if (!Array.isArray(items) || !items.length || !customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
    return NextResponse.json({ error: 'Please provide your contact, delivery details, and cart items.' }, { status: 400 });
  }

  const lines: OrderLine[] = [];
  for (const item of items) {
    if (!item || !(item.size in prices) || !Number.isInteger(item.qty) || item.qty < 1) {
      return NextResponse.json({ error: 'Your cart contains an invalid item.' }, { status: 400 });
    }
    const product = await getProduct(item.productId);
    if (!product || !product.active || product.stock < item.qty) {
      return NextResponse.json({ error: `${product?.name ?? 'A product'} is no longer available in that quantity.` }, { status: 409 });
    }
    lines.push({ productId: product.id, name: product.name, size: item.size, qty: item.qty, unitPrice: prices[item.size] });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const total = subtotal;
  const orderId = `AM-${Date.now().toString(36).toUpperCase()}`;
  await createOrder({ id: orderId, email: customer.email, customerName: customer.name, phone: customer.phone, address: customer.address, total, status: 'pending', paymentStatus: 'unpaid', createdAt: new Date().toISOString(), lines });

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return NextResponse.json({ error: 'Payments are not configured yet. Add Razorpay test keys to enable checkout.' }, { status: 503 });
  const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: total * 100, currency: 'INR', receipt: orderId, notes: { amidaddy_order_id: orderId } }),
  });
  const razorpayOrder = await razorpayResponse.json() as { id?: string; amount?: number; currency?: string; error?: { description?: string } };
  if (!razorpayResponse.ok || !razorpayOrder.id || !razorpayOrder.amount) return NextResponse.json({ error: razorpayOrder.error?.description ?? 'Unable to create Razorpay order.' }, { status: 502 });
  await recordStripeSession(orderId, razorpayOrder.id);
  return NextResponse.json({ orderId: razorpayOrder.id, keyId, amount: razorpayOrder.amount, currency: razorpayOrder.currency ?? 'INR', receipt: orderId, customer });
}
