import { MAX_POINTS, MIN_POINTS, TIE_SCALE } from './config';

/**
 * Reference implementation of the scoring formula. The authoritative copy runs inside the
 * Redis Lua script (scripts.ts) so the check-and-score is atomic; keep both in sync.
 */
export function computePoints(remainingMs: number, limitMs: number): number {
  const ratio = Math.min(1, Math.max(0, remainingMs / limitMs));
  return Math.round(MIN_POINTS + (MAX_POINTS - MIN_POINTS) * ratio);
}

/** Sorted-set score delta for a correct answer: higher points first, then lower response time. */
export const encodeDelta = (pts: number, ms: number) => pts * TIE_SCALE - ms;

export function decodeScore(score: number): { pts: number; ms: number } {
  if (!Number.isFinite(score)) return { pts: 0, ms: 0 };
  const pts = Math.round(score / TIE_SCALE);
  return { pts, ms: pts * TIE_SCALE - score };
}
