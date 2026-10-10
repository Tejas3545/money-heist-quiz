import 'server-only';
import { redis, K } from './redis';
import { LUA_CAS, LUA_PUBLIC } from './scripts';
import { AVATAR_COUNT, GRACE_MS, LEAD_MS, TOP_N } from './config';
import { QUESTIONS, questionMeta } from './questions';
import { decodeScore } from './scoring';
import type { AdminAction } from './validate';
import type { Phase, PreviewQ, PublicState, Row, Snapshot } from './types';

export interface RawState {
  phase: Phase;
  qi: number;
  startAt: number;
  endAt: number;
  v: number;
  paused: boolean;
  remMs: number;
  code: string;
  seed: string;
  epoch: string;
  ci: number;
  limit: number;
  ovr: number;
}

const rid = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
const num = (s: string | undefined, d = 0) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : d;
};

function parseState(h: Record<string, string>): RawState {
  return {
    phase: (h.phase as Phase) || 'IDLE',
    qi: num(h.qi, -1),
    startAt: num(h.startAt),
    endAt: num(h.endAt),
    v: num(h.v, 1),
    paused: h.paused === '1',
    remMs: num(h.remMs),
    code: h.code || '',
    seed: h.seed || 'seed',
    epoch: h.epoch || 'e0',
    ci: num(h.ci, -1),
    limit: num(h.limit),
    ovr: num(h.ovr),
  };
}

async function initState() {
  const p = redis().pipeline();
  const d: Record<string, string> = {
    phase: 'IDLE', qi: '-1', startAt: '0', endAt: '0', v: '1', paused: '0', remMs: '0',
    code: (process.env.GAME_CODE || 'VAULT').trim().toUpperCase(),
    seed: rid(), epoch: rid(), ci: '-1', limit: '0', ovr: '0',
  };
  for (const [k, v] of Object.entries(d)) p.hsetnx(K.state, k, v);
  await p.exec();
}

/** State + crew count + answers received, in a single Redis command. */
export async function readPublic(): Promise<{ s: RawState; n: number; a: number }> {
  for (let i = 0; i < 2; i++) {
    const res = await redis().eval(LUA_PUBLIC, [K.state, K.players], []);
    const j = (typeof res === 'string' ? JSON.parse(res) : res) as { s: unknown; n: number; a: number };
    if (Array.isArray(j.s) && j.s.length) {
      const h: Record<string, string> = {};
      for (let k = 0; k < j.s.length; k += 2) h[String(j.s[k])] = String(j.s[k + 1]);
      return { s: parseState(h), n: j.n, a: j.a };
    }
    await initState();
  }
  throw new Error('state init failed');
}

export const getState = async () => (await readPublic()).s;

export async function cas(expectedV: number, fields: Record<string, string | number>): Promise<boolean> {
  const args: string[] = [String(expectedV)];
  for (const [k, v] of Object.entries(fields)) args.push(k, String(v));
  const res = await redis().eval(LUA_CAS, [K.state], args);
  return Number(res) === 1;
}

export function toPublic(s: RawState, n: number, a: number, now: number): PublicState {
  const base: PublicState = {
    epoch: s.epoch, v: s.v, phase: s.phase, qi: s.qi, total: QUESTIONS.length,
    startAt: s.startAt, endAt: s.endAt, paused: s.paused, remMs: s.remMs,
    serverNow: now, count: n, answered: a,
  };
  if (s.phase === 'QUESTION' && s.qi >= 0) {
    const m = questionMeta(s.qi, s.seed);
    base.q = { n: m.n, text: m.text, options: m.options, difficulty: m.difficulty, limit: s.limit };
  }
  return base;
}

function parsePlayer(raw: string | null | undefined, rankIndex: number): { n: string; a: number; ph?: string } {
  try {
    const p = JSON.parse(raw || '{}') as { n?: string; a?: number; ph?: string };
    const defaultName = `Participant #${rankIndex + 1}`;
    // Always use the real name entered during registration; never substitute movie character names
    const displayName = p.n && p.n.trim() ? p.n.trim() : defaultName;
    const avatar = typeof p.a === 'number' ? p.a : (rankIndex % AVATAR_COUNT);
    return {
      n: displayName,
      a: avatar,
      ph: p.ph,
    };
  } catch {
    return { n: `Participant #${rankIndex + 1}`, a: rankIndex % AVATAR_COUNT };
  }
}

