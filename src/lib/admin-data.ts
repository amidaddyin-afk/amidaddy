import "server-only";

import { listProducts } from "@/lib/store";
import { listOrders } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

export type AdminOverview = {
  productCount: number;
  activeProductCount: number;
  orderCount: number;
  paidRevenue: number;
  orders: Array<{ id: string; customerName: string; email: string; total: number; status: string; paymentStatus: string; createdAt: string; itemCount: number }>;
  customerCount: number;
  admins: Array<{ id: string; email: string; full_name: string | null; created_at: string }>;
  customers: Array<{ id: string; email: string; full_name: string | null; role: "CUSTOMER" | "ADMIN"; created_at: string }>;
  activity: Array<{ id: string; event: string; created_at: string; metadata: Record<string, unknown> }>;
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const [products, orders, supabase] = await Promise.all([listProducts(true), listOrders(), createClient()]);
  const [{ data: profiles, error: profilesError }, { data: activity, error: activityError }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, role, created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("audit_logs").select("id, event, created_at, metadata").order("created_at", { ascending: false }).limit(50),
  ]);
  if (profilesError || activityError) throw new Error("Unable to load the admin overview.");
  const customers = (profiles ?? []) as AdminOverview["customers"];
  return {
    productCount: products.length,
    activeProductCount: products.filter((product) => product.active).length,
    orderCount: orders.length,
    paidRevenue: orders.filter((order) => order.paymentStatus === "paid").reduce((total, order) => total + order.total, 0),
    orders: orders.map((order) => ({ id: order.id, customerName: order.customerName, email: order.email, total: order.total, status: order.status, paymentStatus: order.paymentStatus, createdAt: order.createdAt, itemCount: order.lines.reduce((total, line) => total + line.qty, 0) })),
    customerCount: customers.filter((profile) => profile.role === "CUSTOMER").length,
    admins: customers.filter((profile) => profile.role === "ADMIN"),
    customers,
    activity: (activity ?? []) as AdminOverview["activity"],
  };
}
