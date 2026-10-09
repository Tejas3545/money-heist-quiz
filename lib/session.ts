// Signed tokens (HMAC-SHA256, Web Crypto) usable in Node and Edge runtimes.

const enc = new TextEncoder();
const dec = new TextDecoder();

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('SESSION_SECRET missing or too short');
  return s;
}

function b64u(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64u(str: string): Uint8Array {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

function safeEq(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a[i] ^ b[i];
  return r === 0;
}

export async function signToken(payload: Record<string, unknown>, ttlMs: number): Promise<string> {
  const body = b64u(enc.encode(JSON.stringify({ ...payload, exp: Date.now() + ttlMs })));
  const sig = b64u(await hmac('tok:' + body));
  return `${body}.${sig}`;
}

export async function verifyToken<T extends Record<string, unknown>>(token: string | undefined | null): Promise<(T & { exp: number }) | null> {
  if (!token || token.length > 2000) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  try {
    const expected = await hmac('tok:' + body);
    if (!safeEq(expected, fromB64u(sig))) return null;
    const payload = JSON.parse(dec.decode(fromB64u(body))) as T & { exp: number };
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Stable, non-reversible public player id derived from the phone number. */
export async function pidFor(phone: string): Promise<string> {
  const h = await hmac('pid:' + phone);
  return Array.from(h.slice(0, 8), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time string comparison (via HMAC digests so length does not leak). */
export async function passwordMatches(input: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([hmac('pw:' + input), hmac('pw:' + expected)]);
  return safeEq(a, b);
}
