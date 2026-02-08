"use client";

const sampleOrders = [
  { id: "A-1123", status: "pending", total: 3598, customer: "Anita Rao" },
  { id: "A-1124", status: "shipped", total: 1899, customer: "Rahul Mehta" }
];

export default function AdminPage() {
  return (
    <div className="container py-12">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="font-display text-xl">Admin</h2>
          <nav className="mt-6 grid gap-3 text-sm text-black/60">
            <span className="font-semibold text-ink">Dashboard</span>
            <span>Products</span>
            <span>Orders</span>
            <span>Customers</span>
          </nav>
        </aside>
        <div className="space-y-8">
          <section className="rounded-3xl bg-white p-6 shadow-soft">
            <h3 className="font-display text-lg">Add product</h3>
            <form className="mt-4 grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-black/10 px-4 py-3" placeholder="Name" />
              <input className="rounded-xl border border-black/10 px-4 py-3" placeholder="Price (₹)" />
              <input className="rounded-xl border border-black/10 px-4 py-3" placeholder="Category" />
              <input className="rounded-xl border border-black/10 px-4 py-3" placeholder="Stock" />
              <textarea
                className="md:col-span-2 rounded-xl border border-black/10 px-4 py-3"
                placeholder="Description"
                rows="3"
              />
              <input className="md:col-span-2 rounded-xl border border-black/10 px-4 py-3" placeholder="Image URL" />
              <input className="md:col-span-2 rounded-xl border border-black/10 px-4 py-3" placeholder="3D model URL (.glb)" />
              <button className="rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white md:col-span-2">
                Save product
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-soft">
            <h3 className="font-display text-lg">Recent orders</h3>
            <div className="mt-4 grid gap-3">
              {sampleOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand/70 p-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-ink">{order.id}</p>
                    <p className="text-black/50">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ink">₹{order.total}</p>
                    <p className="text-black/50">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
