import "server-only";

import type { PoolClient } from "pg";

export async function appendAuditEvent(
  client: PoolClient,
  actorId: string | null,
  event: string,
  metadata: Record<string, unknown>,
) {
  await client.query(
    "insert into public.audit_logs(actor_id,event,metadata) values($1::uuid,$2::text,$3::jsonb)",
    [actorId, event, JSON.stringify(metadata)],
  );
}
