import { NextResponse } from 'next/server';
import { finalizeIfDue, readPublic, toPublic } from '@/lib/game';

export const dynamic = 'force-dynamic';

let cachedResponse: { time: number; data: ReturnType<typeof toPublic> } | null = null;
const CACHE_WINDOW_MS = 400; // 400ms server in-memory buffer handles thousands of requests per second easily

/**
 * Global public state. Identical for every player, so edge cache and memory cache serve it:
 * Even with 2,000+ players, Redis is queried at most 2 times a second.
 */
export async function GET() {
  const now = Date.now();
  if (cachedResponse && now - cachedResponse.time < CACHE_WINDOW_MS) {
    return NextResponse.json(cachedResponse.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=2',
        'X-State-Cache': 'HIT',
      },
    });
  }

  let r = await readPublic();
  if (await finalizeIfDue(r.s, now)) r = await readPublic();
  const pub = toPublic(r.s, r.n, r.a, now);
  cachedResponse = { time: now, data: pub };

  return NextResponse.json(pub, {
    headers: {
      'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=2',
      'X-State-Cache': 'MISS',
    },
  });
}
