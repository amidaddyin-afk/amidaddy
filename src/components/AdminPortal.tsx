"use client";

import { useActionState, useState, type ReactNode } from "react";
import {
  Activity,
  BadgePercent,
  Boxes,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  MapPin,
  MessageSquareQuote,
  Package,
  Phone,
  Settings,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import type { AdminOverview } from "@/lib/admin-data";
import { formatInr } from "@/lib/money";
import {
  adjustVariantStockAction,
  createCouponAction,
  moderateReviewAction,
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
import IndiaTrafficMap from "@/components/IndiaTrafficMap";

const initial: AdminActionState = {};
const sections = [
  ["Overview", ChartNoAxesCombined],
  ["Orders", ShoppingBag],
  ["Products", Boxes],
  ["Inventory", Boxes],
  ["Customers", Users],
  ["Traffic", MapPin],
  ["Leads", TrendingUp],
  ["Reviews", MessageSquareQuote],
  ["Coupons", BadgePercent],
  ["Activity", Activity],
  ["Settings", Settings],
] as const;
function Status({ state }: { state: AdminActionState }) {
  return (
    <>
      {state.error && (
        <p className="admin-status-error mt-3 text-sm">{state.error}</p>
      )}
      {state.message && (
        <p className="admin-status-ok mt-3 text-sm">{state.message}</p>
      )}
    </>
  );
}
/** A portal section that folds away. Open by default; the native <details>
 *  keeps it keyboard- and screen-reader-friendly with no extra state. */
function AdminSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id}>
      <details open className="admin-section">
        <summary>
          <span>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </span>
          <ChevronDown size={20} aria-hidden="true" className="admin-chevron" />
        </summary>
        <div className="admin-section-body">{children}</div>
      </details>
    </section>
  );
}

const PAGE_SIZES = [10, 20, 30] as const;

type Pager = {
  page: number;
  pages: number;
  size: number;
  total: number;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
};

/** Client-side paging over a list already in memory. The page is clamped
 *  rather than trusted, so a narrowing search never lands on an empty page. */
function usePaged<T>(items: T[]): { rows: T[]; pager: Pager } {
  const [size, setSizeState] = useState<number>(PAGE_SIZES[0]);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(page, pages - 1);
  return {
    rows: items.slice(current * size, current * size + size),
    pager: {
      page: current,
      pages,
      size,
      total: items.length,
      setPage,
      setSize: (next) => {
        setSizeState(next);
        setPage(0);
      },
    },
  };
}

function Pagination({ pager, label }: { pager: Pager; label: string }) {
  if (pager.total <= PAGE_SIZES[0]) return null;
  const from = pager.page * pager.size + 1;
  const to = Math.min(pager.total, from + pager.size - 1);
  return (
    <nav className="admin-pager" aria-label={`${label} pages`}>
      <div
        className="admin-pager-sizes"
        role="group"
        aria-label="Rows per page"
      >
        <span>Show</span>
        {PAGE_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            aria-pressed={pager.size === size}
            onClick={() => pager.setSize(size)}
          >
            {size}
          </button>
        ))}
      </div>
      <span className="admin-pager-range">
        {from}–{to} of {pager.total}
      </span>
      <div className="admin-pager-steps">
        <button
          type="button"
          onClick={() => pager.setPage(pager.page - 1)}
          disabled={pager.page === 0}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span>
          Page {pager.page + 1} of {pager.pages}
        </span>
        <button
          type="button"
          onClick={() => pager.setPage(pager.page + 1)}
          disabled={pager.page >= pager.pages - 1}
          aria-label="Next page"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

/** Open or fold every section at once. */
function setAllSections(open: boolean) {
  document
    .querySelectorAll<HTMLDetailsElement>(".admin-section")
    .forEach((details) => (details.open = open));
}
/** The sidebar opens the section it jumps to, so a link never lands on a
 *  folded heading. */
