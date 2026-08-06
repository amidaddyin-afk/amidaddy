import type { Metadata } from "next";
import CheckoutClient from "@/components/CheckoutClient";

export const metadata: Metadata = {
  title: "Secure checkout",
  description: "Complete your Amidaddy fragrance order securely with Razorpay.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
