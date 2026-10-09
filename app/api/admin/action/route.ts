import { NextRequest, NextResponse } from 'next/server';
import { applyAction } from '@/lib/game';
import { isAdmin, notFound, NO_STORE } from '@/lib/http';
import { actionSchema } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return notFound();
  const parsed = actionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, msg: 'Bad action.' }, { status: 400, headers: NO_STORE });
  const res = await applyAction(parsed.data);
  return NextResponse.json(res, { headers: NO_STORE });
}
