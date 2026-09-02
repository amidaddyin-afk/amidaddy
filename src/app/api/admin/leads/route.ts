import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { listLeadsForExport } from "@/lib/leads";

export const dynamic = "force-dynamic";

function csvCell(value: string | number | null) {
  if (value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const COLUMNS = [
  "email",
  "fullName",
  "phone",
  "source",
  "stage",
  "marketingOptIn",
  "signedUpAt",
  "firstSeenAt",
  "lastSeenAt",
  "lastCheckoutAt",
  "firstOrderAt",
  "lastOrderAt",
  "orderCount",
  "lifetimePaise",
] as const;

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const leads = await listLeadsForExport();
  const rows = [
    COLUMNS.join(","),
    ...leads.map((lead) =>
      COLUMNS.map((column) =>
        csvCell(
          (lead[column] as string | number | boolean | null) === null
            ? null
            : String(lead[column]),
        ),
      ).join(","),
    ),
  ];
  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="amidaddy-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
