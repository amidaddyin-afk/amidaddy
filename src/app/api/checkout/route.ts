import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getProduct, recordStripeSession, type OrderLine } from '@/lib/store';

const multiplier = { '50ml': 1, '100ml': 1.6 } as const;

interface CheckoutItem { productId: string; size: keyof typeof multiplier; qty: number }

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = body.items as CheckoutItem[];
  const customer = body.customer as { name: string; email: string; phone: string; address: string };
  if (!Array.isArray(items) || !items.length || !customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
    return NextResponse.json({ error: 'Please provide your contact, delivery details, and cart items.' }, { status: 400 });
  }

  const lines: OrderLine[] = [];
  for (const item of items) {
    if (!item || !(item.size in multiplier) || !Number.isInteger(item.qty) || item.qty < 1) {
      return NextResponse.json({ error: 'Your cart contains an invalid item.' }, { status: 400 });
    }
    const product = await getProduct(item.productId);
    if (!product || !product.active || product.stock < item.qty) {
      return NextResponse.json({ error: `${product?.name ?? 'A product'} is no longer available in that quantity.` }, { status: 409 });
    }
    lines.push({ productId: product.id, name: product.name, size: item.size, qty: item.qty, unitPrice: Math.round(product.price * multiplier[item.size]) });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const flattened = lines.flatMap((line) => Array.from({ length: line.qty }, () => line.unitPrice)).sort((a, b) => b - a);
  const discount = flattened.filter((_, index) => index % 2 === 1).reduce((sum, value) => sum + value, 0);
  const total = subtotal - discount;
  const orderId = `AM-${Date.now().toString(36).toUpperCase()}`;
  await createOrder({ id: orderId, email: customer.email, customerName: customer.name, phone: customer.phone, address: customer.address, total, status: 'pending', paymentStatus: 'unpaid', createdAt: new Date().toISOString(), lines });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return NextResponse.json({ error: 'Payments are not configured yet. Add STRIPE_SECRET_KEY to enable checkout.' }, { status: 503 });

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) return NextResponse.json({ error: 'Set NEXT_PUBLIC_SITE_URL to create a payment session.' }, { status: 500 });
  const form = new URLSearchParams({
    mode: 'payment',
    success_url: `${origin}/checkout/success?order=${orderId}`,
    cancel_url: `${origin}/checkout?cancelled=1`,
    'customer_email': customer.email,
    'metadata[order_id]': orderId,
  });
  lines.forEach((line, index) => {
    form.set(`line_items[${index}][price_data][currency]`, 'inr');
    form.set(`line_items[${index}][price_data][product_data][name]`, `${line.name} (${line.size})`);
    form.set(`line_items[${index}][price_data][unit_amount]`, String(line.unitPrice * 100));
    form.set(`line_items[${index}][quantity]`, String(line.qty));
  });
  if (discount) {
    const couponResponse = await fetch('https://api.stripe.com/v1/coupons', {
      method: 'POST',
      headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ amount_off: String(discount * 100), currency: 'inr', duration: 'once', name: 'Buy One Get One Free', 'metadata[order_id]': orderId }),
    });
    const coupon = await couponResponse.json() as { id?: string; error?: { message?: string } };
    if (!couponResponse.ok || !coupon.id) return NextResponse.json({ error: coupon.error?.message ?? 'Unable to apply the offer.' }, { status: 502 });
    form.set('discounts[0][coupon]', coupon.id);
  }
  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: form });
  const session = await stripeResponse.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!stripeResponse.ok || !session.url || !session.id) return NextResponse.json({ error: session.error?.message ?? 'Unable to start payment.' }, { status: 502 });
  await recordStripeSession(orderId, session.id);
  return NextResponse.json({ url: session.url });
}
