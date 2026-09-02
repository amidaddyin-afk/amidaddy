import "server-only";
import { db } from "@/lib/db";
import { listAdminProducts } from "@/lib/catalog";
import { listOrders, type OrderRecord } from "@/lib/orders";
import type { Product } from "@/lib/data";
import { DEFAULT_THEME, SITE_THEMES, type SiteTheme } from "@/lib/theme-config";

export type AdminOverview = {
  orders: OrderRecord[];
  products: Product[];
  customers: Array<{
    id: string;
    email: string;
    fullName: string | null;
    role: "CUSTOMER" | "ADMIN";
    createdAt: string;
    orderCount: number;
    lifetimePaise: number;
  }>;
  activity: Array<{
    id: string;
    event: string;
    createdAt: string;
    metadata: Record<string, unknown>;
  }>;
  coupons: Array<{
    id: string;
    code: string;
    type: string;
    value: number;
    active: boolean;
    uses: number;
    endsAt: string | null;
  }>;
  settings: {
    supportEmail: string;
    supportPhone: string | null;
    shippingFeePaise: number;
    freeShippingAbovePaise: number;
    cancellationMessage: string;
    theme: SiteTheme;
  };
  inventory: Array<{
    id: string;
    productName: string;
    name: string;
    sku: string;
    stock: number;
    reserved: number;
    lowStockAt: number;
  }>;
  metrics: {
    netRevenuePaise: number;
    refundsPaise: number;
    orderCount: number;
    averageOrderPaise: number;
    customerCount: number;
    lowStockCount: number;
  };
};
export async function getAdminOverview(): Promise<AdminOverview> {
  const [
    orders,
    products,
    profiles,
    activity,
    coupons,
    settings,
    inventory,
    refunds,
  ] = await Promise.all([
    listOrders().catch(() => []),
    listAdminProducts().catch(() => []),
    db()
      .query(
        "select p.id,p.email,p.full_name,p.role,p.created_at,count(o.id)::int order_count,coalesce(sum(o.total_paise) filter(where o.payment_status in('PAID','PARTIALLY_REFUNDED','REFUNDED')),0)::bigint lifetime_paise from public.profiles p left join public.orders o on o.customer_id=p.id group by p.id order by p.created_at desc limit 250",
      )
      .catch(() => ({ rows: [] })),
    db()
      .query(
        "select id,event,metadata,created_at from public.audit_logs order by created_at desc limit 100",
      )
      .catch(() => ({ rows: [] })),
    db()
      .query(
        "select c.*,count(cr.id)::int uses from public.coupons c left join public.coupon_redemptions cr on cr.coupon_id=c.id group by c.id order by c.created_at desc",
      )
      .catch(() => ({ rows: [] })),
    db()
      .query("select * from public.store_settings where id=1")
      .catch(() => ({ rows: [] })),
    db()
      .query(
        "select pv.id,p.name product_name,pv.name,pv.sku,pv.stock,pv.reserved,pv.low_stock_at from public.product_variants pv join public.products p on p.id=pv.product_id order by p.name,pv.name",
      )
      .catch(() => ({ rows: [] })),
    db()
      .query(
        "select coalesce(sum(amount_paise) filter(where status='PROCESSED'),0) total from public.refunds",
      )
      .catch(() => ({ rows: [{ total: 0 }] })),
  ]);
  const refundsPaise = Number(refunds.rows[0]?.total ?? 0);
  const paid = orders.filter((order) =>
    ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"].includes(order.paymentStatus),
  );
  const gross = paid.reduce((sum, order) => sum + order.totalPaise, 0);
  const setting = settings.rows[0] ?? {};
  const inventoryRows = inventory.rows.map((row) => ({
    id: String(row.id),
    productName: String(row.product_name),
    name: String(row.name),
    sku: String(row.sku),
    stock: Number(row.stock),
    reserved: Number(row.reserved),
    lowStockAt: Number(row.low_stock_at),
  }));
  return {
    orders,
    products,
    customers: profiles.rows.map((row) => ({
      id: String(row.id),
      email: String(row.email),
      fullName: row.full_name ? String(row.full_name) : null,
      role: row.role,
      createdAt: new Date(row.created_at).toISOString(),
      orderCount: Number(row.order_count),
      lifetimePaise: Number(row.lifetime_paise),
    })),
    activity: activity.rows.map((row) => ({
      id: String(row.id),
      event: String(row.event),
      createdAt: new Date(row.created_at).toISOString(),
      metadata: row.metadata ?? {},
    })),
    coupons: coupons.rows.map((row) => ({
      id: String(row.id),
      code: String(row.code),
      type: String(row.type),
      value: Number(row.value),
      active: Boolean(row.active),
      uses: Number(row.uses),
      endsAt: row.ends_at ? new Date(row.ends_at).toISOString() : null,
    })),
    settings: {
      supportEmail: String(setting.support_email ?? "support@amidaddy.in"),
      supportPhone: setting.support_phone
        ? String(setting.support_phone)
        : null,
      shippingFeePaise: Number(setting.shipping_fee_paise ?? 9900),
      freeShippingAbovePaise: Number(
        setting.free_shipping_above_paise ?? 59900,
      ),
      cancellationMessage: String(
        setting.cancellation_message ??
          "Orders can be cancelled before processing begins.",
      ),
      theme: (SITE_THEMES as readonly string[]).includes(String(setting.theme))
        ? (String(setting.theme) as SiteTheme)
        : DEFAULT_THEME,
    },
    inventory: inventoryRows,
    metrics: {
      netRevenuePaise: gross - refundsPaise,
      refundsPaise,
      orderCount: orders.length,
      averageOrderPaise: paid.length ? Math.round(gross / paid.length) : 0,
      customerCount: profiles.rows.filter((row) => row.role === "CUSTOMER")
        .length,
      lowStockCount: inventoryRows.filter(
        (item) => item.stock - item.reserved <= item.lowStockAt,
      ).length,
    },
  };
}
