// Client-safe constants. Nothing secret in this file.

export const MAX_POINTS = 1000;
export const MIN_POINTS = 100;

/** Network grace after endAt during which an answer is still accepted (server clock). */
export const GRACE_MS = 1000;
/** Pre-roll between admin pressing start and the question opening, so every phone has time to fetch it. */
export const LEAD_MS = 4000;
/** Tie-break scale: sorted-set score = points * TIE_SCALE - cumulativeResponseMs. */
export const TIE_SCALE = 1_000_000;

export const TIME_OPTIONS = [10, 15, 20, 30] as const;
export const TOP_N = 10;
export const AVATAR_COUNT = 24;
export const NAME_MIN = 2;
export const NAME_MAX = 24;
export const SESSION_TTL_MS = 3 * 24 * 3600 * 1000;
export const ADMIN_TTL_MS = 12 * 3600 * 1000;

/** Normalises common Indian phone formats to a bare 10-digit mobile number, or null. */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/[\s\-().]/g, '');
  if (d.startsWith('+91')) d = d.slice(3);
  else if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}
