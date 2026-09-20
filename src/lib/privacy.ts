import "server-only";

import { db } from "@/lib/db";
import { claimAndListCustomerOrders } from "@/lib/orders";
import { eraseLeadPersonalData, setLeadMarketingOptOut } from "@/lib/leads";

/**
 * DPDP Act 2023 data-principal rights, s.11 (access) and s.12 (correction and
 * erasure). Everything here is scoped to one verified, signed-in account: the
 * caller passes an id and email that came from the Supabase session, never
 * from user input.
 */

/** s.11: everything we hold about this person, as a downloadable object. */
export async function buildDataExport(customerId: string, email: string) {
  const [profile, lead, events, orders] = await Promise.all([
    db()
      .query(
        "select id, email, full_name, role, created_at from public.profiles where id=$1",
        [customerId],
      )
      .then((r) => r.rows[0] ?? null)
      .catch(() => null),
    db()
      .query("select * from public.leads where email=$1", [email.toLowerCase()])
      .then((r) => r.rows[0] ?? null)
      .catch(() => null),
    db()
      .query(
        "select type, metadata, created_at from public.lead_events where email=$1 order by created_at",
        [email.toLowerCase()],
      )
      .then((r) => r.rows)
      .catch(() => []),
    claimAndListCustomerOrders(customerId, email).catch(() => []),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    notice:
      "Personal data held by Amidaddy (AD Perfume), provided under section 11 of the Digital Personal Data Protection Act, 2023. Payment credentials are held by Razorpay and never stored by us.",
    account: profile,
    marketing: lead,
    activity: events,
    orders,
  };
}

/** s.12(1): correction of inaccurate personal data. */
export async function correctPersonalData(
  customerId: string,
  email: string,
  fullName: string,
) {
  const name = fullName.trim();
  await db().query("update public.profiles set full_name=$2 where id=$1", [
    customerId,
    name,
  ]);
  await db()
    .query(
      "update public.leads set full_name=$2, updated_at=now() where email=$1",
      [email.toLowerCase(), name],
    )
    .catch(() => {});
}

/**
 * s.12(3): erasure. Orders are retained because tax and accounting law
 * requires them (s.12(3) proviso), so this erases the marketing profile and
 * behavioural history and severs the contact details we are free to drop.
 */
export async function erasePersonalData(customerId: string, email: string) {
  await setLeadMarketingOptOut(email).catch(() => {});
  await eraseLeadPersonalData(email).catch(() => {});
  await db()
    .query("update public.profiles set full_name=null where id=$1", [
      customerId,
    ])
    .catch(() => {});
}
