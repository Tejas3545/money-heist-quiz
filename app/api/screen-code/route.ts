import { NextRequest, NextResponse } from 'next/server';
import { getState } from '@/lib/game';
import { notFound, NO_STORE } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** The projector needs the game code for the QR. It proves it is the screen by sending its secret slug. */
export async function GET(req: NextRequest) {
  const key = (req.headers.get('x-screen-key') || '').replace(/^\/+|\/+$/g, '');
  const expected = (process.env.SCREEN_PATH || '').replace(/^\/+|\/+$/g, '');
  if (!expected || key !== expected) return notFound();
  const s = await getState();
  return NextResponse.json({ code: s.code }, { headers: NO_STORE });
}
