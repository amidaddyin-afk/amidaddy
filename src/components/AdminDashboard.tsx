'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Eye, PackagePlus, Save, Settings2 } from 'lucide-react';
import type { Product } from '@/lib/data';
import type { Order } from '@/lib/store';

const blankProduct: Product = { id: '', name: '', price: 0, image: '/hero1.png', profile: 'Woody', collection: 'luxury', notes: '', longevity: '', mood: '', description: '', stock: 0, active: true };

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [draft, setDraft] = useState<Product | null>(null);
  const [message, setMessage] = useState('');

  async function load() {
    const [productResponse, orderResponse] = await Promise.all([fetch('/api/admin/products'), fetch('/api/admin/orders')]);
    if (productResponse.status === 401) return;
    setProducts(await productResponse.json());
    setOrders(await orderResponse.json());
    setLoggedIn(true);
  }
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault(); setMessage('');
    const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    if (!response.ok) { const body = await response.json(); setMessage(body.error); return; }
    await load();
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!draft) return;
    const normalized = { ...draft, id: draft.id.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') };
    const response = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(normalized) });
    const body = await response.json();
    if (!response.ok) { setMessage(body.error); return; }
    setDraft(null); setMessage('Product saved.'); await load();
  }

  if (!loggedIn) return <main className="min-h-screen bg-black px-6 pt-36"><form onSubmit={login} className="mx-auto max-w-sm border border-white/10 bg-[#0e0e0e] p-7"><Settings2 className="mb-5 text-[#D4AF37]" /><p className="text-[#D4AF37] text-xs tracking-[.2em] uppercase mb-3">Amidaddy</p><h1 className="font-cinzel text-2xl text-white mb-6">Admin access</h1><input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Admin password" className="checkout-input w-full" />{message && <p className="text-red-300 text-sm mt-4">{message}</p>}<button className="btn-gold w-full mt-5">Sign in</button><p className="text-white/30 text-xs mt-5 leading-relaxed">Set ADMIN_PASSWORD in your environment before using the dashboard.</p></form></main>;

  return <main className="min-h-screen bg-black px-6 py-28"><div className="max-w-6xl mx-auto"><div className="flex flex-wrap items-end justify-between gap-5 mb-10"><div><p className="text-[#D4AF37] text-xs tracking-[.2em] uppercase mb-3">Store control</p><h1 className="font-cinzel text-3xl text-white">Admin dashboard</h1></div><button onClick={() => setDraft({ ...blankProduct })} className="btn-gold flex items-center gap-2"><PackagePlus size={16} /> Add product</button></div>{message && <p className="mb-5 text-[#D4AF37] text-sm">{message}</p>}
    {draft && <form onSubmit={save} className="mb-10 border border-[#D4AF37]/30 bg-[#0e0e0e] p-6"><div className="flex justify-between gap-4 mb-5"><h2 className="font-cinzel text-white">{products.some((p) => p.id === draft.id) ? 'Edit product' : 'Product details'}</h2><button type="button" onClick={() => setDraft(null)} className="text-white/40 text-sm">Close</button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(['id', 'name', 'image', 'price', 'originalPrice', 'stock', 'notes', 'longevity', 'mood', 'description'] as const).map((field) => <input key={field} required={['id','name','image','price','stock'].includes(field)} type={['price','originalPrice','stock'].includes(field) ? 'number' : 'text'} value={draft[field] ?? ''} onChange={(event) => setDraft({ ...draft, [field]: ['price','originalPrice','stock'].includes(field) ? Number(event.target.value) : event.target.value })} placeholder={field} className="checkout-input" />)}<select value={draft.profile} onChange={(event) => setDraft({ ...draft, profile: event.target.value as Product['profile'] })} className="checkout-input"><option>Woody</option><option>Floral</option><option>Fresh</option><option>Oriental</option></select><select value={draft.collection} onChange={(event) => setDraft({ ...draft, collection: event.target.value as Product['collection'] })} className="checkout-input"><option value="for-him">For him</option><option value="for-her">For her</option><option value="luxury">Luxury</option></select><label className="checkout-input flex items-center gap-2 text-white/60"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Active in store</label></div><button className="btn-gold mt-5 flex items-center gap-2"><Save size={15} /> Save product</button></form>}
    <section className="mb-12"><h2 className="font-cinzel text-xl text-white mb-5">Catalog and inventory</h2><div className="overflow-x-auto border border-white/10"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-white/5 text-white/40"><tr><th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Store status</th><th className="p-4"></th></tr></thead><tbody>{products.map((product) => <tr key={product.id} className="border-t border-white/5"><td className="p-4 text-white">{product.name}</td><td className="p-4 text-white/70">Rs. {product.price.toLocaleString()}</td><td className={`p-4 ${product.stock < 5 ? 'text-amber-300' : 'text-white/70'}`}>{product.stock}</td><td className="p-4 text-white/50">{product.active ? 'Live' : 'Hidden'}</td><td className="p-4"><button onClick={() => setDraft({ ...product })} className="inline-flex items-center gap-2 text-[#D4AF37] text-xs"><Eye size={14} /> Edit</button></td></tr>)}</tbody></table></div></section>
    <section><h2 className="font-cinzel text-xl text-white mb-5">Orders</h2><div className="overflow-x-auto border border-white/10"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-white/5 text-white/40"><tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4">Payment</th><th className="p-4">Placed</th></tr></thead><tbody>{orders.length ? orders.map((order) => <tr key={order.id} className="border-t border-white/5"><td className="p-4 text-white">{order.id}</td><td className="p-4"><p className="text-white">{order.customerName}</p><p className="text-white/40 text-xs">{order.email}</p></td><td className="p-4 text-white/70">Rs. {order.total.toLocaleString()}</td><td className="p-4 text-[#D4AF37]">{order.paymentStatus}</td><td className="p-4 text-white/40">{new Date(order.createdAt).toLocaleDateString()}</td></tr>) : <tr><td colSpan={5} className="p-8 text-center text-white/35">No orders yet.</td></tr>}</tbody></table></div></section>
  </div></main>;
}
