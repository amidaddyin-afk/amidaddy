"use client";

import { useActionState, useState } from "react";
import {
  Activity,
  BadgePercent,
  Boxes,
  ChartNoAxesCombined,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import type { AdminOverview } from "@/lib/admin-data";
import { formatInr } from "@/lib/money";
import {
  adjustVariantStockAction,
  createCouponAction,
  toggleCouponAction,
  updateStoreSettingsAction,
  updateUserRoleAction,
  type AdminActionState,
} from "@/features/admin/actions";
import {
  cancelAdminOrderAction,
  refundOrderAction,
  updateFulfillmentAction,
} from "@/features/orders/actions";
import CatalogManager from "@/components/CatalogManager";

const initial: AdminActionState = {};
const sections = [
  ["Overview", ChartNoAxesCombined],
  ["Orders", ShoppingBag],
  ["Products", Boxes],
  ["Inventory", Boxes],
  ["Customers", Users],
  ["Coupons", BadgePercent],
  ["Activity", Activity],
  ["Settings", Settings],
] as const;
function Status({ state }: { state: AdminActionState }) {
  return (
    <>
      {state.error && (
        <p className="mt-3 text-sm text-red-300">{state.error}</p>
      )}
      {state.message && (
        <p className="mt-3 text-sm text-emerald-300">{state.message}</p>
      )}
    </>
  );
}
function OrderActions({ order }: { order: AdminOverview["orders"][number] }) {
  const [fulfillment, fulfillmentAction, fulfillmentPending] = useActionState(
    updateFulfillmentAction,
    initial,
  );
  const [refund, refundAction, refundPending] = useActionState(
    refundOrderAction,
    initial,
  );
  const [cancellation, cancelAction, cancelPending] = useActionState(
    cancelAdminOrderAction,
    initial,
  );
  const next =
    order.status === "CONFIRMED"
      ? "PROCESSING"
      : order.status === "PROCESSING"
        ? "SHIPPED"
        : order.status === "SHIPPED"
          ? "DELIVERED"
          : null;
  return (
    <details className="admin-details">
      <summary>Manage</summary>
      {next && (
        <form action={fulfillmentAction} className="admin-form">
          <input type="hidden" name="orderId" value={order.id} />
          <input type="hidden" name="status" value={next} />
          {next === "SHIPPED" && (
            <>
              <input name="courierName" placeholder="Courier" required />
              <input
                name="trackingNumber"
                placeholder="Tracking number"
                required
              />
              <input
                name="trackingUrl"
                type="url"
                placeholder="https://tracking-link"
              />
            </>
          )}
          <button disabled={fulfillmentPending} className="btn-ghost">
            Mark {next.toLowerCase()}
          </button>
          <Status state={fulfillment} />
        </form>
      )}
      {order.paymentId && order.refundedPaise < order.totalPaise && (
        <form action={refundAction} className="admin-form">
          <input type="hidden" name="orderId" value={order.id} />
          <input
            name="amountRupees"
            type="number"
            min="1"
            step=".01"
            max={(order.totalPaise - order.refundedPaise) / 100}
            placeholder="Refund ₹"
            required
          />
          <input name="reason" placeholder="Refund reason" required />
          <button disabled={refundPending} className="btn-ghost">
            Issue refund
          </button>
          <Status state={refund} />
        </form>
      )}
      {["PAYMENT_PENDING", "CONFIRMED"].includes(order.status) && (
        <form action={cancelAction} className="admin-form">
          <input type="hidden" name="orderId" value={order.id} />
          <input name="reason" placeholder="Cancellation reason" required />
          <button disabled={cancelPending} className="btn-ghost">
            Cancel order
          </button>
          <Status state={cancellation} />
        </form>
      )}
    </details>
  );
}
function InventoryForm({ item }: { item: AdminOverview["inventory"][number] }) {
  const [state, action, pending] = useActionState(
    adjustVariantStockAction,
    initial,
  );
  return (
    <form action={action} className="inventory-row">
      <input type="hidden" name="variantId" value={item.id} />
      <div>
        <strong>
          {item.productName} · {item.name}
        </strong>
        <span>
          {item.sku} · {item.stock - item.reserved} available ({item.reserved}{" "}
          reserved)
        </span>
      </div>
      <input name="quantity" type="number" placeholder="± qty" required />
      <input name="reason" placeholder="Reason" required />
      <button disabled={pending} className="btn-ghost">
        Adjust
      </button>
      <Status state={state} />
    </form>
  );
}
export default function AdminPortal({ overview }: { overview: AdminOverview }) {
  const [coupon, couponAction, couponPending] = useActionState(
    createCouponAction,
    initial,
  );
  const [settings, settingsAction, settingsPending] = useActionState(
    updateStoreSettingsAction,
    initial,
  );
  const [orderSearch, setOrderSearch] = useState("");
  const visibleOrders = overview.orders.filter((order) =>
    `${order.id} ${order.email} ${order.customerName}`
      .toLowerCase()
      .includes(orderSearch.toLowerCase()),
  );
  const cards = [
    ["Net revenue", formatInr(overview.metrics.netRevenuePaise)],
    ["Orders", String(overview.metrics.orderCount)],
    ["Average order", formatInr(overview.metrics.averageOrderPaise)],
    ["Low stock", String(overview.metrics.lowStockCount)],
  ];
  return (
    <main className="admin-shell">
      <div>
        <aside>
          <p className="eyebrow px-3 pb-5">Store control</p>
          <nav className="grid gap-1">
            {sections.map(([label, Icon]) => (
              <a key={label} href={`#${label.toLowerCase()}`}>
                <Icon size={15} />
                {label}
              </a>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <section id="overview">
            <p className="eyebrow">Operations</p>
            <h1 className="display-title mt-3 text-5xl">The control room.</h1>
            <div className="admin-cards">
              {cards.map(([label, value]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </article>
              ))}
            </div>
          </section>
          <section id="orders">
            <div className="admin-heading">
              <div>
                <p className="eyebrow">Fulfillment</p>
                <h2>Orders</h2>
              </div>
              <input
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder="Search order, customer or email"
              />
            </div>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Placed</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.id}</strong>
                        <span>
                          {order.lines.reduce((sum, line) => sum + line.qty, 0)}{" "}
                          items
                        </span>
                      </td>
                      <td>
                        {order.customerName}
                        <span>{order.email}</span>
                      </td>
                      <td>
                        <span className="status-pill">
                          {order.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td>{formatInr(order.totalPaise)}</td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td>
                        <OrderActions order={order} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section id="products">
            <p className="eyebrow">Catalog</p>
            <h2>Products</h2>
            <CatalogManager products={overview.products} />
          </section>
          <section id="inventory">
            <p className="eyebrow">Stock ledger</p>
            <h2>Inventory</h2>
            <div className="mt-5 grid gap-3">
              {overview.inventory.map((item) => (
                <InventoryForm key={item.id} item={item} />
              ))}
            </div>
          </section>
          <section id="customers">
            <p className="eyebrow">Relationships</p>
            <h2>Customers & access</h2>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Role</th>
                    <th>Orders</th>
                    <th>Lifetime value</th>
                    <th>Access</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        {customer.fullName ?? "—"}
                        <span>{customer.email}</span>
                      </td>
                      <td>{customer.role}</td>
                      <td>{customer.orderCount}</td>
                      <td>{formatInr(customer.lifetimePaise)}</td>
                      <td>
                        <form action={updateUserRoleAction}>
                          <input
                            type="hidden"
                            name="profileId"
                            value={customer.id}
                          />
                          <input
                            type="hidden"
                            name="role"
                            value={
                              customer.role === "ADMIN" ? "CUSTOMER" : "ADMIN"
                            }
                          />
                          <button className="btn-ghost">
                            Make{" "}
                            {customer.role === "ADMIN" ? "customer" : "admin"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section id="coupons">
            <p className="eyebrow">Offers</p>
            <h2>Coupons</h2>
            <form action={couponAction} className="admin-form admin-coupon">
              <input name="code" placeholder="CODE" required />
              <select name="type">
                <option value="PERCENT">Percent</option>
                <option value="FIXED">Fixed ₹</option>
              </select>
              <input
                name="value"
                type="number"
                min="1"
                placeholder="Value"
                required
              />
              <input
                name="minSubtotalRupees"
                type="number"
                min="0"
                placeholder="Min order ₹"
              />
              <input
                name="maxDiscountRupees"
                type="number"
                min="0"
                placeholder="Max discount ₹"
              />
              <input
                name="usageLimit"
                type="number"
                min="1"
                placeholder="Total uses"
              />
              <input
                name="perCustomerLimit"
                type="number"
                min="1"
                defaultValue="1"
              />
              <button disabled={couponPending} className="lux-button">
                Create coupon
              </button>
              <Status state={coupon} />
            </form>
            <div className="admin-product-grid mt-5">
              {overview.coupons.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>{item.code}</strong>
                    <span>
                      {item.type} · {item.uses} uses ·{" "}
                      {item.active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <form action={toggleCouponAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="btn-ghost">
                      {item.active ? "Pause" : "Activate"}
                    </button>
                  </form>
                </article>
              ))}
            </div>
          </section>
          <section id="activity">
            <p className="eyebrow">Audit trail</p>
            <h2>Activity</h2>
            <div className="activity-list">
              {overview.activity.map((item) => (
                <div key={item.id}>
                  <span>{item.event.replaceAll(".", " · ")}</span>
                  <time>
                    {new Date(item.createdAt).toLocaleString("en-IN")}
                  </time>
                </div>
              ))}
            </div>
          </section>
          <section id="settings">
            <p className="eyebrow">Configuration</p>
            <h2>Store settings</h2>
            <form action={settingsAction} className="admin-form settings-form">
              <label className="field">
                <span>Support email</span>
                <input
                  name="supportEmail"
                  type="email"
                  defaultValue={overview.settings.supportEmail}
                />
              </label>
              <label className="field">
                <span>Support phone</span>
                <input
                  name="supportPhone"
                  defaultValue={overview.settings.supportPhone ?? ""}
                />
              </label>
              <label className="field">
                <span>Shipping fee ₹</span>
                <input
                  name="shippingFeeRupees"
                  type="number"
                  min="0"
                  defaultValue={overview.settings.shippingFeePaise / 100}
                />
              </label>
              <label className="field">
                <span>Free above ₹</span>
                <input
                  name="freeShippingAboveRupees"
                  type="number"
                  min="0"
                  defaultValue={overview.settings.freeShippingAbovePaise / 100}
                />
              </label>
              <label className="field sm:col-span-2">
                <span>Cancellation message</span>
                <input
                  name="cancellationMessage"
                  defaultValue={overview.settings.cancellationMessage}
                />
              </label>
              <button disabled={settingsPending} className="lux-button">
                Save settings
              </button>
              <Status state={settings} />
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
