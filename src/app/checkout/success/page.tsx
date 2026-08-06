'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  useEffect(() => { clearCart(); }, [clearCart]);
  return (
    <main className="min-h-screen bg-black px-6 pt-40 text-center">
      <CheckCircle2 className="mx-auto mb-6 text-[#D4AF37]" size={54} />
      <p className="text-[#D4AF37] text-xs tracking-[0.25em] uppercase mb-4">Payment received</p>
      <h1 className="font-cinzel text-3xl text-white mb-5">Your order is confirmed</h1>
      <p className="max-w-md mx-auto text-white/50 text-sm leading-relaxed mb-9">Thank you for choosing Amidaddy. We will prepare your fragrances and send delivery updates to your email.</p>
      <Link href="/" className="btn-gold inline-block">Return to Store</Link>
    </main>
  );
}
