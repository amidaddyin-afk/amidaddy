import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { listProducts, saveProduct } from '@/lib/store';
import type { Product } from '@/lib/data';

export const dynamic = 'force-dynamic';

async function guard() {
  return (await isAdmin()) ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET() {
  const denied = await guard();
  return denied ?? NextResponse.json(await listProducts(true));
}

export async function POST(request: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  const product = await request.json() as Product;
  if (!product.id || !product.name || !Number.isFinite(product.price) || !Number.isInteger(product.stock)) {
    return NextResponse.json({ error: 'A product needs an id, name, price, and whole-number stock.' }, { status: 400 });
  }
  return NextResponse.json(await saveProduct(product));
}
