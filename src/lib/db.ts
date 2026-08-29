import "server-only";

import { Pool, type PoolClient } from "pg";

const globalForDb = globalThis as unknown as { amidaddyPool?: Pool };

export function db() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  globalForDb.amidaddyPool ??= new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: true }
        : undefined,
    max: 8,
    idleTimeoutMillis: 20_000,
  });
  return globalForDb.amidaddyPool;
}

export async function transaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await db().connect();
  try {
    await client.query("begin");
    const result = await work(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
