export const policyDetails = {
  brand: "Amidaddy (AD Perfume)",
  supportEmail: "support@amidaddy.in",
  lastUpdated: "18 August 2026",
  shippingFee: "₹99",
  freeShippingAbove: "₹1,999",
  paymentGateway: "Razorpay",
};

export type PolicySlug =
  | "shipping-delivery"
  | "returns-refunds-replacements"
  | "payment-terms"
  | "terms-conditions"
  | "privacy-policy";
export const policyLinks: { slug: PolicySlug; label: string }[] = [
  { slug: "shipping-delivery", label: "Shipping & delivery" },
  { slug: "returns-refunds-replacements", label: "Returns & refunds" },
  { slug: "payment-terms", label: "Payment terms" },
  { slug: "terms-conditions", label: "Terms & conditions" },
  { slug: "privacy-policy", label: "Privacy policy" },
];
export function isPolicySlug(value: string): value is PolicySlug {
  return policyLinks.some((item) => item.slug === value);
}
