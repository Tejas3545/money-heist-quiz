import { NextRequest, NextResponse } from 'next/server';
import { redis, K } from '@/lib/redis';
import { finalizeIfDue, getState } from '@/lib/game';

export const dynamic = 'force-dynamic';

/**
 * Cached reveal snapshot (correct answer, distribution, top 10 per question, top 10 overall).
 * Built once per question under a lock. Ready responses are CDN cached; "not ready" for 1 s.
 * The `e` (epoch) query parameter is only a cache key so a reset never serves an old game.
 */
export async function GET(req: NextRequest) {
  const q = Number(req.nextUrl.searchParams.get('q'));
  if (!Number.isInteger(q) || q < 0 || q > 99) return new Response(null, { status: 400 });

  let raw = await redis().get<string>(K.snap(q));
  if (!raw) {
    const s = await getState();
    if (s.qi === q) await finalizeIfDue(s);
    raw = await redis().get<string>(K.snap(q));
  }
  if (!raw) {
    return NextResponse.json({ ready: false }, { headers: { 'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=1' } });
  }
  return new Response(`{"ready":true,"snapshot":${raw}}`, {
    headers: { 'content-type': 'application/json', 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
  });
}
