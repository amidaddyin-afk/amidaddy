"use client";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
export default function ClearCartOnSuccess({ paid }: { paid: boolean }) {
  const { clearCart } = useCart();
  useEffect(() => {
    if (paid) clearCart();
  }, [clearCart, paid]);
  return null;
}
