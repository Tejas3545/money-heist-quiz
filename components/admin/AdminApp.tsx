'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DownloadIcon, Header, TrophyIcon } from '../ui';
import * as sfx from '@/lib/sfx';
import type { AdminData, PreviewQ } from '@/lib/types';

// Plain, dark, same palette, big buttons. No decoration. Works on a phone held on stage.

const btn = 'min-h-[64px] w-full border-2 border-paper/40 px-3 font-body text-[20px] font-bold uppercase tracking-wide disabled:opacity-40';
const OPT = ['Triangle', 'Diamond', 'Circle', 'Square'];

type Body = { type: string; seconds?: number; code?: string; pid?: string };

export default function AdminApp() {
  const [auth, setAuth] = useState<'unknown' | 'in' | 'out'>('unknown');
  const [d, setD] = useState<AdminData | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [pw, setPw] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [code, setCode] = useState('');
  const [find, setFind] = useState('');
  const [found, setFound] = useState<{ pid: string; n: string; ph: string }[]>([]);
  const [resetText, setResetText] = useState('');
  const [customSec, setCustomSec] = useState('');
  const offset = useRef(0);
  const [now, setNow] = useState(0);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/state', { cache: 'no-store' });
      if (r.status === 404) return setAuth('out');
      const j = (await r.json()) as AdminData;
      offset.current = j.serverNow - Date.now();
      setD(j);
      setAuth('in');
    } catch { /* keep last data */ }
  }, []);

  useEffect(() => {
    void load();
    const a = setInterval(load, 1500);
    const b = setInterval(() => setNow(Date.now() + offset.current), 200);
    return () => { clearInterval(a); clearInterval(b); };
  }, [load]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; msg?: string };
    if (j.ok) { setPw(''); setLoginMsg(''); void load(); } else setLoginMsg(j.msg || 'Refused.');
  };

  const act = async (body: Body, needV = true) => {
    if (busy || !d) return;
    setBusy(true);
    try {
      const r = await fetch('/api/admin/action', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(needV ? { ...body, v: d.state.v } : body) });
      const j = (await r.json()) as { ok: boolean; msg?: string };
      setMsg(j.ok ? 'Done.' : j.msg || 'Refused.');
    } catch {
      setMsg('Network error. Check state before pressing again.');
    } finally {
      await load();
      setBusy(false);
    }
  };

  const search = async () => {
    const r = await fetch(`/api/admin/players?q=${encodeURIComponent(find)}`, { cache: 'no-store' });
    const j = (await r.json()) as { players: { pid: string; n: string; ph: string }[] };
    setFound(j.players);
  };

  if (auth === 'unknown') return <p className="p-6 font-type text-paper/80">Loading...</p>;
  if (auth === 'out')
    return (
      <main className="mx-auto max-w-sm p-6">
        <h1 className="mb-4 font-body text-[28px] font-bold">HQ</h1>
        <form onSubmit={login}>
          <label htmlFor="pw" className="mb-1 block font-body text-[16px]">Password</label>
          <input id="pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className="mb-3 block min-h-[56px] w-full border-2 border-paper/50 bg-ink px-3 text-[20px]" />
          <button type="submit" className={`${btn} bg-red text-paper`}>Enter</button>
          {loginMsg && <p role="alert" className="mt-3 font-body text-[17px] font-semibold">{loginMsg}</p>}
        </form>
      </main>
    );
  if (!d) return null;

  const s = d.state;
  const remaining = s.paused ? s.remMs : Math.max(0, s.endAt - now);
  const lastDone = s.phase === 'REVEAL' && s.qi + 1 >= d.total;
  const timerOn = (n: number) => (s.ovr ? s.ovr === n : (d.next?.limit ?? 15) === n);
  const stat = 'border-2 border-paper/25 p-2';
  const lbl = 'block font-body text-[13px] uppercase tracking-wide text-paper/75';

  return (
    <div>
      <Header fullWidth />
      <main className="mx-auto max-w-4xl p-3 pb-16 font-body">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h1 className="text-[26px] font-bold">HQ / Code Carnival 3.0</h1>
        </div>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Live stats">
        <div className={stat}><span className={lbl}>Phase</span><b className="text-[26px]">{s.phase}{s.paused ? ' (paused)' : ''}</b></div>
        <div className={stat}><span className={lbl}>Question</span><b className="text-[26px]">{Math.max(0, s.qi + 1)} / {d.total}</b></div>
        <div className={stat}><span className={lbl}>Players</span><b className="text-[26px]">{d.players}</b></div>
        <div className={stat}><span className={lbl}>Answers in</span><b className="text-[26px]">{s.phase === 'QUESTION' || s.phase === 'REVEAL' ? d.answered : 0}</b></div>
        <div className={stat}><span className={lbl}>Countdown</span><b className="text-[26px]">{s.phase === 'QUESTION' ? (remaining / 1000).toFixed(1) + 's' : '-'}</b></div>
        <div className={stat}><span className={lbl}>Game code / version</span><b className="text-[26px]">{s.code}</b> <span className="text-paper/70">v{s.v}</span></div>
      </section>

      <p role="status" className="my-3 min-h-[28px] text-[17px] font-semibold text-gold">{msg}</p>

      <section className="grid gap-2" aria-label="Controls">
        {s.phase === 'IDLE' && <button disabled={busy} className={`${btn} bg-red text-paper`} onClick={() => act({ type: 'openLobby' })}>Open lobby</button>}
        {s.phase === 'LOBBY' && <button disabled={busy} className={`${btn} min-h-[96px] bg-red text-[28px] text-paper`} onClick={() => act({ type: 'startGame' })}>Start game: question 1</button>}
        {s.phase === 'QUESTION' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button disabled={busy} className={`${btn} bg-deep text-paper`} onClick={() => act({ type: 'endQuestion' })}>End question early</button>
              <button disabled={busy} className={`${btn} bg-gold text-ink`} onClick={() => act({ type: 'showReveal' })}>Show reveal now</button>
            </div>
            {s.paused
              ? <button disabled={busy} className={`${btn} bg-red text-paper`} onClick={() => act({ type: 'resume' })}>Resume</button>
              : <button disabled={busy} className={btn} onClick={() => act({ type: 'pause' })}>Pause</button>}
          </>
        )}
        {s.phase === 'REVEAL' && (
          <>
            {!lastDone && <button disabled={busy} className={`${btn} min-h-[110px] bg-red text-[34px] text-paper`} onClick={() => act({ type: 'next' })}>Next question ({s.qi + 2})</button>}
            <button disabled={busy} className={`${btn} ${lastDone ? 'min-h-[110px] bg-gold text-[30px] text-ink' : 'bg-gold/90 text-ink'} flex items-center justify-center gap-2`} onClick={() => act({ type: 'showFinal' })}>
              <TrophyIcon size={28} /> Display Top 10 Winners (Projector & Phones)
            </button>
          </>
        )}
        {s.phase === 'FINAL' && (
          <div className="border-2 border-gold p-4 text-center bg-gold/10">
            <h3 className="display text-[28px] text-gold">Top 10 Final Displayed on All Screens</h3>
            <p className="font-body text-[17px] text-paper/90 mt-1">
              Projector and player panels are currently showing the top 10 prize winners list with firecracker animations.
            </p>
            <div className="mt-3 flex gap-2 justify-center">
              <a className={`${btn} !w-auto px-6 bg-gold text-ink flex items-center justify-center gap-2`} href="/api/admin/export?scope=top10" download>
                <DownloadIcon size={22} /> Download Top 10 Winners CSV
              </a>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 border-2 border-paper/25 p-3 sm:p-4 bg-ink/60 rounded" aria-label="Question timer">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h2 className="text-[19px] font-bold text-gold">Variable Question Timer</h2>
          <span className="font-type text-[15px] text-paper/90 bg-plate px-2.5 py-0.5 border border-paper/30">
            Active: <b className="text-gold text-[17px]">{s.ovr || d.next?.limit || 15}s</b>
          </span>
        </div>
        <p className="mb-2 text-[14px] text-paper/75">
          Select or enter variable time in seconds for the questions:
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
          {[5, 10, 15, 20, 30, 45, 60].map((n) => (
            <button
              key={n}
              disabled={busy || s.phase === 'QUESTION'}
              aria-pressed={timerOn(n)}
              className={`${btn} !min-h-[46px] !text-[16px] ${timerOn(n) ? 'bg-gold text-ink border-gold' : ''}`}
              onClick={() => act({ type: 'setTimer', seconds: n })}
            >
              {n}s
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            min="3"
            max="300"
            placeholder="Custom seconds (e.g. 25)"
            value={customSec}
            onChange={(e) => setCustomSec(e.target.value)}
            disabled={busy || s.phase === 'QUESTION'}
            className="min-h-[50px] min-w-0 flex-1 border-2 border-paper/50 bg-ink px-3 text-[18px] text-paper"
          />
          <button
            type="button"
            disabled={busy || s.phase === 'QUESTION' || !customSec || isNaN(Number(customSec)) || Number(customSec) < 3}
            className={`${btn} !w-auto !min-h-[50px] px-5 bg-gold text-ink font-bold text-[16px]`}
            onClick={() => {
              const num = parseInt(customSec, 10);
              if (num >= 3 && num <= 300) {
                void act({ type: 'setTimer', seconds: num });
                setCustomSec('');
              }
            }}
          >
            Set Custom
          </button>
        </div>
      </section>

      <section className="mt-6" aria-label="Answer preview">
        <h2 className="mb-1 text-[18px] font-bold">Preview correct answer (admin only)</h2>
        {d.current && <Preview label="Current" q={d.current} />}
        {d.next && <Preview label="Next" q={d.next} />}
        {!d.current && !d.next && <p className="text-paper/80">No more questions.</p>}
      </section>

      <section className="mt-6" aria-label="Game code">
        <h2 className="mb-1 text-[18px] font-bold">Change game code</h2>
        <div className="flex gap-2">
          <input aria-label="New game code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={s.code} className="min-h-[56px] min-w-0 flex-1 border-2 border-paper/50 bg-ink px-3 text-[20px] uppercase" />
          <button disabled={busy || code.trim().length < 3} className={`${btn} !w-auto px-6`} onClick={() => { void act({ type: 'setCode', code }); setCode(''); }}>Set</button>
        </div>
      </section>

      <section className="mt-6" aria-label="Kick player">
        <h2 className="mb-1 text-[18px] font-bold">Kick player</h2>
        <div className="flex gap-2">
          <input aria-label="Search name or phone" value={find} onChange={(e) => setFind(e.target.value)} placeholder="Name or phone digits" className="min-h-[56px] min-w-0 flex-1 border-2 border-paper/50 bg-ink px-3 text-[20px]" />
          <button className={`${btn} !w-auto px-6`} onClick={search}>Search</button>
        </div>
        <ul className="mt-2">
          {found.map((p) => (
            <li key={p.pid} className="flex items-center justify-between gap-2 border-b border-paper/20 py-2">
              <span>{p.n} <span className="text-paper/70">{p.ph}</span></span>
              <button className="min-h-[48px] border-2 border-red bg-deep px-4 font-bold uppercase" onClick={async () => { if (window.confirm(`Kick ${p.n}?`)) { await act({ type: 'kick', pid: p.pid }, false); setFound((f) => f.filter((x) => x.pid !== p.pid)); } }}>Kick</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6" aria-label="Export">
        <h2 className="mb-1 text-[18px] font-bold">Export CSV (rank, name, phone, total points)</h2>
        <div className="grid grid-cols-2 gap-2">
          <a className={`${btn} flex items-center justify-center`} href="/api/admin/export?scope=top10" download>Top 10</a>
          <a className={`${btn} flex items-center justify-center`} href="/api/admin/export?scope=all" download>Everyone</a>
        </div>
      </section>

      <section className="mt-8 border-2 border-red p-3" aria-label="Reset">
        <h2 className="mb-1 text-[18px] font-bold">Reset game</h2>
        <p className="mb-2 text-[15px] text-paper/85">Deletes every player, answer and score. Type RESET to confirm.</p>
        <div className="flex gap-2">
          <input aria-label="Type RESET" value={resetText} onChange={(e) => setResetText(e.target.value)} className="min-h-[56px] min-w-0 flex-1 border-2 border-paper/50 bg-ink px-3 text-[20px]" />
          <button disabled={busy || resetText !== 'RESET'} className={`${btn} !w-auto bg-deep px-6`} onClick={() => { void act({ type: 'reset' }); setResetText(''); }}>Reset</button>
        </div>
      </section>
    </main>
  </div>
  );
}

function Preview({ label, q }: { label: string; q: PreviewQ }) {
  return (
    <div className="mb-2 border-2 border-paper/25 p-3">
      <p className="text-[14px] uppercase tracking-wide text-paper/75">{label}: question {q.n}, {q.difficulty}, {q.limit}s</p>
      <p className="my-1 text-[19px] font-semibold">{q.text}</p>
      <ol className="text-[17px]">
        {q.options.map((o, i) => (
          <li key={i} className={i === q.correct ? 'font-bold text-gold' : ''}>
            {OPT[i]}: {o}{i === q.correct ? '  (correct)' : ''}
          </li>
        ))}
      </ol>
      <p className="mt-1 text-[15px] text-paper/80">{q.fact}</p>
    </div>
  );
}
