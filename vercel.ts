import type { VercelConfig } from "@vercel/config/v1";

// Runs order-expiry, rate-limit pruning, and the lead-nurture email
// campaigns (see src/lib/campaigns.ts) on a schedule. The route itself
// checks the Authorization: Bearer CRON_SECRET header, which Vercel Cron
// sends automatically — set CRON_SECRET in the project's environment
// variables before this can run successfully.
export const config: VercelConfig = {
  crons: [{ path: "/api/maintenance", schedule: "*/15 * * * *" }],
};
