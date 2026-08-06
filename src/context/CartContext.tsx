'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Product } from '@/lib/data';

export interface CartItem {
  product: Product;
  size: '20ml' | '100ml';
  qty: number;
  unitPrice: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: '20ml' | '100ml') => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  subtotal: number;
  discount: number;
  total: number;
  totalQty: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const SIZE_PRICE = { '20ml': 199, '100ml': 1199 };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('amidaddy-cart');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as CartItem[];
      queueMicrotask(() => setItems(parsed));
    } catch {
      window.localStorage.removeItem('amidaddy-cart');
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('amidaddy-cart', JSON.stringify(items));
  }, [items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((product: Product, size: '20ml' | '100ml') => {
    const unitPrice = SIZE_PRICE[size];
    setItems(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id && i.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(next[idx].qty + 1, 10) };
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
      i.product.id === productId && i.size === size ? { ...i, qty: Math.min(qty, 10) } : i
    ));
  }, [removeItem]);
  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const discount = 0;
  const total = subtotal;
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, isOpen, openCart, closeCart, addItem, removeItem, updateQty, clearCart, subtotal, discount, total, totalQty }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
