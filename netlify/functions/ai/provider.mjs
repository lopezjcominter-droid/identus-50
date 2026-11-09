// Identus 50 · which AI service each part uses.
// CHAT (answers in the chat): Gemini when AI_PROVIDER=gemini or when only
//   GEMINI_API_KEY is set; otherwise OpenAI.
// READ (reading the sheets + the search "fingerprints"): OpenAI whenever
//   OPENAI_API_KEY is set (it reads dense sheets best); otherwise the same as
//   CHAT. AI_READ_PROVIDER=openai|gemini forces it.
// Gemini is called through its OpenAI-compatible endpoint.
const OPENAI = process.env.OPENAI_API_KEY || '';
const GEMINI = process.env.GEMINI_API_KEY || '';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';
const OPENAI_BASE = 'https://api.openai.com/v1';
export const IS_GEMINI = (process.env.AI_PROVIDER || '').toLowerCase() === 'gemini' || (!OPENAI && !!GEMINI);
const readWant = (process.env.AI_READ_PROVIDER || '').toLowerCase();
const READ_GEMINI = readWant ? readWant === 'gemini' : (OPENAI ? false : IS_GEMINI);
export const READ = {
  isGemini: READ_GEMINI,
  key: READ_GEMINI ? GEMINI : OPENAI,
  base: READ_GEMINI ? GEMINI_BASE : OPENAI_BASE,
  keyName: READ_GEMINI ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY',
  model: READ_GEMINI ? (process.env.GEMINI_READ_MODEL || 'gemini-flash-latest') : (process.env.OPENAI_MODEL || 'gpt-4.1-mini'),
  embedModel: READ_GEMINI ? (process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001') : (process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small')
};
// Chat side
export const AI_KEY = IS_GEMINI ? GEMINI : OPENAI;
export const AI_BASE = IS_GEMINI ? GEMINI_BASE : OPENAI_BASE;
export const AI_KEY_NAME = IS_GEMINI ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY';
export const DEFAULT_CHAT_MODEL = IS_GEMINI ? (process.env.GEMINI_MODEL || 'gemini-flash-latest') : 'gpt-4.1-mini';
// The chat's search must use the same "fingerprints" as the reading.
export const DEFAULT_EMBED_MODEL = READ.embedModel;
// Small differences between the two services.
export function adaptPayload(path, payload, isGemini = IS_GEMINI) {
  if (!isGemini) return payload;
  const p = { ...payload };
  if (path.startsWith('chat/')) {
    delete p.seed;
    // Gemini 3 models always think a little; keep it low and leave room for
    // the thinking tokens so answers are not cut.
    p.reasoning_effort = p.reasoning_effort || 'low';
    if (p.max_tokens) p.max_tokens = Math.max(1024, p.max_tokens * 4);
  }
  if (path.startsWith('embeddings')) p.dimensions = 1536; // same size as the stored vectors
  return p;
}
