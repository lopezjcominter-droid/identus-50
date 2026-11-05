// Scheduled every minute: processes queued AI Knowledge Base pages a few at a
// time (one page per OpenAI call), so large uploads never hit a time limit.
import { runQueue } from './ai/core.mjs';
export default async () => {
  try {
    const result = await runQueue(22000);
    console.log('ai-process', JSON.stringify(result).slice(0, 2000));
  } catch (error) {
    console.error('ai-process stopped', error.message);
  }
  return new Response('ok');
};
export const config = { schedule: '* * * * *' };
