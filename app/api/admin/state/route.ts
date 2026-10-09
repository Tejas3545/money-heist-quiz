import { NextRequest, NextResponse } from 'next/server';
import { readPublic, preview } from '@/lib/game';
import { isAdmin, notFound, NO_STORE } from '@/lib/http';
import { QUESTIONS } from '@/lib/questions';
import type { AdminData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return notFound();
  const { s, n, a } = await readPublic();
  const data: AdminData = {
    ok: true,
    serverNow: Date.now(),
    state: { phase: s.phase, qi: s.qi, v: s.v, startAt: s.startAt, endAt: s.endAt, paused: s.paused, remMs: s.remMs, limit: s.limit, ovr: s.ovr, code: s.code },
    total: QUESTIONS.length,
    players: n,
    answered: a,
    current: s.phase === 'QUESTION' || s.phase === 'REVEAL' ? preview(s.qi, s.seed) : null,
    next: preview(s.qi + 1, s.seed),
  };
  return NextResponse.json(data, { headers: NO_STORE });
}
