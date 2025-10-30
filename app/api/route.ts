export async function GET() {
  console.log('[API ROOT] Health check called');

  return Response.json({
    ok: true,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
