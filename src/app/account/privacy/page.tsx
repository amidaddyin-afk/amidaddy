import type { Metadata } from "next";
import Link from "next/link";
import ConsentSettings from "@/components/ConsentSettings";
import {
  CorrectionForm,
  ErasureForm,
  MarketingConsentForm,
} from "@/features/privacy/privacy-forms";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { policyDetails as d } from "@/lib/policies";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Privacy centre",
  description:
    "Exercise your rights under the Digital Personal Data Protection Act, 2023.",
};

export default async function PrivacyCentrePage() {
  const { user, profile } = await requireUser();
  const optedIn = user.email
    ? await db()
        .query("select marketing_opt_in from public.leads where email=$1", [
          user.email.toLowerCase(),
        ])
        .then((r) => Boolean(r.rows[0]?.marketing_opt_in))
        .catch(() => false)
    : false;

  return (
    <main data-surface="commerce" className="account-shell">
      <div className="mx-auto max-w-3xl px-5 pt-16 pb-24 sm:px-8">
        <p className="eyebrow">Your Amidaddy™ · Privacy</p>
        <h1 className="display-title mt-4 text-4xl">Privacy centre</h1>
        <p className="text-subtle mt-3">
          Your rights under the Digital Personal Data Protection Act, 2023. We
          act on these requests within 30 days.
        </p>

        <section className="privacy-section">
          <h2>Download my data</h2>
          <p>
            A copy of everything we hold about {user.email}: your account,
            orders, marketing record and activity history. Payment credentials
            are held by {d.paymentGateway} and never stored by us.
          </p>
          <Link
            href="/account/privacy/export"
            className="btn-ghost mt-4 inline-block"
            prefetch={false}
          >
            Download (JSON)
          </Link>
        </section>

        <section className="privacy-section">
          <h2>Correct my data</h2>
          <p>
            Update the name we hold. To correct an email or delivery address,
            email <a href={`mailto:${d.supportEmail}`}>{d.supportEmail}</a>.
          </p>
          <div className="mt-4">
            <CorrectionForm fullName={profile?.full_name ?? ""} />
          </div>
        </section>

        <section className="privacy-section">
          <h2>Marketing consent</h2>
          <p>Withdraw consent at any time; it takes effect immediately.</p>
          <div className="mt-4">
            <MarketingConsentForm optedIn={optedIn} />
          </div>
        </section>

        <section className="privacy-section">
          <h2>Cookies and analytics</h2>
          <div className="mt-4">
            <ConsentSettings />
          </div>
        </section>

        <section className="privacy-section">
          <h2>Erase my data</h2>
          <p>
            Erases your marketing profile and activity history, and clears the
            name on your account. Order and invoice records are retained where
            tax and accounting law requires it. This cannot be undone.
          </p>
          <div className="mt-4">
            <ErasureForm />
          </div>
        </section>

        <section className="privacy-section">
          <h2>Grievance officer</h2>
          <p>
            Unhappy with how we handled a request? Contact our Grievance Officer
            at <a href={`mailto:${d.grievanceEmail}`}>{d.grievanceEmail}</a>. We
            acknowledge within 48 hours and resolve within 30 days. You may then
            complain to the Data Protection Board of India.
          </p>
          <p className="privacy-note">
            <Link href="/policies/privacy-policy">
              Read the full privacy policy
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
