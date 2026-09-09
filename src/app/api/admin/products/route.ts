import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  createCatalogProduct,
  restoreCatalogProduct,
  softDeleteCatalogProduct,
  updateCatalogProduct,
} from "@/lib/catalog";
import { productInputSchema } from "@/features/catalog/schemas";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export const dynamic = "force-dynamic";

async function guard() {
  return (await isAdmin())
    ? null
    : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return NextResponse.json(
    {
      error:
        "Admin product listing will be completed with the catalog management view.",
    },
    { status: 501 },
  );
}

export async function POST(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  const parsed = productInputSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid product." },
      { status: 400 },
    );
  const id = await createCatalogProduct(parsed.data);
  revalidateStorefront();
  return NextResponse.json({ id }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/i.test(id))
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  await softDeleteCatalogProduct(id);
  revalidateStorefront();
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  const body = (await request.json()) as {
    id?: string;
    action?: string;
    product?: unknown;
  };
  if (!body.id || !/^[0-9a-f-]{36}$/i.test(body.id))
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  if (body.action === "restore") {
    await restoreCatalogProduct(body.id);
    revalidateStorefront();
    return NextResponse.json({ ok: true });
  }
  if (body.action === "update") {
    const parsed = productInputSchema.safeParse(body.product);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid product." },
        { status: 400 },
      );
    await updateCatalogProduct(body.id, parsed.data);
    revalidateStorefront();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json(
    { error: "Invalid product update request." },
    { status: 400 },
  );
}
