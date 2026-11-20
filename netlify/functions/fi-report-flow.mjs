// For Power Automate: returns the weekly reports that are due now, ready to e-mail.
// The flow sends header  x-flow-key: <FI_FLOW_KEY from Netlify>.
import { collectDueReports } from './fireport/core.mjs';
import { timingSafeEqual } from 'node:crypto';
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
export default async request => {
  const expected = process.env.FI_FLOW_KEY || '';
  const given = request.headers.get('x-flow-key') || '';
  if (expected.length < 20 || given.length !== expected.length || !timingSafeEqual(Buffer.from(given), Buffer.from(expected))) return json(401, { error: 'Not allowed' });
  try {
    const due = await collectDueReports(new Date());
    return json(200, { count: due.length, reports: due.map(d => ({ projectId: d.projectId, to: d.to.join(';'), subject: d.report.subject, html: d.report.html, filename: d.report.filename, pdf: d.report.pdf })) });
  } catch (e) { return json(500, { error: e.message }); }
};
