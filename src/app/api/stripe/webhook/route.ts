import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { markOrderPaid } from '@/lib/store';

function signatureMatches(payload: string, signature: string, secret: string) {
  const timestamp = signature.match(/t=(\d+)/)?.[1];
  const expected = signature.match(/v1=([a-f0-9]+)/)?.[1];
  if (!timestamp || !expected) return false;
  const computed = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  return computed.length === expected.length && timingSafeEqual(Buffer.from(computed), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  if (!secret || !signature || !signatureMatches(payload, signature, secret)) return new NextResponse('Invalid Stripe signature', { status: 400 });
  const event = JSON.parse(payload) as { type: string; data: { object: { id?: string; metadata?: { order_id?: string } } } };
  if (event.type === 'checkout.session.completed') {
    const orderId = event.data.object.metadata?.order_id;
    if (orderId) await markOrderPaid(orderId, event.data.object.id);
  }
  return NextResponse.json({ received: true });
}
