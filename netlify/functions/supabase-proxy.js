const SUPABASE_URL = 'https://kihsukzcbohmxovbyisi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpaHN1a3pjYm9obXhvdmJ5aXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNjEzMjEsImV4cCI6MjEwNTkzNzMyMX0.91APDO6eQ25ZkdOsBXMj_Uhv0EtkfWULn2N5jEfAGZA';

exports.handler = async (event) => {
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS'
  };
  const method = event.httpMethod || 'GET';
  if (method === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  try {
    // Formato del dashboard: /api/supabase-proxy?path=tabla?filtros&otros=...
    // Formato alterno: /.netlify/functions/supabase-proxy/tabla?filtros
    let rest = '';
    const q = event.rawQuery || '';
    if (q.startsWith('path=')) {
      rest = q.slice(5);
    } else {
      const m = (event.path || '').match(/supabase-proxy\/(.+)$/);
      rest = (m ? m[1] : '') + (q ? '?' + q : '');
    }
    if (!rest) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'No table specified' }) };
    }

    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: (event.headers && event.headers.prefer) || 'return=representation'
    };
    const opts = { method, headers };
    if (event.body && method !== 'GET' && method !== 'DELETE') opts.body = event.body;

    const res = await fetch(SUPABASE_URL + '/rest/v1/' + rest, opts);
    const text = await res.text();
    return { statusCode: res.status, headers: cors, body: text };
  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) };
  }
};
