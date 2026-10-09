import { NextRequest, NextResponse } from 'next/server';
import { redis, K } from '@/lib/redis';
import { LUA_ANSWER } from '@/lib/scripts';
import { answerSchema } from '@/lib/validate';
import { playerFrom, NO_STORE } from '@/lib/http';
import { GRACE_MS, MAX_POINTS, MIN_POINTS } from '@/lib/config';

export const dynamic = 'force-dynamic';

/**
 * One atomic Lua script: validates phase and server-side timing, scores, enforces one answer
 * per player (HSETNX), and updates the question zset, cumulative zset and distribution.
 * The response never says whether the answer was right.
 */
export async function POST(req: NextRequest) {
  const me = await playerFrom(req);
  if (!me) return NextResponse.json({ status: 'NOAUTH' }, { status: 401, headers: NO_STORE });
  const body = answerSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ status: 'BAD' }, { status: 400, headers: NO_STORE });

  const res = await redis().eval(
    LUA_ANSWER,
    [K.state, K.players, K.cum],
    [me.pid, body.data.c, Date.now(), GRACE_MS, MIN_POINTS, MAX_POINTS, body.data.q],
  );
  return NextResponse.json({ status: String(res) }, { headers: NO_STORE });
}
