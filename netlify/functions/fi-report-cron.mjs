// Scheduled: weekly Field Issues report per project (its own day/time).
import { runScheduledReports } from './fireport/core.mjs';
export default async () => { const r = await runScheduledReports(new Date()); console.log('fi weekly report', JSON.stringify(r)); return new Response('ok'); };
export const config = { schedule: '*/15 * * * *' };
