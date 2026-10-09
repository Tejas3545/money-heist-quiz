import 'server-only';
import { Redis } from '@upstash/redis';

let client: Redis | undefined;

/**
 * Single Redis client. automaticDeserialization is OFF so that player IDs / codes that look
 * like numbers are never silently converted. Every value comes back as a string.
 */
export function redis(): Redis {
  if (!client) {
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      automaticDeserialization: false,
      retry: { retries: 2, backoff: (i) => 80 * 2 ** i },
    });
  }
  return client;
}

// Key names. The Lua scripts in scripts.ts hard-code the prefixes a: zq: d: - keep in sync.
export const K = {
  state: 'g:state',
  players: 'g:players',
  kicked: 'g:kicked',
  cum: 'g:cum',
  ans: (q: number) => `a:${q}`,
  zq: (q: number) => `zq:${q}`,
  dist: (q: number) => `d:${q}`,
  snap: (q: number) => `snap:${q}`,
  lock: (q: number) => `lock:${q}`,
  rlJoin: (pid: string) => `rl:j:${pid}`,
  rlAdmin: (ip: string) => `rl:adm:${ip}`,
};
