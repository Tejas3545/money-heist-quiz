import { z } from 'zod';
import { AVATAR_COUNT, NAME_MAX, NAME_MIN, TIME_OPTIONS, normalizePhone } from './config';

const BAD_LONG = ['fuck', 'shit', 'bitch', 'asshole', 'bastard', 'chutiya', 'madarchod', 'bhenchod', 'behenchod', 'bhosdi', 'randi', 'harami', 'gaandu', 'nigger', 'faggot', 'cunt'];
const BAD_SHORT = new Set(['gandu', 'lund', 'lauda', 'chut', 'dick', 'cock', 'slut', 'whore']);

/** Strip HTML, control chars and extra spaces. */
export function cleanName(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>&"'`\\]/g, '')
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Profanity-lite: deliberately conservative to avoid blocking real names. */
export function nameIsClean(name: string): boolean {
  const lower = name.toLowerCase();
  const squashed = lower.replace(/[^a-z]/g, '');
  if (BAD_LONG.some((w) => squashed.includes(w))) return false;
  return !lower.split(/[^a-z]+/).some((t) => BAD_SHORT.has(t));
}

export const joinSchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().min(1).max(80),
  phone: z.string().min(5).max(20),
  avatar: z.number().int().min(0).max(AVATAR_COUNT - 1),
});

export function parseJoin(body: unknown):
  | { ok: true; code: string; name: string; phone: string; avatar: number }
  | { ok: false; field: 'code' | 'name' | 'phone' | 'avatar' | 'body'; msg: string } {
  const r = joinSchema.safeParse(body);
  if (!r.success) return { ok: false, field: 'body', msg: 'Bad request.' };
  const name = cleanName(r.data.name);
  if (name.length < NAME_MIN || name.length > NAME_MAX) return { ok: false, field: 'name', msg: `Codename must be ${NAME_MIN} to ${NAME_MAX} characters.` };
  if (!nameIsClean(name)) return { ok: false, field: 'name', msg: 'The Professor does not approve that codename. Pick another.' };
  const phone = normalizePhone(r.data.phone);
  if (!phone) return { ok: false, field: 'phone', msg: 'Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.' };
  return { ok: true, code: r.data.code.toUpperCase(), name, phone, avatar: r.data.avatar };
}

export const answerSchema = z.object({
  q: z.number().int().min(0).max(99),
  c: z.number().int().min(0).max(3),
});

const timeSchema = z.union(TIME_OPTIONS.map((t) => z.literal(t)) as [z.ZodLiteral<10>, z.ZodLiteral<15>, z.ZodLiteral<20>, z.ZodLiteral<30>]);

export const actionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.enum(['openLobby', 'startGame', 'next', 'endQuestion', 'showReveal', 'pause', 'resume', 'showFinal', 'reset']),
    v: z.number().int(),
  }),
  z.object({ type: z.literal('setTimer'), v: z.number().int(), seconds: timeSchema }),
  z.object({ type: z.literal('clearTimer'), v: z.number().int() }),
  z.object({ type: z.literal('setCode'), v: z.number().int(), code: z.string().trim().min(3).max(24) }),
  z.object({ type: z.literal('kick'), v: z.number().int().optional(), pid: z.string().regex(/^[a-f0-9]{16}$/) }),
]);

export type AdminAction = z.infer<typeof actionSchema>;
