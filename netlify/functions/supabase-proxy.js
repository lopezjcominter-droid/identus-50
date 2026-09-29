exports.handler = async (event, context) => {
  const SUPABASE_URL = 'https://kihsukzcbohmxovbyisi.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpaHN1a3pjYm9obXhvdmJ5aXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNjEzMjEsImV4cCI6MjEwNTkzNzMyMX0.91APDO6eQ25ZkdOsBXMj_Uhv0EtkfWULn2N5jEfAGZA';

  try {
    // Netlify passes the splat parameter as event.path (after the /api/ part due to redirect)
    // Format: /.netlify/functions/supabase-proxy/units?project_id=eq.uuid
    const rawPath = event.path || '';
    const queryString = event.rawQueryString || '';
    const method = event.httpMethod || 'GET';
    const body = event.body ? JSON.parse(event.body) : null;

    // Extract table name from path: /.netlify/functions/supabase-proxy/units -> units
    const pathMatch = rawPath.match(/supabase-proxy\/(.+?)(?:\?|$)/);
    const table = pathMatch ? pathMatch[1] : '';

    if (!table) {
      console.log('[Proxy] No table found in path:', rawPath);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No table specified' })
      };
    }

    // Build full Supabase REST API URL
    let supabaseUrl = `${SUPABASE_URL}/rest/v1/${table}`;
    if (queryString) {
      supabaseUrl += `?${queryString}`;
    }

    console.log(`[Proxy] ${method} ${supabaseUrl}`);
    console.log(`[Proxy] Table: ${table}, Query: ${queryString}`);

    const response = await fetch(supabaseUrl, {
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': event.headers.prefer || 'return=representation'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const responseText = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: responseText
    };
  } catch (error) {
    console.error('[Proxy Error]', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
