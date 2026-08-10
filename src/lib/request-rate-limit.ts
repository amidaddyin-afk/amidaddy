import "server-only";

import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function takeRequestLimit(
  scope: string,
  limit: number,
  windowSeconds: number,
) {
  const requestHeaders = await headers();
  const forwardedFor =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const identity = isIP(forwardedFor) ? forwardedFor : "unknown";
  const identityHash = createHash("sha256")
    .update(`${scope}:${identity}`)
    .digest("hex");
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(now - (now % windowMs));
  const { rows } = await db().query(
    "insert into public.request_rate_limits(scope,identity_hash,window_start,attempts) values($1,$2,$3,1) on conflict(scope,identity_hash,window_start) do update set attempts=public.request_rate_limits.attempts+1 returning attempts",
    [scope, identityHash, windowStart],
  );
  return Number(rows[0]?.attempts ?? limit + 1) <= limit;
}

export async function pruneRequestLimits() {
  const result = await db().query(
    "delete from public.request_rate_limits where window_start < now() - interval '1 day'",
  );
  return result.rowCount ?? 0;
}
