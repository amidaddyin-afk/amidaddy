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
  const html = `<!doctype html><meta charset="utf-8"><title>Receipt ${escape(order.id)}</title><style>body{font:14px Arial;padding:40px;color:#171717}h1{font-family:Georgia}table{width:100%;border-collapse:collapse;margin:30px 0}td,th{padding:12px;border-bottom:1px solid #ddd;text-align:left}</style><h1>AMIDADDY</h1><p>Order ${escape(order.id)} · ${new Date(order.createdAt).toLocaleDateString("en-IN")}</p><p>${escape(order.customerName)}<br>${escape(order.address)}, ${escape(order.city ?? "")}, ${escape(order.state ?? "")} ${escape(order.postalCode ?? "")}</p><table><thead><tr><th>Fragrance</th><th>Size</th><th>Qty</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><p>Included GST: ₹${(order.taxPaise / 100).toLocaleString("en-IN")}</p><h2>Total: ₹${(order.totalPaise / 100).toLocaleString("en-IN")}</h2>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="amidaddy-${order.id}.html"`,
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
