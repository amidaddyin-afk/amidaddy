# Amidaddy Store

Production-oriented perfume commerce platform built with Next.js App Router, TypeScript, Supabase Auth, PostgreSQL, Prisma, Zod, React Query, and Razorpay.

The store includes a database-backed fragrance catalog, variant inventory, guest and account checkout, Razorpay payments and refunds, order tracking, customer cancellation, coupons, email notifications, and protected admin operations.

### Architecture

- `src/app`: App Router routes, layouts, Route Handlers, and Server Actions.
- `src/components`: reusable presentation components.
- `src/features`: domain modules, added as each business capability is implemented.
- `src/lib`: framework-neutral utilities, environment validation, database, and external-service clients.
- `src/providers`: client-only application providers.
- `prisma`: Prisma schema and migrations for the Supabase PostgreSQL database.

## Local setup

1. Copy `.env.example` to `.env.local` and populate values from your Supabase project.
2. Run `npm run db:generate` after changing the Prisma schema.
3. Back up the database, then apply the migrations in `prisma/migrations` in timestamp order. The commerce upgrade creates the `product-media` Storage bucket and customer/admin RLS policies.
4. In Supabase Auth, enable email confirmation and Google, then add `http://localhost:3000/auth/callback` and the production callback URL to the redirect allow list.
5. Configure Razorpay's signed webhook at `/api/razorpay/webhook`, verify a Resend sender, and set `CRON_SECRET` for `/api/maintenance`.
6. Run `npm run dev`, then open `http://localhost:3000`.

## Authentication

Email sign-up, email/password login, Google OAuth, password reset, session refresh, account lockouts, and Supabase-backed admin roles are implemented. The first administrator must be promoted manually after signup:

```sql
update public.profiles set role = 'ADMIN' where email = 'admin@example.com';
```

Do not expose the database URL, Supabase service-role key, Razorpay secret, or CAPTCHA secret to the browser. Turnstile validation is enabled only when `TURNSTILE_SECRET_KEY` is configured.

## Quality gates

`npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build` are the release gates. Test Razorpay and Resend in a preview environment before production promotion.

## Security baseline

Environment files are ignored, secrets are server-only, server action payloads are capped at 1 MB, and baseline browser security headers are configured in `next.config.ts`. Add secrets only through local environment files and Vercel project settings.
