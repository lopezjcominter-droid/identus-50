// Identus 50 · AI takeoff (symbol count) for one drawing page.
// The browser calls this once per quarter of the sheet (part 1-4), in
// parallel, so every call stays well inside the Netlify time limit, then adds
// the counts. POST { projectId, documentId, page, part, request } as the user.
// POST { projectId, save: true, conversationId?, question, answer, citations }
// stores the finished takeoff in the chat history.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kihsukzcbohmxovbyisi.supabase.co';
import { AI_KEY, AI_BASE, AI_KEY_NAME, IS_GEMINI, DEFAULT_CHAT_MODEL, adaptPayload } from './ai/provider.mjs';
const OPENAI_KEY = AI_KEY;
const MODEL = (IS_GEMINI ? '' : process.env.OPENAI_TAKEOFF_MODEL || process.env.OPENAI_MODEL) || DEFAULT_CHAT_MODEL;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
async function sb(path, auth, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers: { apikey: auth.apikey, Authorization: auth.bearer, 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const text = await response.text(); let body = null; try { body = text ? JSON.parse(text) : null; } catch (_) { body = text; }
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${body?.message || text}`);
  return body;
}
async function image(path, auth) {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/ai-docs/${path.split('/').map(encodeURIComponent).join('/')}`, { headers: { apikey: auth.apikey, Authorization: auth.bearer } });
  if (!r.ok) throw new Error(`Page image not available (${r.status}). Use Re-read on this sheet.`);
  return `data:image/jpeg;base64,${Buffer.from(await r.arrayBuffer()).toString('base64')}`;
}
const PART_NAME = { 1: 'top-left', 2: 'top-right', 3: 'bottom-left', 4: 'bottom-right' };
const SYSTEM = `You count symbols on electrical/fire-alarm/low-voltage construction drawings for a takeoff.
You get the WHOLE SHEET (for the legend, room names and where the requested area is) and ONE QUARTER of it in high detail.
Count ONLY the symbols drawn inside the QUARTER image, and only inside the area the user asks for (e.g. "Hallway 2", "Corridor 2", a unit or room). If the user names no area, count the whole quarter.
Use the sheet legend/symbol list to name each symbol type. Count each symbol once. Do not count legend, schedule, detail or key-plan symbols.
Reply ONLY with JSON: {"area_in_quarter": true|false, "items":[{"symbol":"legend name or short description","tag":"fixture tag if shown, e.g. F1","count":0}], "notes":"one short line"}.
If the requested area is not inside this quarter: {"area_in_quarter": false, "items": [], "notes": ""}. Never guess counts you cannot see.`;

export default async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'POST only' });
  if (!OPENAI_KEY) return json(503, { error: 'The AI assistant is not configured (' + AI_KEY_NAME + ').' });
  const bearer = request.headers.get('authorization') || ''; const apikey = request.headers.get('apikey') || '';
  if (!/^Bearer\s+\S+/.test(bearer) || !apikey) return json(401, { error: 'Sign in again.' });
  const auth = { bearer, apikey };
  let input; try { input = await request.json(); } catch (_) { return json(400, { error: 'Invalid request' }); }
  const projectId = String(input.projectId || '');
  if (!/^[0-9a-f-]{36}$/i.test(projectId)) return json(400, { error: 'Missing project' });
  try {
    const user = await sb('/auth/v1/user', auth);
    if (!user?.id) return json(401, { error: 'Sign in again.' });
    const member = await sb(`/rest/v1/project_members?project_id=eq.${projectId}&user_id=eq.${user.id}&select=role`, auth).catch(() => []);
    if (!['admin', 'pm', 'inspector', 'qa inspector', 'inspection'].includes(String(member?.[0]?.role || '').toLowerCase())) return json(403, { error: 'Admin, PM and Inspector only.' });

    if (input.save) {
      const question = String(input.question || '').slice(0, 2000); const answer = String(input.answer || '').slice(0, 6000);
      let conversationId = /^[0-9a-f-]{36}$/i.test(String(input.conversationId || '')) ? input.conversationId : null;
      if (!conversationId) { const c = await sb('/rest/v1/ai_conversations', auth, { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ project_id: projectId, user_id: user.id, title: question.slice(0, 80), context: {} }) }); conversationId = c?.[0]?.id; }
      if (conversationId) {
        await sb('/rest/v1/ai_messages', auth, { method: 'POST', body: JSON.stringify([{ conversation_id: conversationId, project_id: projectId, role: 'user', content: question }, { conversation_id: conversationId, project_id: projectId, role: 'assistant', content: answer, citations: Array.isArray(input.citations) ? input.citations.slice(0, 4) : [] }]) }).catch(() => {});
        await sb(`/rest/v1/ai_conversations?id=eq.${conversationId}`, auth, { method: 'PATCH', body: JSON.stringify({ updated_at: new Date().toISOString() }) }).catch(() => {});
      }
      return json(200, { conversationId });
    }

    const documentId = String(input.documentId || ''); const pageNumber = Math.max(1, Number(input.page) || 1); const part = Number(input.part);
    if (!/^[0-9a-f-]{36}$/i.test(documentId) || !PART_NAME[part]) return json(400, { error: 'Missing drawing or part' });
    const rows = await sb(`/rest/v1/ai_document_pages?document_id=eq.${documentId}&page_number=eq.${pageNumber}&select=extracted`, auth);
    const paths = rows?.[0]?.extracted?.images;
    if (!Array.isArray(paths) || paths.length < 5) return json(409, { error: 'This sheet has no page images yet. Use Re-read on it in the Knowledge Base.' });
    const [whole, quarter] = await Promise.all([image(paths[0], auth), image(paths[part], auth)]);
    const response = await fetch(`${AI_BASE}/chat/completions`, { method: 'POST', signal: AbortSignal.timeout(24000), headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(adaptPayload('chat/completions', {
      model: MODEL, temperature: 0, seed: 50, max_tokens: 700, response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: [
        { type: 'text', text: `Takeoff request: ${String(input.request || '').slice(0, 500)}\nFirst image: whole sheet. Second image: the ${PART_NAME[part]} quarter — count only here.` },
        { type: 'image_url', image_url: { url: whole, detail: 'low' } },
        { type: 'image_url', image_url: { url: quarter, detail: 'high' } }
      ] }]
    })) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`OpenAI ${response.status}: ${body?.error?.message || 'request failed'}`);
    let result = {}; try { result = JSON.parse(body.choices?.[0]?.message?.content || '{}'); } catch (_) {}
    const items = (Array.isArray(result.items) ? result.items : []).map(i => ({ symbol: String(i.symbol || '').slice(0, 80), tag: String(i.tag || '').slice(0, 20), count: Math.max(0, Math.round(Number(i.count) || 0)) })).filter(i => i.count > 0);
    return json(200, { part, areaInQuarter: result.area_in_quarter !== false, items, notes: String(result.notes || '').slice(0, 200) });
  } catch (error) {
    return json(500, { error: error.name === 'TimeoutError' ? 'The count took too long. Try again.' : error.message });
  }
};
