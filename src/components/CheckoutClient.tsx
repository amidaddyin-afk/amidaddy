'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, LockKeyhole, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CheckoutClient() {
  const { items, subtotal, total } = useCart();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const values = new FormData(event.currentTarget);
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name: values.get('name'), email: values.get('email'), phone: values.get('phone'), address: values.get('address') },
        items: items.map((item) => ({ productId: item.product.id, size: item.size, qty: item.qty })),
      }),
    });
    const data = await response.json();
    if (!data.orderId) { setError(data.error ?? 'Unable to begin checkout.'); setSubmitting(false); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const Razorpay = (window as typeof window & { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay;
      if (!Razorpay) { setError('Unable to load Razorpay checkout.'); setSubmitting(false); return; }
      new Razorpay({ key: data.keyId, amount: data.amount, currency: data.currency, name: 'Amidaddy', description: 'Luxury fragrances', order_id: data.orderId, prefill: { name: data.customer.name, email: data.customer.email, contact: data.customer.phone }, handler: () => { window.location.assign(`/checkout/success?order=${data.receipt}`); }, modal: { ondismiss: () => setSubmitting(false) } }).open();
    };
    script.onerror = () => { setError('Unable to load Razorpay checkout.'); setSubmitting(false); };
    document.body.appendChild(script);
  }

  if (!items.length) return (
    <main className="min-h-screen bg-black px-6 pt-40 text-center">
      <ShoppingBag className="mx-auto mb-5 text-white/30" size={42} />
      <h1 className="font-cinzel text-2xl text-white mb-4">Your bag is empty</h1>
      <Link href="/" className="btn-gold inline-block">Browse fragrances</Link>
    </main>
  );

  return (
    <main className="checkout-shell min-h-screen bg-black">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#D4AF37] text-xs tracking-wider uppercase mb-10"><ArrowLeft size={15} /> Continue shopping</Link>
        <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr]">
          <form onSubmit={submit} className="border border-white/10 bg-[#0e0e0e] p-6 sm:p-9">
            <p className="text-[#D4AF37] text-xs tracking-[.2em] uppercase mb-3">Secure checkout</p>
            <h1 className="font-cinzel text-3xl text-white mb-8">Delivery details</h1>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required name="name" placeholder="Full name" className="checkout-input sm:col-span-2" />
              <input required type="email" name="email" placeholder="Email address" className="checkout-input" />
              <input required name="phone" placeholder="Phone number" className="checkout-input" />
              <textarea required name="address" placeholder="Complete delivery address, including PIN code" rows={4} className="checkout-input sm:col-span-2 resize-none" />
            </div>
            {error && <p className="mt-5 border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 text-sm">{error}</p>}
            <button disabled={submitting} className="btn-gold mt-7 flex w-full items-center justify-center gap-2 disabled:opacity-60">
              <LockKeyhole size={15} /> {submitting ? 'Opening payment...' : `Pay Rs. ${total.toLocaleString()} securely`}
            </button>
            <p className="mt-4 text-center text-white/30 text-xs">Payments are processed securely by Razorpay.</p>
          </form>
          <aside className="h-fit border border-white/10 bg-[#0e0e0e] p-6">
            <h2 className="font-cinzel text-lg text-white mb-6">Order summary</h2>
            <div className="space-y-4 border-b border-white/10 pb-5">
              {items.map((item) => <div key={`${item.product.id}-${item.size}`} className="flex justify-between gap-4 text-sm"><div><p className="text-white">{item.product.name}</p><p className="text-white/35 text-xs mt-1">{item.size} x {item.qty}</p></div><span className="text-white/70">Rs. {(item.unitPrice * item.qty).toLocaleString()}</span></div>)}
            </div>
            <div className="space-y-3 pt-5 text-sm"><div className="flex justify-between text-white/50"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div><div className="flex justify-between border-t border-white/10 pt-4 text-lg text-white"><span>Total</span><span>Rs. {total.toLocaleString()}</span></div></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
