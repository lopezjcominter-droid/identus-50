// Identus 50 · which AI service the functions use.
// OpenAI when OPENAI_API_KEY is set; Google Gemini when only GEMINI_API_KEY is
// set (or AI_PROVIDER=gemini). Gemini is called through its OpenAI-compatible
// endpoint, so the rest of the code stays the same.
export const IS_GEMINI = (process.env.AI_PROVIDER || '').toLowerCase() === 'gemini' || (!process.env.OPENAI_API_KEY && !!process.env.GEMINI_API_KEY);
export const AI_KEY = IS_GEMINI ? (process.env.GEMINI_API_KEY || '') : (process.env.OPENAI_API_KEY || '');
export const AI_BASE = IS_GEMINI ? 'https://generativelanguage.googleapis.com/v1beta/openai' : 'https://api.openai.com/v1';
export const AI_KEY_NAME = IS_GEMINI ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY';
export const DEFAULT_CHAT_MODEL = IS_GEMINI ? (process.env.GEMINI_MODEL || 'gemini-flash-latest') : 'gpt-4.1-mini';
export const DEFAULT_EMBED_MODEL = IS_GEMINI ? (process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001') : 'text-embedding-3-small';
// Small differences between the two services.
export function adaptPayload(path, payload) {
  if (!IS_GEMINI) return payload;
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
