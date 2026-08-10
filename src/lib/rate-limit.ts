import "server-only";

import { isIP } from "node:net";
import { headers } from "next/headers";
import { db, transaction } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function assertLoginAllowed(email: string) {
  const { rows } = await db().query(
    "select coalesce((select locked_until is null or locked_until <= now() from public.login_attempts where email=$1),true) allowed",
    [email.trim().toLowerCase()],
  );
  return Boolean(rows[0]?.allowed);
}

export async function recordLoginAttempt(email: string, succeeded: boolean) {
  const normalizedEmail = email.trim().toLowerCase();
  const requestHeaders = await headers();
  const forwardedFor =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const sourceIp = forwardedFor && isIP(forwardedFor) ? forwardedFor : null;

  if (succeeded) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await transaction(async (client) => {
      await client.query("delete from public.login_attempts where email=$1", [
        normalizedEmail,
      ]);
      if (user)
        await client.query(
          "insert into public.audit_logs(actor_id,event) values($1,'auth.signed_in')",
          [user.id],
        );
    });
    return;
  }

  await transaction(async (client) => {
    const { rows } = await client.query(
      "insert into public.login_attempts(email,failed_attempts,last_attempt_at,last_ip) values($1,1,now(),$2::inet) on conflict(email) do update set failed_attempts=public.login_attempts.failed_attempts+1,last_attempt_at=now(),last_ip=excluded.last_ip returning failed_attempts",
      [normalizedEmail, sourceIp],
    );
    if (Number(rows[0]?.failed_attempts) >= 5)
      await client.query(
        "update public.login_attempts set locked_until=now()+interval '15 minutes',failed_attempts=0 where email=$1",
        [normalizedEmail],
      );
  });
}
