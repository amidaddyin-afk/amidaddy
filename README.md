# Amidaddy Store

Full-stack Next.js perfume storefront with cart persistence, BOGO pricing, Stripe Checkout, inventory tracking, and an admin dashboard.

## Run locally

1. Copy `.env.example` to `.env.local` and set a strong `ADMIN_PASSWORD`.
2. Add Stripe test keys to enable payments and webhooks.
3. Run `npm run dev`, then open `http://localhost:3000`.

Use `/admin` to update products, pricing, stock, and review orders. Product data is persisted in `data/store.json` for a self-hosted Node deployment. For a serverless production host, move this store to a managed database before launch.
