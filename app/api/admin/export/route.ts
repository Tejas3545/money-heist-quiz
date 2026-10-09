import { NextRequest } from 'next/server';
import { redis, K } from '@/lib/redis';
import { isAdmin, notFound } from '@/lib/http';
import { decodeScore } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

/** CSV with phone numbers. Admin cookie required. scope=top10|all */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return notFound();
  const scope = req.nextUrl.searchParams.get('scope') === 'all' ? 'all' : 'top10';
  const r = redis();
  const flat = (await r.zrange(K.cum, 0, scope === 'all' ? -1 : 9, { rev: true, withScores: true })) as (string | number)[];
  const ids: string[] = [];
  const scores: number[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    ids.push(String(flat[i]));
    scores.push(Number(flat[i + 1]));
  }
  const info: Record<string, { n: string; ph: string }> = {};
  for (let i = 0; i < ids.length; i += 400) {
    const chunk = ids.slice(i, i + 400);
    const got = (await r.hmget<Record<string, string>>(K.players, ...chunk)) ?? {};
    for (const id of chunk) {
      try { info[id] = JSON.parse(got[id] as string); } catch { info[id] = { n: '', ph: '' }; }
    }
  }
  // Prefix risky leading characters so spreadsheets never run a name as a formula.
  const esc = (v: string) => {
    const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const lines = ['rank,name,phone,total_points'];
  ids.forEach((id, i) => lines.push([i + 1, esc(info[id].n), esc(info[id].ph), decodeScore(scores[i]).pts].join(',')));
  return new Response(lines.join('\r\n') + '\r\n', {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="heist-${scope}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