function openSection(id: string) {
  const details = document.querySelector<HTMLDetailsElement>(
    `#${id} > .admin-section`,
  );
  if (details) details.open = true;
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

function OrderCard({ order }: { order: AdminOverview["orders"][number] }) {
  const locality = [order.city, order.state, order.postalCode]
    .filter(Boolean)
    .join(", ");
  const itemCount = order.lines.reduce((sum, line) => sum + line.qty, 0);

  return (
    <article className="admin-order-card">
      <header>
        <div>
          <span className="admin-order-label">Order</span>
          <strong>{order.id}</strong>
          <time dateTime={order.createdAt}>
            {new Date(order.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </time>
        </div>
        <div className="admin-order-summary">
          <span className="status-pill">
            {order.status.replaceAll("_", " ")}
          </span>
          <strong>{formatInr(order.totalPaise)}</strong>
          <span>{order.paymentStatus.replaceAll("_", " ")}</span>
        </div>
      </header>

      <div className="admin-order-body">
        <section className="admin-order-contact" aria-label="Customer details">
          <span className="admin-order-label">Customer & delivery</span>
          <strong>{order.customerName}</strong>
          <a href={`mailto:${order.email}`}>
            <Mail size={14} aria-hidden="true" /> {order.email}
          </a>
          <a href={`tel:${order.phone}`}>
            <Phone size={14} aria-hidden="true" /> {order.phone}
          </a>
          <address>
            <MapPin size={15} aria-hidden="true" />
            <span>
              {order.address}
              {locality && (
                <>
                  ,<br />
                  {locality}
                </>
              )}
              {order.country && (
                <>
                  ,<br />
                  {order.country}
                </>
              )}
            </span>
          </address>
        </section>

        <section className="admin-order-items" aria-label="Order items">
          <span className="admin-order-label">
            <Package size={14} aria-hidden="true" /> {itemCount} item
            {itemCount === 1 ? "" : "s"}
          </span>
          <div>
            {order.lines.map((line) => (
              <p key={line.id}>
                <span>
                  {line.qty} × {line.name} · {line.size}
                </span>
                <strong>{formatInr(line.lineTotalPaise)}</strong>
              </p>
            ))}
          </div>
        </section>
      </div>

      <footer>
        <div className="admin-order-meta">
          {order.couponCode && <span>Coupon: {order.couponCode}</span>}
          {order.courierName && <span>Courier: {order.courierName}</span>}
          {order.trackingNumber && (
            <span>Tracking: {order.trackingNumber}</span>
          )}
        </div>
        <OrderActions order={order} />
      </footer>
    </article>
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
    `${order.id} ${order.email} ${order.customerName} ${order.phone} ${order.address} ${order.city ?? ""} ${order.state ?? ""} ${order.postalCode ?? ""}`
      .toLowerCase()
      .includes(orderSearch.toLowerCase()),
  );
  const cards = [
    ["Net revenue", formatInr(overview.metrics.netRevenuePaise)],
    ["Orders", String(overview.metrics.orderCount)],
    ["Average order", formatInr(overview.metrics.averageOrderPaise)],
    ["Low stock", String(overview.metrics.lowStockCount)],
    ["Potential customers", String(overview.metrics.potentialCustomers)],
  ];
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStageFilter, setLeadStageFilter] = useState("");
  const visibleLeads = overview.leads.filter((lead) => {
    if (leadStageFilter && lead.stage !== leadStageFilter) return false;
    if (!leadSearch) return true;
    return `${lead.email} ${lead.fullName ?? ""}`
      .toLowerCase()
      .includes(leadSearch.toLowerCase());
  });
  const leadStages = [
    "SUBSCRIBER",
    "SIGNED_UP",
    "CHECKOUT_STARTED",
    "ABANDONED",
    "CUSTOMER",
    "REPEAT_CUSTOMER",
  ] as const;
  const leadStageLabels: Record<(typeof leadStages)[number], string> = {
    SUBSCRIBER: "Subscriber",
    SIGNED_UP: "Signed up",
    CHECKOUT_STARTED: "Checkout started",
    ABANDONED: "Abandoned checkout",
    CUSTOMER: "Customer",
    REPEAT_CUSTOMER: "Repeat customer",
  };
  const orderPages = usePaged(visibleOrders);
  const inventoryPages = usePaged(overview.inventory);
  const customerPages = usePaged(overview.customers);
  const leadPages = usePaged(visibleLeads);
  const reviewPages = usePaged(overview.reviews);
  const couponPages = usePaged(overview.coupons);
  const activityPages = usePaged(overview.activity);
  const funnelCards: Array<[string, number]> = [
    ["Subscribers", overview.leadFunnel.subscribers],
    ["Signed up", overview.leadFunnel.signedUp],
    ["Started checkout", overview.leadFunnel.checkoutStarted],
    ["Abandoned", overview.leadFunnel.abandoned],
    ["Customers", overview.leadFunnel.customers],
    ["Repeat customers", overview.leadFunnel.repeatCustomers],
  ];
  return (
    <main data-surface="commerce" className="admin-shell">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="eyebrow px-3 pb-5">Store control</p>
          <nav className="grid gap-1">
            {sections.map(([label, Icon]) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                onClick={() => openSection(label.toLowerCase())}
              >
                <Icon size={15} />
                {label}
              </a>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <div className="admin-intro">
            <div>
              <p className="eyebrow">Operations</p>
              <h1 className="display-title admin-title mt-3">
                The control room.
              </h1>
            </div>
            <div className="admin-intro-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setAllSections(true)}
              >
                Expand all
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setAllSections(false)}
              >
                Collapse all
              </button>
            </div>
          </div>
          <AdminSection id="overview" eyebrow="At a glance" title="Overview">
            <div className="admin-cards">
              {cards.map(([label, value]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </article>
              ))}
            </div>
          </AdminSection>
          <AdminSection id="orders" eyebrow="Fulfillment" title="Orders">
            <div className="admin-heading">
              <input
                value={orderSearch}
                onChange={(event) => {
                  setOrderSearch(event.target.value);
                  orderPages.pager.setPage(0);
                }}
                placeholder="Search order, customer, phone or address"
                aria-label="Search orders"
              />
            </div>
            <div className="admin-orders-list">
              {orderPages.rows.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {visibleOrders.length === 0 && (
                <p className="admin-empty">No matching orders found.</p>
              )}
            </div>
            <Pagination pager={orderPages.pager} label="Orders" />
          </AdminSection>
          <AdminSection id="products" eyebrow="Catalog" title="Products">
            <CatalogManager products={overview.products} />
          </AdminSection>
          <AdminSection id="inventory" eyebrow="Stock ledger" title="Inventory">
            <div className="mt-5 grid gap-3">
              {inventoryPages.rows.map((item) => (
                <InventoryForm key={item.id} item={item} />
              ))}
            </div>
            <Pagination pager={inventoryPages.pager} label="Inventory" />
          </AdminSection>
          <AdminSection
            id="customers"
            eyebrow="Relationships"
            title="Customers & access"
          >
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
                  {customerPages.rows.map((customer) => (
                    <tr key={customer.id}>
                      <td data-label="Customer">
                        {customer.fullName ?? "—"}
                        <span>{customer.email}</span>
                      </td>
                      <td data-label="Role">{customer.role}</td>
                      <td data-label="Orders">{customer.orderCount}</td>
                      <td data-label="Lifetime value">
                        {formatInr(customer.lifetimePaise)}
                      </td>
                      <td data-label="Access">
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
            <Pagination pager={customerPages.pager} label="Customers" />
          </AdminSection>
          <AdminSection
            id="traffic"
            eyebrow="Audience"
            title="Where the traffic is"
          >
            <div className="admin-heading">
              <div>
                <p className="text-subtle max-w-prose text-sm">
                  First-party page views over the last 30 days, by state, and
                  the share of shoppers who added to cart but did not buy. GA4
                  holds the full report; this is the at-a-glance version.
                </p>
              </div>
            </div>
            <div className="admin-cards">
              <article>
                <span>Added to cart, didn&rsquo;t buy (30d)</span>
                <strong>
                  {overview.traffic.abandonment.abandonedSessions.toLocaleString(
                    "en-IN",
                  )}
                </strong>
              </article>
              <article>
                <span>Cart abandonment rate</span>
                <strong>
                  {Math.round(
                    overview.traffic.abandonment.abandonmentRate * 100,
                  )}
                  %
                </strong>
              </article>
              <article>
                <span>Sessions with a cart add</span>
                <strong>
                  {overview.traffic.abandonment.cartSessions.toLocaleString(
                    "en-IN",
                  )}
                </strong>
              </article>
              <article>
                <span>Of those, purchased</span>
                <strong>
                  {overview.traffic.abandonment.purchasedSessions.toLocaleString(
                    "en-IN",
                  )}
                </strong>
              </article>
            </div>
            <IndiaTrafficMap data={overview.traffic.byRegion} />
          </AdminSection>
          <AdminSection id="leads" eyebrow="Funnel" title="Potential customers">
            <div className="admin-heading">
              <a
                href="/api/admin/leads"
                className="btn-ghost inline-flex items-center gap-2"
              >
                <Download size={15} />
                Export CSV
              </a>
            </div>
            <div className="admin-cards">
              {funnelCards.map(([label, value]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </article>
              ))}
            </div>
            <div className="admin-heading mt-6">
              <input
                value={leadSearch}
                onChange={(event) => {
                  setLeadSearch(event.target.value);
                  leadPages.pager.setPage(0);
                }}
                placeholder="Search email or name"
                aria-label="Search leads"
              />
              <select
                value={leadStageFilter}
                onChange={(event) => {
                  setLeadStageFilter(event.target.value);
                  leadPages.pager.setPage(0);
                }}
                aria-label="Filter by stage"
              >
                <option value="">All stages</option>
                {leadStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {leadStageLabels[stage]}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Stage</th>
                    <th>Signed up</th>
                    <th>Last activity</th>
                    <th>Orders</th>
                    <th>Lifetime value</th>
                  </tr>
                </thead>
                <tbody>
                  {leadPages.rows.map((lead) => (
                    <tr key={lead.email}>
                      <td data-label="Lead">
                        {lead.fullName ?? "—"}
                        <span>{lead.email}</span>
                      </td>
                      <td data-label="Stage">{leadStageLabels[lead.stage]}</td>
                      <td data-label="Signed up">
                        {lead.signedUpAt
                          ? new Date(lead.signedUpAt).toLocaleDateString(
                              "en-IN",
                            )
                          : "—"}
                      </td>
                      <td data-label="Last activity">
                        {new Date(lead.lastSeenAt).toLocaleDateString("en-IN")}
                      </td>
                      <td data-label="Orders">{lead.orderCount}</td>
                      <td data-label="Lifetime value">
                        {formatInr(lead.lifetimePaise)}
                      </td>
                    </tr>
                  ))}
                  {visibleLeads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="admin-empty">
                        No matching leads found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination pager={leadPages.pager} label="Leads" />
          </AdminSection>
          <AdminSection id="reviews" eyebrow="Moderation" title="Reviews">
            <p className="admin-note">
              Reviews go live as soon as they are posted. Hide spam to take it
              off the storefront; highlight a review to pin it to the top of its
              product&rsquo;s panel. A customer editing a highlighted review
              removes the highlight until you approve it again.
            </p>
            {overview.reviews.length === 0 && (
              <p className="admin-empty">No reviews yet.</p>
            )}
            <div className="admin-review-list mt-5">
              {reviewPages.rows.map((review) => (
                <article
                  key={review.id}
                  data-hidden={review.status === "HIDDEN" || undefined}
                >
                  <header>
                    <span
                      className="admin-review-stars"
                      aria-label={`${review.rating} out of 5`}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={13}
                          aria-hidden="true"
                          data-filled={value <= review.rating || undefined}
                        />
                      ))}
                    </span>
                    <a href={`/products/${review.productSlug}#reviews`}>
                      {review.productName}
                    </a>
                    {review.featured && <em>Highlighted</em>}
                    {review.status === "HIDDEN" && <em>Hidden</em>}
                    {review.verifiedPurchase && <em>Verified buyer</em>}
                  </header>
                  {review.title && <strong>{review.title}</strong>}
                  <p>{review.body}</p>
                  <footer>
                    <span>
                      {review.authorName}
                      {review.customerEmail &&
                        ` · ${review.customerEmail}`} ·{" "}
                      {new Date(review.createdAt).toLocaleDateString("en-IN")}
                    </span>
                    <div>
                      {review.status === "PUBLISHED" && (
                        <form action={moderateReviewAction}>
                          <input type="hidden" name="id" value={review.id} />
                          <input
                            type="hidden"
                            name="op"
                            value={review.featured ? "unfeature" : "feature"}
                          />
                          <button className="btn-ghost">
                            {review.featured ? "Remove highlight" : "Highlight"}
                          </button>
                        </form>
                      )}
                      <form action={moderateReviewAction}>
                        <input type="hidden" name="id" value={review.id} />
                        <input
                          type="hidden"
                          name="op"
                          value={
                            review.status === "HIDDEN" ? "publish" : "hide"
                          }
                        />
                        <button className="btn-ghost">
                          {review.status === "HIDDEN" ? "Restore" : "Take down"}
                        </button>
                      </form>
                    </div>
                  </footer>
                </article>
              ))}
            </div>
            <Pagination pager={reviewPages.pager} label="Reviews" />
          </AdminSection>
          <AdminSection id="coupons" eyebrow="Offers" title="Coupons">
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
              <label className="admin-check">
                <input type="checkbox" name="appliesToCombos" />
                Special: also works on 100ml combo offers
              </label>
              <button disabled={couponPending} className="lux-button">
                Create coupon
              </button>
              <Status state={coupon} />
            </form>
            <div className="admin-product-grid mt-5">
              {couponPages.rows.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>{item.code}</strong>
                    <span>
                      {item.type} · {item.uses} uses ·{" "}
                      {item.active ? "Active" : "Paused"}
                      {item.appliesToCombos && " · Works on combos"}
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
            <Pagination pager={couponPages.pager} label="Coupons" />
          </AdminSection>
          <AdminSection id="activity" eyebrow="Audit trail" title="Activity">
            <div className="activity-list">
              {activityPages.rows.map((item) => (
                <div key={item.id}>
                  <span>{item.event.replaceAll(".", " · ")}</span>
                  <time>
                    {new Date(item.createdAt).toLocaleString("en-IN")}
                  </time>
                </div>
              ))}
            </div>
            <Pagination pager={activityPages.pager} label="Activity" />
          </AdminSection>
          <AdminSection
            id="settings"
            eyebrow="Configuration"
            title="Store settings"
          >
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
          </AdminSection>
        </div>
      </div>
    </main>
  );
}
