export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/** Tiny uncached clock endpoint (no Redis). Used by clients to compute their server clock offset. */
export function GET() {
  return Response.json({ t: Date.now() }, { headers: { 'Cache-Control': 'no-store' } });
}
