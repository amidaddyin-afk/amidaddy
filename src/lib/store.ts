import 'server-only';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PRODUCTS, type Product } from './data';

export interface OrderLine {
  productId: string;
  name: string;
  size: '50ml' | '100ml';
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  email: string;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  stripeSessionId?: string;
  createdAt: string;
  lines: OrderLine[];
}

interface StoreData {
  products: Product[];
  orders: Order[];
}

const storePath = path.join(process.cwd(), 'data', 'store.json');
const seed: StoreData = { products: PRODUCTS, orders: [] };

async function loadStore(): Promise<StoreData> {
  try {
    return JSON.parse(await readFile(storePath, 'utf8')) as StoreData;
  } catch {
    await mkdir(path.dirname(storePath), { recursive: true });
    await writeFile(storePath, JSON.stringify(seed, null, 2));
    return structuredClone(seed);
  }
}

async function saveStore(data: StoreData) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(data, null, 2));
}

export async function listProducts(includeInactive = false) {
  const { products } = await loadStore();
  return includeInactive ? products : products.filter((product) => product.active && product.stock > 0);
}

export async function saveProduct(product: Product) {
  const store = await loadStore();
  const index = store.products.findIndex((item) => item.id === product.id);
  if (index === -1) store.products.push(product);
  else store.products[index] = product;
  await saveStore(store);
  return product;
}

export async function getProduct(id: string) {
  const { products } = await loadStore();
  return products.find((product) => product.id === id);
}

export async function createOrder(order: Order) {
  const store = await loadStore();
  store.orders.unshift(order);
  await saveStore(store);
  return order;
}

export async function listOrders() {
  return (await loadStore()).orders;
}

export async function recordStripeSession(orderId: string, stripeSessionId: string) {
  const store = await loadStore();
  const order = store.orders.find((item) => item.id === orderId);
  if (!order) return;
  order.stripeSessionId = stripeSessionId;
  await saveStore(store);
}

export async function markOrderPaid(orderId: string, stripeSessionId?: string) {
  const store = await loadStore();
  const order = store.orders.find((item) => item.id === orderId);
  if (!order || order.paymentStatus === 'paid') return;
  for (const line of order.lines) {
    const product = store.products.find((item) => item.id === line.productId);
    if (product) product.stock = Math.max(0, product.stock - line.qty);
  }
  order.status = 'paid';
  order.paymentStatus = 'paid';
  order.stripeSessionId = stripeSessionId ?? order.stripeSessionId;
  await saveStore(store);
}
