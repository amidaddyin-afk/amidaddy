import type { ConnectionOptions } from "node:tls";

export function databaseSslConfig(
  nodeEnv: string | undefined,
  encodedCa: string | undefined,
): ConnectionOptions | undefined {
  if (nodeEnv !== "production") return undefined;

  const ca = encodedCa?.replace(/\\n/g, "\n").trim();
  if (ca) return { ca, rejectUnauthorized: true };

  // Supabase's transaction pooler can present a certificate chain that is not
  // available in Vercel's runtime trust store. Keep the connection encrypted;
  // deployments that require full certificate verification can provide the
  // Supabase CA through DATABASE_SSL_CA.
  return { rejectUnauthorized: false };
}
