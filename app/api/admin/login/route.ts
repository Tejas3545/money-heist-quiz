import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { redis, K } from '@/lib/redis';
import { passwordMatches, signToken } from '@/lib/session';
import { clientIp, NO_STORE } from '@/lib/http';
import { ADMIN_TTL_MS } from '@/lib/config';

export const dynamic = 'force-dynamic';

const body = z.object({ password: z.string().min(1).max(200) });
const MAX_FAILS = 8;

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return new Response(null, { status: 404 });
  const ip = clientIp(req);
  const r = redis();

  // Brute-force protection: failed attempts per source address (admin only; players are never IP limited).
  const fails = Number((await r.get<string>(K.rlAdmin(ip))) ?? 0);
  if (fails >= MAX_FAILS) {
    return NextResponse.json({ ok: false, msg: 'Too many attempts. Wait ten minutes.' }, { status: 429, headers: NO_STORE });
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !(await passwordMatches(parsed.data.password, expected))) {
    const p = r.pipeline();
    p.incr(K.rlAdmin(ip));
    p.expire(K.rlAdmin(ip), 600);
    await p.exec();
    await new Promise((res) => setTimeout(res, 600));
    return NextResponse.json({ ok: false, msg: 'Wrong password.' }, { status: 401, headers: NO_STORE });
  }

  await r.del(K.rlAdmin(ip));
  const token = await signToken({ t: 'a' }, ADMIN_TTL_MS);
  const out = NextResponse.json({ ok: true }, { headers: NO_STORE });
  out.cookies.set('hs_admin', token, {
    httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: ADMIN_TTL_MS / 1000,
  });
  return out;
}
