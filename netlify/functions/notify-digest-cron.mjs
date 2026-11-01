// Scheduled: runs every hour; each project is sent once a day at its own hour.
import { runScheduled } from './digest/core.mjs';
export default async () => {
  const results = await runScheduled(new Date());
  console.log('daily digest', JSON.stringify(results));
  return new Response('ok');
};
export const config = { schedule: '@hourly' };
