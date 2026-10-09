import { NextRequest, NextResponse } from 'next/server';
import { redis, K } from '@/lib/redis';
import { getState } from '@/lib/game';
import { parseJoin } from '@/lib/validate';
import { pidFor, signToken } from '@/lib/session';
import { SESSION_TTL_MS } from '@/lib/config';
import { NO_STORE } from '@/lib/http';

export const dynamic = 'force-dynamic';

const fail = (status: number, error: string, msg: string) => NextResponse.json({ error, msg }, { status, headers: NO_STORE });

export async function POST(req: NextRequest) {
  const parsed = parseJoin(await req.json().catch(() => null));
  if (!parsed.ok) return fail(400, parsed.field, parsed.msg);
  const { code, name, phone, avatar } = parsed;
  const pid = await pidFor(phone);
  const r = redis();

  // Rate limit by phone (never by IP: a whole campus shares one NAT address).
  const p1 = r.pipeline();
  p1.incr(K.rlJoin(pid));
  p1.expire(K.rlJoin(pid), 60);
  p1.sismember(K.kicked, pid);
  const [tries, , kicked] = (await p1.exec()) as [number, number, number];
  if (Number(tries) > 12) return fail(429, 'rate', 'Easy. Wait a minute and try again.');
  if (Number(kicked) === 1) return fail(403, 'kicked', 'This codename was removed from the crew.');

  const s = await getState();
  if (code !== s.code) return fail(403, 'code', 'Wrong code. The Professor is disappointed.');
  if (s.phase === 'IDLE') return fail(409, 'closed', 'The crew is not assembling yet. Stay near the door.');

  // First join creates the player; a returning phone gets the stored name and avatar back.
  const p2 = r.pipeline();
  p2.hsetnx(K.players, pid, JSON.stringify({ n: name, a: avatar, ph: phone, t: Date.now() }));
  p2.hget(K.players, pid);
  p2.zadd(K.cum, { nx: true }, { score: 0, member: pid });
  const res = await p2.exec();
  let stored = { n: name, a: avatar };
  try {
    const j = JSON.parse(String(res[1])) as { n: string; a: number };
    stored = { n: j.n, a: j.a };
  } catch { /* keep submitted */ }

  const token = await signToken({ t: 'p', pid, n: stored.n, a: stored.a }, SESSION_TTL_MS);
  const out = NextResponse.json(
    { token, pid, name: stored.n, avatar: stored.a, restored: Number(res[0]) === 0 },
    { headers: NO_STORE },
  );
  out.cookies.set('hs_session', token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_TTL_MS / 1000,
  });
  return out;
}
