'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Product } from '@/lib/data';

export interface CartItem {
  product: Product;
  size: '50ml' | '100ml';
  qty: number;
  unitPrice: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: '50ml' | '100ml') => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  subtotal: number;
  discount: number;
  total: number;
  totalQty: number;
}

const CartContext = createContext<CartContextType | null>(null);

const SIZE_MULTIPLIER = { '50ml': 1, '100ml': 1.6 };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((product: Product, size: '50ml' | '100ml') => {
    const unitPrice = Math.round(product.price * SIZE_MULTIPLIER[size]);
    setItems(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id && i.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { product, size, qty: 1, unitPrice }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size: string) => {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.size === size)));
  }, []);

  const updateQty = useCallback((productId: string, size: string, qty: number) => {
    if (qty <= 0) { removeItem(productId, size); return; }
    setItems(prev => prev.map(i =>
      i.product.id === productId && i.size === size ? { ...i, qty } : i
    ));
  }, [removeItem]);

  // BOGO: flatten all items, sort desc by price, every 2nd is free
  const flattened = items.flatMap(item =>
    Array.from({ length: item.qty }, () => item.unitPrice)
  ).sort((a, b) => b - a);

  const subtotal = flattened.reduce((s, p) => s + p, 0);
  const discount = flattened.filter((_, i) => i % 2 !== 0).reduce((s, p) => s + p, 0);
  const total = subtotal - discount;
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, isOpen, openCart, closeCart, addItem, removeItem, updateQty, subtotal, discount, total, totalQty }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
