import { NextRequest, NextResponse } from 'next/server';
import { redis, K } from '@/lib/redis';
import { isAdmin, notFound, NO_STORE } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** Admin-only player search (by name or phone fragment) so a player can be kicked. Phones are returned here only. */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return notFound();
  const q = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ players: [] }, { headers: NO_STORE });
  const all = (await redis().hgetall<Record<string, string>>(K.players)) ?? {};
  const out: { pid: string; n: string; a: number; ph: string }[] = [];
  for (const [pid, raw] of Object.entries(all)) {
    try {
      const p = JSON.parse(raw) as { n: string; a: number; ph: string };
      if (p.n.toLowerCase().includes(q) || p.ph.includes(q)) out.push({ pid, n: p.n, a: p.a, ph: p.ph });
    } catch { /* skip */ }
    if (out.length >= 25) break;
  }
  return NextResponse.json({ players: out }, { headers: NO_STORE });
}