function toRows(flat: unknown[], names: Record<string, string | null>, prev?: Map<string, number>): Row[] {
  const out: Row[] = [];

  for (let i = 0; i + 1 < flat.length; i += 2) {
    const id = String(flat[i]);
    const rankIndex = i / 2;
    const p = parsePlayer(names[id], rankIndex);
    const row: Row = {
      id,
      n: p.n,
      a: p.a,
      ph: p.ph,
      pts: decodeScore(Number(flat[i + 1])).pts,
      rank: rankIndex + 1,
    };
    if (prev) row.prev = prev.get(id) ?? null;
    out.push(row);
  }

  // Only return real participants who joined; no dummy cast bot injection
  return out;
}

/** Computes the reveal snapshot once. Callers hold the SETNX lock. */
async function buildSnapshot(s: RawState) {
  const r = redis();
  const q = s.qi;
  const m = questionMeta(q, s.seed);
  const p = r.pipeline();
  p.zrange(K.zq(q), 0, TOP_N - 1, { rev: true, withScores: true });
  p.zrange(K.cum, 0, TOP_N - 1, { rev: true, withScores: true });
  p.hgetall(K.dist(q));
  p.hlen(K.ans(q));
  p.hlen(K.players);
  p.get(K.snap(q - 1));

  // Also pipeline fetch all questions distribution history up to current question
  for (let idx = 0; idx <= q; idx++) {
    p.hgetall(K.dist(idx));
    p.hlen(K.ans(idx));
  }

  const results = await p.exec();
  const pq = results[0] as unknown[];
  const cu = results[1] as unknown[];
  const dist = results[2] as Record<string, string> | null;
  const ans = results[3] as number;
  const crew = results[4] as number;
  const prevRaw = results[5] as string | null;

  const ids = new Set<string>();
  for (const arr of [pq, cu]) for (let i = 0; i < arr.length; i += 2) ids.add(String(arr[i]));
  const names = ids.size ? ((await r.hmget<Record<string, string>>(K.players, ...Array.from(ids))) ?? {}) : {};

  let prevMap: Map<string, number> | undefined;
  if (q > 0 && prevRaw) {
    try {
      const prev = JSON.parse(prevRaw) as Snapshot;
      prevMap = new Map(prev.cum.map((x) => [x.id, x.rank]));
    } catch { /* ignore */ }
  }

  const history: Array<{
    q: number;
    text: string;
    options: string[];
    correct: number;
    dist: number[];
    answered: number;
  }> = [];

  const extraResults = results.slice(6);
  for (let idx = 0; idx <= q; idx++) {
    const qMeta = questionMeta(idx, s.seed);
    const dMap = extraResults[idx * 2] as Record<string, string> | null;
    const ansCount = Number(extraResults[idx * 2 + 1]) || 0;
    const distArr = [0, 1, 2, 3].map((k) => num(dMap?.[String(k)]));
    history.push({
      q: idx,
      text: qMeta.text,
      options: qMeta.options,
      correct: qMeta.correct,
      dist: distArr,
      answered: ansCount,
    });
  }

  const snap: Snapshot = {
    q, text: m.text, options: m.options, correct: m.correct, fact: m.fact,
    dist: [0, 1, 2, 3].map((i) => num(dist?.[String(i)])),
    answered: Number(ans) || 0, crew: Number(crew) || 0,
    perQ: toRows(pq, names),
    cum: toRows(cu, names, prevMap),
    last: q >= QUESTIONS.length - 1,
    history,
  };
  await r.set(K.snap(q), JSON.stringify(snap), { ex: 3 * 24 * 3600 });
}

/**
 * Moves QUESTION -> REVEAL once the timer + grace has elapsed. Idempotent: the snapshot is built
 * under a SETNX lock, the phase flip is a compare-and-set on the version counter.
 * Returns true when the state is (now) REVEAL.
 */
export async function finalizeIfDue(s: RawState, now = Date.now()): Promise<boolean> {
  if (s.phase !== 'QUESTION' || s.paused || now < s.endAt + GRACE_MS) return false;
  const r = redis();
  const have = await r.exists(K.snap(s.qi));
  if (!have) {
    const got = await r.set(K.lock(s.qi), '1', { nx: true, ex: 20 });
    if (!got) return false;
    await buildSnapshot(s);
  }
  return cas(s.v, { phase: 'REVEAL' });
}

async function startQuestion(s: RawState, n: number, now: number) {
  const m = questionMeta(n, s.seed);
  const limit = s.ovr || m.limit;
  const startAt = now + LEAD_MS;
  return cas(s.v, { phase: 'QUESTION', qi: n, startAt, endAt: startAt + limit * 1000, limit, ci: m.correct, paused: 0, remMs: 0, ovr: s.ovr });
}

