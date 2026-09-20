import { requireUser } from "@/lib/auth";
import { buildDataExport } from "@/lib/privacy";

/** DPDP s.11: the data principal downloads everything we hold about them. */
export async function GET() {
  const { user } = await requireUser();
  if (!user.email) return new Response("No email on account", { status: 400 });
  const payload = await buildDataExport(user.id, user.email);
  return new Response(JSON.stringify(payload, replacer, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="amidaddy-my-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}

// Lead rows carry bigint columns (lifetime_paise), which JSON.stringify throws on.
function replacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? Number(value) : value;
}
