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
4. In Supabase Auth, enable email confirmation, disable Google (and any other social providers), then add `http://localhost:3000/auth/callback` and the production callback URL to the redirect allow list. Signup confirmation uses a 6-digit code, not a link: under Authentication → Email Templates → Confirm signup, the template must render `{{ .Token }}` (see `EMAIL_SETUP.md`).
5. Configure Razorpay's signed webhook at `/api/razorpay/webhook` and enable automatic payment capture. Checkout also verifies Razorpay's signed success response at `/api/checkout/verify` for immediate confirmation.
6. In Resend, verify your sending domain, create an API key, and set `RESEND_API_KEY` plus `RESEND_FROM_EMAIL`. Optionally set `ORDER_NOTIFICATION_EMAIL` to receive a private store copy of confirmed-order emails.
7. Set `CRON_SECRET` for `/api/maintenance`, configure both Turnstile keys, and choose `ADMIN_SESSION_MAX_AGE_HOURS` (12 by default). Production authentication fails closed when the Turnstile secret is absent. `vercel.ts` schedules `/api/maintenance` every 15 minutes on Vercel Cron (requires the project to be deployed on Vercel with `CRON_SECRET` set — Vercel Cron sends it automatically as the `Authorization: Bearer` header).
8. Run `npm run dev`, then open `http://localhost:3000`.

## Authentication

Email sign-up (confirmed with a 6-digit OTP, see `EMAIL_SETUP.md`), email/password login, password reset, session refresh, account lockouts, and Supabase-backed admin roles are implemented. Customer sessions use Supabase's normal refresh behavior; admin access has a separate absolute lifetime and requires a fresh sign-in after expiry. The first administrator must be promoted manually after signup:

```sql
update public.profiles set role = 'ADMIN' where email = 'admin@example.com';
```

Do not expose the database URL, Supabase service-role key, Razorpay secret, or CAPTCHA secret to the browser. Both Turnstile variables are required in production.

## Leads and order tracking

Every signup and checkout is tracked in `public.leads` (see `src/lib/leads.ts`), independent of whether it ever becomes a paid order. `/api/maintenance` (see above) also runs `src/lib/campaigns.ts` on its schedule, which emails a one-time nudge to leads that signed up but never ordered (48h) and to leads that started checkout but never paid (3h), then never repeats that email for the same lead (enforced by a unique index, not just application logic). The admin portal's Leads tab (`/admin#leads`) shows the funnel and lets you download every lead as CSV from `/api/admin/leads`. Customers can already see their own order history at `/account/orders` once signed in with the same email used at checkout (orders are auto-claimed on first login by matching email); there is no separate guest order-lookup page.

## Quality gates

`npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build` are the release gates. Test Razorpay and Resend in a preview environment before production promotion.

## Security baseline

Environment files are ignored, secrets are server-only, server action payloads are capped at 1 MB, and browser security headers including CSP and HSTS are configured in `next.config.ts`. Production requests are redirected to HTTPS, database connections require verified TLS, and authentication cookies receive explicit `HttpOnly`, `Secure`, and `SameSite=Lax` policy. Add secrets only through local environment files and Vercel project settings.

GitHub Actions scans the complete Git history with Gitleaks and blocks high-severity dependency advisories on pushes, pull requests, and a weekly schedule. The production PostgreSQL provider must also have encryption at rest enabled; Supabase projects provide this platform control, but it must be confirmed in the project and backup settings before launch.
