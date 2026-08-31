# Amidaddy Shopify migration

The catalog in `products.csv` is intentionally imported as **draft** and not
published. This prevents the trial store from accepting orders while payments,
tax, shipping, policies, inventory ownership, and the domain cutover are still
being validated.

## Migration rules

- Shopify becomes the only live inventory source at launch.
- Do not import customer passwords or unnecessary customer data.
- Do not enable Razorpay live mode during testing.
- Do not connect the production domain until sandbox checkout, cancellation,
  refund, shipping, notification, and inventory tests pass.
- Keep recurring app spend below ₹5,000/month unless a measured requirement
  justifies an exception.

## Product media mapping

## Shopify setup status (2026-08-14)

- Store: `Amidaddy` (`amidaddy.myshopify.com`).
- Theme: Horizon 4.1.4, currently using its default unpublished setup.
- Catalog: 6 draft products, 10 SKUs, 0 sales-channel publications.
- Media: product galleries uploaded for all 6 products.
- Domestic shipping: INR 99 standard shipping (3-5 business days).
- Domestic free shipping: orders of INR 1,999 and above (3-5 business days).
- International market: inactive; no international selling has been enabled.
- Payments: inactive; Razorpay has not been connected or authorized.
- Billing: trial only; no paid plan has been purchased.
- Domain: production DNS has not been changed.

## Product media mapping

| Handle                  | Primary image                          | Additional gallery                                                              |
| ----------------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| `billionaire`           | `public/curated/billionaire.JPG`       | `public/curated/products/billionaire/detail.JPG`, `public/gallery/billionaire/` |
| `coldwar`               | `public/curated/cold-war.JPG`          | `public/curated/products/coldwar/detail.JPG`, `public/gallery/coldwar/`         |
| `heavenly`              | `public/curated/heavenly.JPG`          | `public/curated/products/heavenly/detail.JPG`, `public/gallery/heavenly/`       |
| `old-love`              | `public/curated/old-love.JPG`          | `public/curated/products/old-love/detail.JPG`, `public/gallery/old-love/`       |
| `signature-combo-20ml`  | `public/products/combos/20ml/01.webp`  | `public/products/combos/20ml/`                                                  |
| `signature-combo-100ml` | `public/products/combos/100ml/01.webp` | `public/products/combos/100ml/`                                                 |

## Launch gate

- [ ] Products, variants, SKUs, prices, compare-at prices, weights and stock verified.
- [ ] Product media and alt text verified.
- [ ] India market, INR, GST treatment and invoice requirements approved by the accountant.
- [ ] Shipping zones, prepaid rates, COD surcharge and RTO policy verified.
- [ ] Razorpay test payment, failed payment, duplicate webhook and refund verified.
- [ ] Order confirmation and shipping email verified.
- [ ] Privacy, terms, shipping, cancellation, return/replacement and contact policies published.
- [ ] Analytics consent and tracking verified.
- [ ] Paid Shopify plan selected by the owner.
- [ ] Domain DNS switched only after a final stock freeze and reconciliation.