export function preview(qi: number, seed: string): PreviewQ | null {
  if (qi < 0 || qi >= QUESTIONS.length) return null;
  const m = questionMeta(qi, seed);
  return { n: m.n, text: m.text, options: m.options, correct: m.correct, limit: m.limit, difficulty: m.difficulty, fact: m.fact };
}

export async function kickPlayer(pid: string) {
  const p = redis().pipeline();
  p.hdel(K.players, pid);
  p.zrem(K.cum, pid);
  for (let q = 0; q < QUESTIONS.length; q++) p.zrem(K.zq(q), pid);
  p.sadd(K.kicked, pid);
  await p.exec();
}

async function wipeGame() {
  const keys = [K.players, K.kicked, K.cum];
  for (let q = 0; q < QUESTIONS.length; q++) keys.push(K.ans(q), K.zq(q), K.dist(q), K.snap(q), K.lock(q));
  await redis().del(...keys);
}

export interface ActionResult { ok: boolean; stale?: boolean; msg?: string }

/** Every state-changing action compares the client's version with Redis. Double clicks lose the race. */
export async function applyAction(a: AdminAction, now = Date.now()): Promise<ActionResult> {
  if (a.type === 'kick') {
    await kickPlayer(a.pid);
    return { ok: true };
  }
  const s = await getState();
  if (s.v !== a.v) return { ok: false, stale: true, msg: 'State changed. Refreshed.' };
  const done = (ok: boolean): ActionResult => (ok ? { ok } : { ok, stale: true, msg: 'State changed. Refreshed.' });
  const refuse = (msg: string): ActionResult => ({ ok: false, msg });

  switch (a.type) {
    case 'openLobby':
      if (s.phase !== 'IDLE') return refuse('Lobby is already open.');
      return done(await cas(s.v, { phase: 'LOBBY' }));
    case 'startGame':
    case 'next': {
      if (s.phase === 'LOBBY') return done(await startQuestion(s, 0, now));
      if (s.phase === 'REVEAL') {
        const n = s.qi + 1;
        if (n >= QUESTIONS.length) return done(await cas(s.v, { phase: 'FINAL' }));
        return done(await startQuestion(s, n, now));
      }
      return refuse('Nothing to advance from this phase.');
    }
    case 'endQuestion':
      if (s.phase !== 'QUESTION') return refuse('No question is running.');
      return done(await cas(s.v, { endAt: now, startAt: Math.min(s.startAt, now), paused: 0 }));
    case 'showReveal': {
      if (s.phase !== 'QUESTION') return refuse('No question is running.');
      const ok = await cas(s.v, { endAt: Math.min(s.endAt, now - GRACE_MS - 1), startAt: Math.min(s.startAt, now - GRACE_MS - 1), paused: 0 });
      if (!ok) return done(false);
      await finalizeIfDue(await getState(), now);
      return { ok: true };
    }
    case 'pause': {
      if (s.phase !== 'QUESTION' || s.paused) return refuse('Nothing to pause.');
      const remMs = Math.min(Math.max(0, s.endAt - now), s.limit * 1000);
      return done(await cas(s.v, { paused: 1, remMs }));
    }
    case 'resume': {
      if (s.phase !== 'QUESTION' || !s.paused) return refuse('Not paused.');
      const lim = s.limit * 1000;
      const end = now + s.remMs + (s.remMs >= lim ? 1500 : 0);
      return done(await cas(s.v, { paused: 0, remMs: 0, startAt: end - lim, endAt: end }));
    }
    case 'showFinal':
      if (s.phase !== 'REVEAL') return refuse('Show the reveal first.');
      return done(await cas(s.v, { phase: 'FINAL' }));
    case 'setTimer':
      return done(await cas(s.v, { ovr: a.seconds }));
    case 'clearTimer':
      return done(await cas(s.v, { ovr: 0 }));
    case 'setCode':
      return done(await cas(s.v, { code: a.code.toUpperCase() }));
    case 'reset': {
      const ok = await cas(s.v, {
        phase: 'IDLE', qi: -1, startAt: 0, endAt: 0, paused: 0, remMs: 0, ci: -1, limit: 0, ovr: 0,
        epoch: rid(), seed: rid(),
      });
      if (!ok) return done(false);
      await wipeGame();
      return { ok: true };
    }
  }
}
