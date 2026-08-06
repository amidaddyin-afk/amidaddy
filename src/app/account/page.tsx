import { signOutAction } from "@/features/auth/actions";
import { requireUser } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { user, profile } = await requireUser();
  return (
    <main className="min-h-screen bg-black px-6 text-white" style={{ paddingTop: "9rem" }}>
      <section className="mx-auto max-w-3xl border border-white/10 bg-[#0e0e0e] p-7">
        <p className="mb-3 text-xs tracking-[0.2em] text-[#D4AF37] uppercase">Account</p>
        <h1 className="font-cinzel text-2xl">{profile?.full_name ?? user.email}</h1>
        <p className="mt-2 text-white/60">{user.email}</p>
        {!user.email_confirmed_at && <p className="mt-5 text-sm text-amber-300">Verify your email address before placing orders.</p>}
        <div className="mt-7 flex flex-wrap gap-3">
          {profile?.role === "ADMIN" && <Link href="/admin" className="btn-gold">Open admin portal</Link>}
          <form action={signOutAction}><button className="btn-ghost">Sign out</button></form>
        </div>
      </section>
    </main>
  );
}
