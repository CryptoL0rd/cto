export async function GET(request: Request) {
  console.log('[API DEBUG] GET request received');

  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
  });
}

export async function POST(request: Request) {
  console.log('[API DEBUG] POST request received');

  try {
    const body = await request.json();
    console.log('[API DEBUG] Body parsed:', body);

    return Response.json({
      status: 'ok',
      echo: body,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[API DEBUG] Failed to parse body:', e);

    return Response.json({
      status: 'error',
      error: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
