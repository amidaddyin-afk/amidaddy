import Link from "next/link";
import { ArrowRight, Package, ShieldCheck, UserRound } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { requireUser } from "@/lib/auth";
import { claimAndListCustomerOrders } from "@/lib/orders";
import { formatInr } from "@/lib/money";

export const dynamic = "force-dynamic";
export default async function AccountPage() {
  const { user, profile } = await requireUser();
  const orders =
    user.email_confirmed_at && user.email
      ? await claimAndListCustomerOrders(user.id, user.email).catch(() => [])
      : [];
  const paid = orders.reduce((sum, order) => sum + order.totalPaise, 0);
  return (
    <main data-surface="commerce" className="account-shell">
      <div className="mx-auto max-w-6xl px-5 pt-16 pb-24 sm:px-8">
        <p className="eyebrow">Your Amidaddy</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="display-title text-5xl">
              Welcome, {profile?.full_name?.split(" ")[0] ?? "back"}.
            </h1>
            <p className="text-subtle mt-3">{user.email}</p>
          </div>
          <form action={signOutAction}>
            <button className="btn-ghost">Sign out</button>
          </form>
        </div>
        {!user.email_confirmed_at && (
          <p className="error-banner">
            Verify your email to claim and view orders placed with this address.
          </p>
        )}
        <section className="account-stats">
          <article>
            <Package />
            <span>{orders.length}</span>
            <p>Orders</p>
          </article>
          <article>
            <ShieldCheck />
            <span>{formatInr(paid)}</span>
            <p>Order value</p>
          </article>
          <article>
            <UserRound />
            <span>{profile?.role === "ADMIN" ? "Admin" : "Member"}</span>
            <p>Access</p>
          </article>
        </section>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="display-title text-3xl">Recent orders</h2>
              <Link href="/account/orders" className="text-link">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="order-list mt-5">
              {orders.slice(0, 3).map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`}>
                  <div>
                    <span>{order.id}</span>
                    <p>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <span>{order.status.replaceAll("_", " ")}</span>
                    <strong>{formatInr(order.totalPaise)}</strong>
                  </div>
                </Link>
              ))}
              {!orders.length && (
                <div className="lux-panel p-8">
                  <p className="text-subtle">
                    Your fragrance history will appear here.
                  </p>
                  <Link href="/shop" className="lux-button mt-5">
                    Find your first scent
                  </Link>
                </div>
              )}
            </div>
          </section>
          <aside className="lux-panel p-7">
            <p className="eyebrow">Account care</p>
            <h2 className="display-title mt-4 text-3xl">
              Everything in one place.
            </h2>
            <p className="text-subtle mt-5 text-sm leading-7">
              Track fulfillment, open courier updates, download receipts and
              cancel eligible orders without waiting for support.
            </p>
            {profile?.role === "ADMIN" && (
              <Link href="/admin" className="lux-button mt-7">
                Open store control
              </Link>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
