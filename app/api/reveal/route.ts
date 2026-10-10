import { NextRequest, NextResponse } from 'next/server';
import { redis, K } from '@/lib/redis';
import { finalizeIfDue, getState } from '@/lib/game';

export const dynamic = 'force-dynamic';

const memSnapCache = new Map<number, { raw: string; time: number }>();

/**
 * Cached reveal snapshot (correct answer, distribution, top 20, MCQ history).
 * Built once per question under a lock. Ready responses are memory cached & CDN cached.
 */
export async function GET(req: NextRequest) {
  const q = Number(req.nextUrl.searchParams.get('q'));
  if (!Number.isInteger(q) || q < 0 || q > 99) return new Response(null, { status: 400 });

  const now = Date.now();
  const cached = memSnapCache.get(q);
  if (cached && now - cached.time < 30000) {
    return new Response(`{"ready":true,"snapshot":${cached.raw}}`, {
      headers: { 'content-type': 'application/json', 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60', 'X-Snap-Cache': 'RAM' },
    });
  }

  let raw = await redis().get<string>(K.snap(q));
  if (!raw) {
    const s = await getState();
    if (s.qi === q) await finalizeIfDue(s);
    raw = await redis().get<string>(K.snap(q));
  }
  if (!raw) {
    return NextResponse.json({ ready: false }, { headers: { 'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=1' } });
  }

  memSnapCache.set(q, { raw, time: now });

  return new Response(`{"ready":true,"snapshot":${raw}}`, {
    headers: { 'content-type': 'application/json', 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60', 'X-Snap-Cache': 'REDIS' },
  });
}
