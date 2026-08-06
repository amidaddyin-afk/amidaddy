import { NextRequest, NextResponse } from "next/server";
import { productListQuerySchema } from "@/features/catalog/schemas";
import { listCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const parsed = productListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid product query." },
      { status: 400 },
    );
  return NextResponse.json(await listCatalogProducts(parsed.data));
}
