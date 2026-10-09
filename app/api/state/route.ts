import { NextResponse } from 'next/server';
import { finalizeIfDue, readPublic, toPublic } from '@/lib/game';

export const dynamic = 'force-dynamic';

/**
 * Global public state. Identical for every player, so the CDN serves it:
 * Redis is hit about once per second no matter how many phones are polling.
 */
export async function GET() {
  const now = Date.now();
  let r = await readPublic();
  if (await finalizeIfDue(r.s, now)) r = await readPublic();
  return NextResponse.json(toPublic(r.s, r.n, r.a, now), {
    headers: { 'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=2' },
  });
}
