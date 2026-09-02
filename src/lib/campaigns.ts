import "server-only";

import {
  claimCampaignSend,
  listQuietSignups,
  listStalledCheckouts,
  markLeadAbandoned,
} from "@/lib/leads";
import { brandedEmailHtml, sendMail } from "@/lib/mailer";

const SIGNED_UP_NO_ORDER_HOURS = 48;
const ABANDONED_CHECKOUT_HOURS = 3;

/** Runs on the maintenance cron. Emails leads who signed up but never
 * started a checkout, and leads who started a checkout but never paid —
 * each lead is nudged at most once per campaign (enforced by the unique
 * constraint behind claimCampaignSend). */
export async function runLeadNurtureCampaigns() {
  const [quiet, stalled] = await Promise.all([
    listQuietSignups(SIGNED_UP_NO_ORDER_HOURS),
    listStalledCheckouts(ABANDONED_CHECKOUT_HOURS),
  ]);

  let signupNudges = 0;
  for (const lead of quiet) {
    if (!lead.marketingOptIn) continue;
    if (!(await claimCampaignSend(lead.email, "signup-no-order"))) continue;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    await sendMail({
      to: lead.email,
      template: "lead-signup-no-order",
      campaign: "signup-no-order",
      idempotencyKey: `signup-no-order-${lead.email}`,
      subject: "Still deciding? Your Amidaddy scent is waiting",
      html: brandedEmailHtml(
        `<h1>Still deciding?</h1><p>You created an Amidaddy account${lead.fullName ? `, ${lead.fullName}` : ""} but haven't placed your first order yet. Have a look through the collection whenever you're ready.</p><p><a style="color:#d8b77a" href="${appUrl}/shop">Browse the collection</a></p><p style="opacity:.6;font-size:12px">You're receiving this because you created an account at amidaddy.in. <a style="color:#d8b77a" href="${appUrl}/unsubscribe?email=${encodeURIComponent(lead.email)}">Unsubscribe</a></p>`,
      ),
    });
    signupNudges += 1;
  }

  let checkoutNudges = 0;
  for (const lead of stalled) {
    await markLeadAbandoned(lead.email);
    if (!lead.marketingOptIn) continue;
    if (!(await claimCampaignSend(lead.email, "abandoned-checkout"))) continue;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    await sendMail({
      to: lead.email,
      template: "lead-abandoned-checkout",
      campaign: "abandoned-checkout",
      idempotencyKey: `abandoned-checkout-${lead.email}`,
      subject: "You left something in your cart",
      html: brandedEmailHtml(
        `<h1>Your selection is still here</h1><p>You started an order at Amidaddy but didn't finish checking out. Your cart items are still in stock.</p><p><a style="color:#d8b77a" href="${appUrl}/shop">Complete your order</a></p><p style="opacity:.6;font-size:12px">You're receiving this because you started a checkout at amidaddy.in. <a style="color:#d8b77a" href="${appUrl}/unsubscribe?email=${encodeURIComponent(lead.email)}">Unsubscribe</a></p>`,
      ),
    });
    checkoutNudges += 1;
  }

  return { signupNudges, checkoutNudges };
}
