import Link from "next/link";
import { setLeadMarketingOptOut } from "@/lib/leads";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (email) await setLeadMarketingOptOut(email).catch(() => {});
  return (
    <main data-surface="commerce" className="auth-shell">
      <div className="auth-panel border-line bg-raised mx-auto border p-9">
        <p className="text-accent mb-3 text-xs tracking-[0.2em] uppercase">
          Amidaddy
        </p>
        <h1 className="font-cinzel text-fg mb-3 text-2xl">
          You&apos;re unsubscribed
        </h1>
        <p className="text-muted text-sm">
          {email
            ? `${email} will no longer receive marketing emails from us. Order and account emails still apply.`
            : "No email address was provided."}
        </p>
        <Link href="/" className="btn-gold mt-6 inline-block">
          Back to Amidaddy
        </Link>
      </div>
    </main>
  );
}
