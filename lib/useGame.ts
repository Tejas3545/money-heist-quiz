'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GRACE_MS } from './config';
import type { MeResult, PublicState, Snapshot } from './types';

export const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Timestamp-driven game state.
 * - Server clock offset comes from /api/time (lowest round-trip sample wins), never from client clock alone.
 * - During a question the countdown is computed locally. State is only re-checked sparsely
 *   (CDN cached, so it costs Redis nothing) plus once just after endAt with random jitter.
 * - Lobby / reveal poll every 2-3 s with jitter. Failures back off exponentially.
 */
export function useGame(screen = false) {
  const [state, setState] = useState<PublicState | null>(null);
  const [offline, setOffline] = useState(false);
  const offset = useRef(0);
  const cur = useRef<PublicState | null>(null);
  const kick = useRef<() => void>(() => {});
  const now = useCallback(() => Date.now() + offset.current, []);

  useEffect(() => {
    let dead = false;
    let timer: ReturnType<typeof setTimeout>;
    let fails = 0;
    let best = Infinity;

    const sync = async (samples: number) => {
      for (let i = 0; i < samples && !dead; i++) {
        try {
          const t0 = Date.now();
          const r = await fetch('/api/time', { cache: 'no-store' });
          const j = (await r.json()) as { t: number };
          const t1 = Date.now();
          const rtt = t1 - t0;
          if (rtt < best) {
            best = rtt;
            offset.current = j.t + rtt / 2 - t1;
          }
        } catch { /* try again next round */ }
      }
    };

    const delay = () => {
      if (fails > 0) return Math.min(10000, 1000 * 2 ** (fails - 1)) + rnd(0, 500);
      const s = cur.current;
      if (!s) return 800;
      if (s.phase === 'QUESTION') {
        if (s.paused) return screen ? rnd(1000, 1500) : rnd(2000, 3000);
        const due = s.endAt + GRACE_MS + (screen ? rnd(0, 300) : rnd(0, 1500)) - now();
        if (due <= 0) return rnd(500, 1200);
        return Math.min(due, screen ? rnd(2500, 3500) : rnd(5000, 8000));
      }
      return screen ? rnd(1200, 1800) : rnd(2000, 3000);
    };

    const tick = async () => {
      try {
        const r = await fetch('/api/state');
        if (!r.ok) throw new Error(String(r.status));
        const s = (await r.json()) as PublicState;
        fails = 0;
        setOffline(false);
        const c = cur.current;
        if (!c || c.epoch !== s.epoch || s.v >= c.v) {
          cur.current = s;
          setState(s);
        }
      } catch {
        fails++;
        if (fails >= 2) setOffline(true);
      }
      if (!dead) timer = setTimeout(tick, delay());
    };

    kick.current = () => {
      clearTimeout(timer);
      void tick();
    };
    void sync(3).then(() => { if (!dead) void tick(); });
    const resync = setInterval(() => void sync(1), 90000);
    return () => {
      dead = true;
      clearTimeout(timer);
      clearInterval(resync);
    };
  }, [screen, now]);

  return { state, now, offline, refresh: () => kick.current() };
}

/** Ticking server-time value for countdown rendering. */
export function useNow(now: () => number, ms = 100) {
  const [t, setT] = useState(0);
  useEffect(() => {
    setT(now());
    const id = setInterval(() => setT(now()), ms);
    return () => clearInterval(id);
  }, [now, ms]);
  return t;
}

/** Fetches the cached reveal snapshot once the state is REVEAL/FINAL. */
export function useReveal(state: PublicState | null, screen = false) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const live = state && (state.phase === 'REVEAL' || state.phase === 'FINAL') && state.qi >= 0;
  const key = live ? `${state.epoch}:${state.qi}` : null;
  useEffect(() => {
    if (!key || !state) {
      setSnap(null);
      return;
    }
    let dead = false;
    let timer: ReturnType<typeof setTimeout>;
    const { qi, epoch } = state;
    const go = async () => {
      try {
        const r = await fetch(`/api/reveal?q=${qi}&e=${epoch}`);
        const j = (await r.json()) as { ready: boolean; snapshot?: Snapshot };
        if (j.ready && j.snapshot) {
          if (!dead) setSnap(j.snapshot);
          return;
        }
      } catch { /* retry */ }
      if (!dead) timer = setTimeout(go, rnd(700, 1500));
    };
    timer = setTimeout(go, screen ? 0 : rnd(0, 1200));
    return () => {
      dead = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return key ? snap : null;
}

/** The player's own result. One jittered call per question after the reveal is ready. */
export function useMe(state: PublicState | null, token: string, ready: boolean, onGone: () => void) {
  const [me, setMe] = useState<MeResult | null>(null);
  const key = state && ready ? `${state.epoch}:${state.qi}` : null;
  useEffect(() => {
    setMe(null);
    if (!key || !state) return;
    let dead = false;
    let timer: ReturnType<typeof setTimeout>;
    const qi = state.qi;
    let tries = 0;
    const go = async () => {
      try {
        const r = await fetch(`/api/me?q=${qi}`, { headers: { authorization: `Bearer ${token}` } });
        if (r.status === 401) return onGone();
        const j = (await r.json()) as MeResult;
        if (j.s === 'NOPLAYER') return onGone();
        if (j.s === 'OK') {
          if (!dead) setMe(j);
          return;
        }
      } catch { /* retry */ }
      tries++;
      if (!dead) timer = setTimeout(go, Math.min(6000, 800 * 2 ** Math.min(tries, 3)) + rnd(0, 500));
    };
    timer = setTimeout(go, rnd(0, 2000));
    return () => {
      dead = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, token]);
  return me;
}

export function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const get = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen');
      } catch { /* not supported or denied */ }
    };
    void get();
    document.addEventListener('visibilitychange', get);
    return () => {
      document.removeEventListener('visibilitychange', get);
      void lock?.release().catch(() => {});
    };
  }, []);
}
