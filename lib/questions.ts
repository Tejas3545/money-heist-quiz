import 'server-only';
import { z } from 'zod';
import raw from '@/data/questions.json';

// SERVER ONLY. This module holds the answers and must never be imported by client code.
// The 'server-only' import makes the build fail if a client component tries.

const schema = z
  .array(
    z.object({
      id: z.number().int(),
      difficulty: z.enum(['Easy', 'Intermediate']),
      text: z.string().min(3),
      options: z.array(z.string().min(1)).length(4),
      correctIndex: z.number().int().min(0).max(3),
      timeLimit: z.union([z.literal(10), z.literal(15), z.literal(20), z.literal(30)]),
      funFact: z.string(),
    }),
  )
  .min(1);

export const QUESTIONS = schema.parse(raw);

function hashSeed(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic option order for a question: same for every player, fixed for the whole game. */
export function optionOrder(seed: string, qi: number): number[] {
  const rnd = mulberry32(hashSeed(`${seed}:${qi}`));
  const idx = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export function questionMeta(qi: number, seed: string) {
  const q = QUESTIONS[qi];
  if (!q) throw new Error(`No question ${qi}`);
  const order = optionOrder(seed, qi);
  return {
    id: q.id,
    n: qi + 1,
    difficulty: q.difficulty,
    text: q.text,
    options: order.map((i) => q.options[i]),
    /** index of the correct option AFTER shuffling */
    correct: order.indexOf(q.correctIndex),
    limit: q.timeLimit as number,
    fact: q.funFact,
  };
}
