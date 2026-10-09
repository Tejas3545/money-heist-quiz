import 'server-only';
import { NextRequest } from 'next/server';
import { verifyToken } from './session';

export const NO_STORE = { 'Cache-Control': 'no-store' };

export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function playerFrom(req: NextRequest): Promise<{ pid: string; n: string; a: number } | null> {
  const h = req.headers.get('authorization');
  const token = h?.startsWith('Bearer ') ? h.slice(7) : req.cookies.get('hs_session')?.value;
  const p = await verifyToken<{ t: string; pid: string; n: string; a: number }>(token);
  if (!p || p.t !== 'p' || typeof p.pid !== 'string') return null;
  return { pid: p.pid, n: p.n, a: p.a };
}

export async function isAdmin(req: NextRequest): Promise<boolean> {
  const p = await verifyToken<{ t: string }>(req.cookies.get('hs_admin')?.value);
  return !!p && p.t === 'a';
}

/** Unauthenticated admin discovery gets a plain 404, never 401/403. */
export const notFound = () => new Response(null, { status: 404, headers: NO_STORE });
