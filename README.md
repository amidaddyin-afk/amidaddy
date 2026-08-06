# Amidaddy Store

Production-oriented perfume commerce platform built with Next.js App Router, TypeScript, Supabase Auth, PostgreSQL, Prisma, Zod, React Query, and Razorpay.

## Milestone 1: foundation

The existing storefront remains available while the production architecture is introduced incrementally. Authentication, the product data migration, checkout, and Razorpay are separate milestones; do not use the current local file store or Stripe routes for a production deployment.

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
3. Apply `prisma/migrations/20260806180000_auth_foundation/migration.sql` in the Supabase SQL editor before enabling authentication.
4. In Supabase Auth, enable email confirmation and Google, then add `http://localhost:3000/auth/callback` and the production callback URL to the redirect allow list.
5. Run `npm run dev`, then open `http://localhost:3000`.

## Authentication

Email sign-up, email/password login, Google OAuth, password reset, session refresh, account lockouts, and Supabase-backed admin roles are implemented. The first administrator must be promoted manually after signup:

```sql
update public.profiles set role = 'ADMIN' where email = 'admin@example.com';
```

Do not expose the database URL, Supabase service-role key, Razorpay secret, or CAPTCHA secret to the browser. Turnstile validation is enabled only when `TURNSTILE_SECRET_KEY` is configured.

## Quality gates

`npm run lint`, `npm run typecheck`, and `npm run format:check` run the baseline checks. Husky invokes lint-staged for staged TypeScript and configuration files.

## Security baseline

Environment files are ignored, secrets are server-only, server action payloads are capped at 1 MB, and baseline browser security headers are configured in `next.config.ts`. Add secrets only through local environment files and Vercel project settings.
