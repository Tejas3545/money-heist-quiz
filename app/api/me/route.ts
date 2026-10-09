import { NextRequest, NextResponse } from 'next/server';
import { redis, K } from '@/lib/redis';
import { LUA_ME } from '@/lib/scripts';
import { playerFrom, NO_STORE } from '@/lib/http';
import { decodeScore } from '@/lib/scoring';
import type { MeResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** The player's own result. Not cached. One Redis command. */
export async function GET(req: NextRequest) {
  const me = await playerFrom(req);
  if (!me) return NextResponse.json({ s: 'NOPLAYER' } satisfies MeResult, { status: 401, headers: NO_STORE });
  const q = Number(req.nextUrl.searchParams.get('q'));
  if (!Number.isInteger(q) || q < 0 || q > 99) return NextResponse.json({ s: 'NOTYET' } satisfies MeResult, { headers: NO_STORE });

  const raw = await redis().eval(LUA_ME, [K.state, K.cum], [me.pid, q]);
  const j = (typeof raw === 'string' ? JSON.parse(raw) : raw) as {
    s: MeResult['s']; rec?: string | false; score?: string; rank?: number; total?: number; above?: string | false;
  };
  if (j.s !== 'OK') return NextResponse.json({ s: j.s } satisfies MeResult, { headers: NO_STORE });

  let choice: number | undefined;
  let points = 0;
  if (typeof j.rec === 'string') {
    const [c, p] = j.rec.split('|').map(Number);
    choice = c;
    points = p;
  }
  const mine = decodeScore(Number(j.score)).pts;
  const gap = j.above ? decodeScore(Number(j.above)).pts - mine : null;
  const out: MeResult = {
    s: 'OK', answered: choice !== undefined, choice, correct: points > 0, points,
    rank: (j.rank ?? 0) + 1, total: j.total, pts: mine, gap,
  };
  return NextResponse.json(out, { headers: NO_STORE });
}
