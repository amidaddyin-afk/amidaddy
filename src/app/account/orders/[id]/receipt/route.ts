import { requireUser } from "@/lib/auth";
import { getCustomerOrder } from "@/lib/orders";

export async function GET(
  _: Request,
  context: RouteContext<"/account/orders/[id]/receipt">,
) {
  const { id } = await context.params;
  const { user } = await requireUser();
  const order = await getCustomerOrder(id, user.id);
  if (!order) return new Response("Not found", { status: 404 });
  const rows = order.lines
    .map(
      (line) =>
        `<tr><td>${escape(line.name)}</td><td>${escape(line.size)}</td><td>${line.qty}</td><td>₹${(line.lineTotalPaise / 100).toLocaleString("en-IN")}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><meta charset="utf-8"><title>Receipt ${escape(order.id)}</title><style>body{font:14px Arial;padding:40px;color:#171717}h1{font-family:Georgia}table{width:100%;border-collapse:collapse;margin:30px 0}td,th{padding:12px;border-bottom:1px solid #ddd;text-align:left}.info{margin:20px 0;padding:12px;background:#f5f5f5}.totals{margin:20px 0;width:100%;max-width:400px}.totals-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd}.totals-row.total{font-weight:bold;font-size:16px;border-bottom:none;margin-top:10px}</style><h1>AMIDADDY</h1><p><strong>Order:</strong> ${escape(order.id)}</p><p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN")} at ${new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p><p><strong>Payment Method:</strong> Razorpay</p><p><strong>Payment Status:</strong> ${order.paymentStatus.replaceAll("_", " ")}</p><div class="info"><p>${escape(order.customerName)}<br>${escape(order.address)}<br>${escape(order.city ?? "")}, ${escape(order.state ?? "")} ${escape(order.postalCode ?? "")}</p></div><table><thead><tr><th>Fragrance</th><th>Size</th><th>Qty</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div class="totals-row"><span>Subtotal:</span><span>₹${(order.subtotalPaise / 100).toLocaleString("en-IN")}</span></div>${order.discountPaise > 0 ? `<div class="totals-row"><span>Discount:</span><span>-₹${(order.discountPaise / 100).toLocaleString("en-IN")}</span></div>` : ""}<div class="totals-row"><span>Shipping:</span><span>${order.shippingPaise > 0 ? `₹${(order.shippingPaise / 100).toLocaleString("en-IN")}` : "Complimentary"}</span></div><div class="totals-row total"><span>Total:</span><span>₹${(order.totalPaise / 100).toLocaleString("en-IN")}</span></div></div><p style="font-size:12px;color:#999;margin-top:30px">*GST included in the above total</p>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="amidaddy-${order.id}.html"`,
      "Cache-Control": "private, no-store",
    },
  });
}
function escape(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character]!,
  );
}
