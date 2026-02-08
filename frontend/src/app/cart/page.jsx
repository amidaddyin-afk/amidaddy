"use client";

import { useState } from "react";

const initialItems = [
  { id: "1", name: "Velvet Dusk", price: 1899, qty: 1 },
  { id: "2", name: "Solar Rise", price: 1699, qty: 2 }
];

export default function CartPage() {
  const [items, setItems] = useState(initialItems);

  const updateQty = (id, qty) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="container py-14">
      <h1 className="font-display text-3xl">Your cart</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-soft"
            >
              <div>
                <h3 className="font-display text-lg">{item.name}</h3>
                <p className="text-sm text-black/50">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="h-8 w-8 rounded-full border border-black/20"
                  onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                >
                  -
                </button>
                <span>{item.qty}</span>
                <button
                  className="h-8 w-8 rounded-full border border-black/20"
                  onClick={() => updateQty(item.id, item.qty + 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-display text-xl">Summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm text-black/60">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-black/60">
            <span>Shipping</span>
            <span>₹0</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>₹{subtotal}</span>
          </div>
          <button className="mt-6 w-full rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white">
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
}
