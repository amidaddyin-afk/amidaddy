import "server-only";

import { db } from "@/lib/db";

/** Thin wrapper around the Resend HTTP API, shared by order transactional
 * mail (src/lib/orders.ts) and lead nurture campaigns (src/lib/campaigns.ts).
 * Every send is logged to notification_logs so delivery is auditable from
 * one table regardless of which caller triggered it. */
export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  bcc?: string;
  idempotencyKey: string;
  orderId?: string | null;
  campaign?: string | null;
  template: string;
}) {
  const log = await db().query(
    "insert into public.notification_logs(order_id,recipient,template,campaign,status,attempts) values($1,$2,$3,$4,'PENDING',1) returning id",
    [
      options.orderId ?? null,
      options.to,
      options.template,
      options.campaign ?? null,
    ],
  );
  const logId = log.rows[0].id;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    await db().query(
      "update public.notification_logs set status='SKIPPED',error='Resend is not configured' where id=$1",
      [logId],
    );
    console.error(
      `[email] Skipped ${options.template} for ${options.to}: RESEND_API_KEY or RESEND_FROM_EMAIL is missing.`,
    );
    return { ok: false as const };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": options.idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: options.to,
        reply_to: options.replyTo ?? "support@amidaddy.in",
        ...(options.bcc ? { bcc: options.bcc } : {}),
        subject: options.subject,
        html: options.html,
      }),
    });
    const body = (await response.json()) as { id?: string; message?: string };
    if (!response.ok)
      throw new Error(body.message ?? "Email provider rejected the message.");
    await db().query(
      "update public.notification_logs set status='SENT',provider_id=$2,sent_at=now() where id=$1",
      [logId, body.id ?? null],
    );
    return { ok: true as const, providerId: body.id };
  } catch (error) {
    await db().query(
      "update public.notification_logs set status='FAILED',error=$2 where id=$1",
      [logId, error instanceof Error ? error.message : "Unknown email error"],
    );
    console.error(
      `[email] Failed ${options.template} for ${options.to}: ${error instanceof Error ? error.message : "Unknown email error"}`,
    );
    return { ok: false as const };
  }
}

export function brandedEmailHtml(bodyHtml: string) {
  return `<div style="background:#090909;color:#f7f1e7;padding:36px;font-family:Arial,sans-serif"><p style="color:#d8b77a;letter-spacing:.2em">AMIDADDY</p>${bodyHtml}</div>`;
}
