import type { VercelConfig } from "@vercel/config/v1";

// Runs order-expiry, rate-limit pruning, and the lead-nurture email
// campaigns (see src/lib/campaigns.ts) once a day. The route itself checks
// the Authorization: Bearer CRON_SECRET header, which Vercel Cron sends
// automatically — set CRON_SECRET in the project's environment variables
// before this can run successfully.
//
// Once daily, not every 15 minutes: this project is on Vercel's Hobby plan,
// which only allows daily cron schedules. Upgrading to Pro would unlock a
// tighter schedule if the 48h/3h nurture windows ever need to be closer to
// real time.
export const config: VercelConfig = {
  crons: [{ path: "/api/maintenance", schedule: "0 3 * * *" }],
};
