"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/data";
import {
  DEFAULT_FREE_SHIPPING_PAISE,
  DEFAULT_SHIPPING_FEE_PAISE,
} from "@/lib/commerce";

export interface CartItem {
  product: Product;
  variantId: string;
  size: "20ml" | "100ml";
  qty: number;
  unitPricePaise: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: "20ml" | "100ml") => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  subtotalPaise: number;
  estimatedShippingPaise: number;
  estimatedTotalPaise: number;
  totalQty: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("amidaddy-cart-v2");
    let restored: CartItem[] = [];
    if (saved) {
      try {
        restored = JSON.parse(saved) as CartItem[];
      } catch {
        window.localStorage.removeItem("amidaddy-cart-v2");
      }
    }
    queueMicrotask(() => {
      setItems(restored);
      setHydrated(true);
    });
  }, []);
  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem("amidaddy-cart-v2", JSON.stringify(items));
  }, [hydrated, items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const addItem = useCallback((product: Product, size: "20ml" | "100ml") => {
    const variant = product.variants.find(
      (item) => item.name === size && item.active,
    );
    if (!variant || variant.stock - variant.reserved <= 0) return;
    setItems((previous) => {
      const index = previous.findIndex((item) => item.variantId === variant.id);
      if (index >= 0) {
        const next = [...previous];
        next[index] = {
          ...next[index],
          qty: Math.min(
            next[index].qty + 1,
            Math.min(10, variant.stock - variant.reserved),
          ),
        };
        return next;
      }
      return [
        ...previous,
        {
          product,
          variantId: variant.id,
          size,
          qty: 1,
          unitPricePaise: variant.pricePaise,
        },
      ];
    });
    setIsOpen(true);
  }, []);
  const removeItem = useCallback(
    (productId: string, size: string) =>
      setItems((previous) =>
        previous.filter(
          (item) => !(item.product.id === productId && item.size === size),
        ),
      ),
    [],
  );
  const updateQty = useCallback(
    (productId: string, size: string, qty: number) => {
      if (qty <= 0) return removeItem(productId, size);
      setItems((previous) =>
        previous.map((item) =>
          item.product.id === productId && item.size === size
            ? {
                ...item,
                qty: Math.min(
                  qty,
                  Math.min(
                    10,
                    item.product.variants.find(
                      (variant) => variant.id === item.variantId,
                    )?.stock ?? 10,
                  ),
                ),
              }
            : item,
        ),
      );
    },
    [removeItem],
  );
  const clearCart = useCallback(() => setItems([]), []);
  const totals = useMemo(() => {
    const subtotalPaise = items.reduce(
      (sum, item) => sum + item.unitPricePaise * item.qty,
      0,
    );
    const estimatedShippingPaise =
      subtotalPaise > 0 && subtotalPaise < DEFAULT_FREE_SHIPPING_PAISE
        ? DEFAULT_SHIPPING_FEE_PAISE
        : 0;
    return {
      subtotalPaise,
      estimatedShippingPaise,
      estimatedTotalPaise: subtotalPaise + estimatedShippingPaise,
      totalQty: items.reduce((sum, item) => sum + item.qty, 0),
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        ...totals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
