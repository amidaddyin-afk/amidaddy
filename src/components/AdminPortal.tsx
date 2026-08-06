import { Activity, Boxes, ChartNoAxesCombined, Settings, ShoppingBag, Users } from "lucide-react";
import type { AdminOverview } from "@/lib/admin-data";

const sections = [
  ["Overview", ChartNoAxesCombined],
  ["Orders", ShoppingBag],
  ["Products", Boxes],
  ["Customers", Users],
  ["Activity", Activity],
  ["Settings", Settings],
] as const;

export default function AdminPortal({ overview }: { overview: AdminOverview }) {
  const cards = [
    ["Revenue", `Rs. ${overview.paidRevenue.toLocaleString()}`],
    ["Orders", overview.orderCount.toString()],
    ["Live products", `${overview.activeProductCount} / ${overview.productCount}`],
    ["Customers", overview.customerCount.toString()],
  ];
  return (
    <main className="admin-shell min-h-screen bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="border border-white/10 bg-[#0e0e0e] p-4 lg:min-h-[620px]">
          <p className="px-3 pb-5 text-xs tracking-[0.2em] text-[#D4AF37] uppercase">Store control</p>
          <nav className="grid gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {sections.map(([label, Icon]) => <a key={label} href={`#${label.toLowerCase()}`} className="flex items-center gap-3 px-3 py-2 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white"><Icon size={16} />{label}</a>)}
          </nav>
        </aside>
        <div className="min-w-0">
          <section id="overview"><p className="text-xs tracking-[0.2em] text-[#D4AF37] uppercase">Admin</p><h1 className="font-cinzel mt-2 text-3xl">Dashboard</h1><div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <div key={label} className="border border-white/10 bg-[#0e0e0e] p-5"><p className="text-xs tracking-[0.12em] text-white/45 uppercase">{label}</p><p className="mt-3 text-2xl text-white">{value}</p></div>)}</div></section>
          <section id="orders" className="mt-10"><h2 className="font-cinzel text-xl">Orders</h2><div className="mt-4 overflow-x-auto border border-white/10"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-white/5 text-white/45"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Placed</th></tr></thead><tbody>{overview.orders.length ? overview.orders.map((order) => <tr key={order.id} className="border-t border-white/10"><td className="p-3 text-[#D4AF37]">{order.id}</td><td className="p-3"><p>{order.customerName}</p><p className="text-xs text-white/45">{order.email}</p></td><td className="p-3 text-white/65">{order.itemCount}</td><td className="p-3">Rs. {order.total.toLocaleString()}</td><td className="p-3 text-white/65">{order.paymentStatus}</td><td className="p-3 text-white/45">{new Date(order.createdAt).toLocaleString()}</td></tr>) : <tr><td colSpan={6} className="p-6 text-center text-white/45">No orders yet.</td></tr>}</tbody></table></div></section>
          <section id="products" className="mt-10"><h2 className="font-cinzel text-xl">Products</h2><p className="mt-2 text-sm text-white/55">Product CRUD, media, inventory, and bulk operations are introduced in the next milestone.</p></section>
          <section id="customers" className="mt-10"><h2 className="font-cinzel text-xl">Customers and users</h2><div className="mt-4 overflow-x-auto border border-white/10"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-white/5 text-white/45"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Joined</th></tr></thead><tbody>{overview.customers.map((customer) => <tr key={customer.id} className="border-t border-white/10"><td className="p-3">{customer.full_name ?? "-"}</td><td className="p-3 text-white/65">{customer.email}</td><td className="p-3 text-[#D4AF37]">{customer.role}</td><td className="p-3 text-white/55">{new Date(customer.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></section>
          <section id="activity" className="mt-10"><h2 className="font-cinzel text-xl">Activity logs</h2><div className="mt-4 border border-white/10">{overview.activity.length ? overview.activity.map((event) => <div key={event.id} className="flex items-center justify-between gap-4 border-b border-white/10 p-3 text-sm last:border-0"><span>{event.event}</span><time className="text-white/45">{new Date(event.created_at).toLocaleString()}</time></div>) : <p className="p-5 text-sm text-white/55">No activity recorded yet.</p>}</div></section>
          <section id="settings" className="mt-10"><h2 className="font-cinzel text-xl">Settings</h2><p className="mt-2 text-sm text-white/55">Store settings and role administration are deliberately limited to database-managed roles until the permissions milestone.</p></section>
        </div>
      </div>
    </main>
  );
}
