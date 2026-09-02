# Amidaddy email setup

This setup keeps `support@amidaddy.in` as a free Cloudflare-routed inbox while using Resend for transactional mail and Supabase Auth mail.

## 1. Resend

1. Create a Resend account and add the sending subdomain `send.amidaddy.in` (using a subdomain avoids conflicting with Cloudflare's root-domain MX records).
2. Add every DNS record Resend gives you in Cloudflare DNS. Keep them as DNS-only, not proxied.
3. Create an API key with sending access.
4. Use `Amidaddy <auth@send.amidaddy.in>` for Supabase Auth and `Amidaddy <orders@send.amidaddy.in>` for order notifications.

## 2. Supabase Auth email

In Supabase Dashboard → Authentication → SMTP settings, enable custom SMTP:

- Host: `smtp.resend.com`
- Port: `465` (SSL) or `587` (STARTTLS)
- Username: `resend`
- Password: your Resend API key
- Sender name: `Amidaddy`
- Sender email: `auth@send.amidaddy.in`

In Authentication → Providers, leave Email enabled and disable Google. In URL Configuration, keep the production callback URL:
`https://YOUR_DOMAIN/auth/callback`

## 3. Vercel

Set these Production environment variables in Vercel (Project → Settings → Environment Variables), then redeploy:

```text
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Amidaddy <orders@send.amidaddy.in>
ORDER_NOTIFICATION_EMAIL=amidaddy.in@gmail.com
NEXT_PUBLIC_APP_URL=https://amidaddy.in
```

The Resend API key is server-only. Do not use it as a `NEXT_PUBLIC_` variable. The existing app uses it for order confirmation/status emails; Supabase Auth uses the same Resend account through its SMTP settings.

## 4. Signup verification (one-time code, not a link)

Signup is confirmed with a 6-digit code the customer types into the app, not a "click here" link.

1. Supabase Dashboard → Authentication → Email Templates → **Confirm signup**.
2. Edit the template body so it shows `{{ .Token }}` (the 6-digit code) instead of, or in addition to, `{{ .ConfirmationURL }}`. Example body:
   ```html
   <h2>Confirm your Amidaddy account</h2>
   <p>Enter this code to finish creating your account:</p>
   <p style="font-size:28px;letter-spacing:.3em">
     <strong>{{ .Token }}</strong>
   </p>
   <p>
     This code expires shortly. If you didn't request it, ignore this email.
   </p>
   ```
3. Leave "OTP expiry" under Authentication → Providers → Email at its default (1 hour) or shorten it if you prefer.
4. The app posts the code to `/verify-email` (see `src/features/auth/verify-email-form.tsx`), which calls Supabase's `verifyOtp`. No code change is needed on your side beyond this template edit — this is a one-time Supabase dashboard configuration step.

## 5. Lead tracking and nurture emails

Every signup and checkout is recorded in `public.leads` regardless of whether it becomes an order (`src/lib/leads.ts`). A cron job at `/api/maintenance` (scheduled by `vercel.ts` once daily at 03:00 UTC — Vercel's Hobby plan only allows daily cron schedules) sends two one-time nurture emails through the same Resend account, logged in `notification_logs.campaign`:

- **signup-no-order**: to leads who verified signup but had no order after 48 hours.
- **abandoned-checkout**: to leads who started checkout but never paid, 3 hours later.

Each is sent at most once per lead (`campaign_sends` unique index), and every campaign email includes an `/unsubscribe?email=` link that turns off `leads.marketing_opt_in` — transactional order emails are unaffected by that flag. Set `CRON_SECRET` in your environment for this cron to run; without it, `/api/maintenance` returns 401 and the automation silently does not run (order-expiry cleanup is also gated on it, so this typically will already be set).

The admin portal's **Leads** tab (`/admin#leads`) shows the funnel (subscribers → signed up → started checkout → abandoned/customer) and a searchable table; the **Export CSV** button downloads the same data from `/api/admin/leads`.

## 6. Free Cloudflare Email Routing

1. Cloudflare Dashboard → `amidaddy.in` → Email → Email Routing → Get started.
2. Add destination address `amidaddy.in@gmail.com` and verify the Gmail confirmation email.
3. Create a custom address: `support@amidaddy.in` → `amidaddy.in@gmail.com`.
4. Accept Cloudflare's DNS changes. It will add the required root-domain MX records and SPF-related routing records.
5. Do not remove Cloudflare's MX records. Do not point `send.amidaddy.in` MX records at Cloudflare; Resend owns the sending subdomain's mail authentication records.
6. Send a test email to `support@amidaddy.in` and reply from Gmail to confirm delivery.

## Domain-side changes required

- Required: Resend verification records for `send.amidaddy.in`.
- Required: Cloudflare Email Routing MX/TXT records for `amidaddy.in`.
- Required: Supabase Auth custom SMTP configuration.
- Required: the "Confirm signup" template edited to show `{{ .Token }}` (section 4).
- Required: `CRON_SECRET` set in Vercel for lead nurture emails to send (section 5).
- No change: website A/CNAME records, unless your current production domain is not already connected to Vercel.
- Recommended: add `DMARC` at `_dmarc.amidaddy.in` after Resend provides the final SPF/DKIM values, starting with `p=none` while validating delivery.

## Verification checklist

- Sign up with email, receive a Supabase confirmation email from `auth@send.amidaddy.in` showing a 6-digit code, and complete verification at `/verify-email`.
- Request a password reset and confirm the link returns to `/auth/callback`.
- Place a test order and confirm the Resend notification arrives.
- Email `support@amidaddy.in` and confirm it reaches `amidaddy.in@gmail.com`.
- Confirm the login page has only email/password fields and no Google button.
- Confirm a signed-up lead appears in the admin portal's Leads tab, and that `/api/admin/leads` downloads a CSV.
- After deploying, confirm the `/api/maintenance` cron is visible under the Vercel project's Cron Jobs tab and returns `{"expired":...,"prunedRateLimits":...,"leadNurture":{...}}` when called with the `CRON_SECRET` bearer token.
