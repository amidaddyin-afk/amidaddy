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

## 4. Free Cloudflare Email Routing

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
- No change: website A/CNAME records, unless your current production domain is not already connected to Vercel.
- Recommended: add `DMARC` at `_dmarc.amidaddy.in` after Resend provides the final SPF/DKIM values, starting with `p=none` while validating delivery.

## Verification checklist

- Sign up with email and receive a Supabase confirmation email from `auth@send.amidaddy.in`.
- Request a password reset and confirm the link returns to `/auth/callback`.
- Place a test order and confirm the Resend notification arrives.
- Email `support@amidaddy.in` and confirm it reaches `amidaddy.in@gmail.com`.
- Confirm the login page has only email/password fields and no Google button.
