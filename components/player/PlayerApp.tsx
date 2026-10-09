'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar } from '../avatars';
import { Board } from '../Board';
import JoinFlow, { clearSession, loadSession, saveSession } from './JoinFlow';
import { CaseLabel, Footer, HeistClock, Header, OPTION_STYLE, Plate, ReconnectBanner, RollNumber, ShapeIcon, Splash, Stamp, Tape, ThinBar, m } from '../ui';
import { useGame, useMe, useNow, useReveal, useWakeLock } from '@/lib/useGame';
import type { MeResult, PublicState, Session, Snapshot } from '@/lib/types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function PlayerApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [notice, setNotice] = useState('');
  useEffect(() => setSession(loadSession()), []);

  if (session === undefined) return <Splash text="Opening the case file..." />;
  if (!session)
    return <JoinFlow notice={notice} onJoined={(s) => { saveSession(s); setNotice(''); setSession(s); }} />;
  return (
    <Game
      session={session}
      onDrop={(why) => {
        clearSession();
        setNotice(why === 'gone' ? 'The crew roster was reset. Sign in again.' : 'Your session expired. Sign in again.');
        setSession(null);
      }}
    />
  );
}

function Game({ session, onDrop }: { session: Session; onDrop: (why: 'gone' | 'auth') => void }) {
  const { state, now, offline, refresh } = useGame(false);
  const snap = useReveal(state);
  const gone = useCallback(() => onDrop('gone'), [onDrop]);
  const me = useMe(state, session.token, !!snap, gone);
  useWakeLock();

  return (
    <>
      <ReconnectBanner show={offline} />
      <Header />
      <main className="mx-auto max-w-md px-3 pt-4">
        {!state ? (
          <Splash text="Connecting to the vault..." />
        ) : state.phase === 'IDLE' || state.phase === 'LOBBY' ? (
          <Lobby session={session} state={state} />
        ) : state.phase === 'QUESTION' && state.q ? (
          <QuestionView key={`${state.epoch}:${state.qi}`} state={state} now={now} session={session} onDrop={onDrop} refresh={refresh} />
        ) : state.phase === 'REVEAL' ? (
          <RevealView state={state} snap={snap} me={me} session={session} />
        ) : state.phase === 'FINAL' ? (
          <FinalView snap={snap} me={me} session={session} />
        ) : (
          <Splash text="Waiting for the signal..." />
        )}
      </main>
      <Footer />
    </>
  );
}

/* ---------------- lobby ---------------- */

function Lobby({ session, state }: { session: Session; state: PublicState }) {
  const open = state.phase === 'LOBBY';
  return (
    <section className="text-center">
      <CaseLabel className="mb-3">Roster / {open ? 'assembling' : 'sealed'}</CaseLabel>
      <Plate className="px-4 py-6">
        <div className="flex justify-center"><Avatar id={session.avatar} size={112} /></div>
        <p className="display mt-3 text-[38px]">{session.name}</p>
        <Tape className="mx-auto my-4 w-40" />
        <p className="font-body text-[20px] font-semibold">{open ? 'Plan accepted. Wait for the signal.' : 'The vault is closed. Stay near the door.'}</p>
      </Plate>
      <Plate className="mt-4 px-4 py-4">
        <CaseLabel className="text-gold">Crew assembled</CaseLabel>
        <p className="display num text-[72px] text-gold"><RollNumber value={state.count} /></p>
      </Plate>
    </section>
  );
}

/* ---------------- question ---------------- */

function QuestionView({ state, now, session, onDrop, refresh }: {
  state: PublicState; now: () => number; session: Session; onDrop: (w: 'gone' | 'auth') => void; refresh: () => void;
}) {
  const q = state.q!;
  const storeKey = `hs.ans.${state.epoch}.${state.qi}`;
  const [choice, setChoice] = useState<number | null>(null);
  const [ack, setAck] = useState<'none' | 'sending' | 'ok' | 'late' | 'paused' | 'fail'>('none');
  const sent = useRef(false);
  const t = useNow(now, 100);

  useEffect(() => {
    try {
      const v = localStorage.getItem(storeKey);
      if (v !== null) { setChoice(Number(v)); setAck('ok'); sent.current = true; }
    } catch { /* ignore */ }
  }, [storeKey]);

  const limitMs = q.limit * 1000;
  const remaining = state.paused ? state.remMs : Math.max(0, state.endAt - t);
  const before = t > 0 && t < state.startAt && !state.paused;
  const over = !state.paused && t >= state.endAt && t > 0;
  const open = !before && !over && !state.paused && t > 0;
  const alarm = remaining > 0 && remaining <= 3000 && open;

  const submit = async (i: number) => {
    if (sent.current || !open) return;
    sent.current = true;
    setChoice(i);
    setAck('sending');
    try { localStorage.setItem(storeKey, String(i)); } catch { /* ignore */ }
    let wait = 400;
    for (let a = 0; a < 8; a++) {
      try {
        const r = await fetch('/api/answer', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${session.token}` },
          body: JSON.stringify({ q: state.qi, c: i }),
        });
        if (r.status === 401) return onDrop('auth');
        const j = (await r.json()) as { status: string };
        if (j.status === 'OK' || j.status === 'DUP') return setAck('ok');
        if (j.status === 'NOPLAYER') return onDrop('gone');
        // Definitive refusal: unlock again only if the plan was paused
        if (j.status === 'PAUSED' || j.status === 'EARLY') {
          sent.current = false;
          setChoice(null);
          try { localStorage.removeItem(storeKey); } catch { /* ignore */ }
          setAck('paused');
          refresh();
          return;
        }
        setAck('late');
        refresh();
        return;
      } catch {
        await sleep(wait);
        wait = Math.min(wait * 2, 3000);
      }
    }
    setAck('fail');
    sent.current = false;
  };

  const locked = choice !== null && (ack === 'ok' || ack === 'sending');

  return (
    <section>
      <div className="flex items-end justify-between">
        <div>
          <CaseLabel className="text-gold">Plan {String(q.n).padStart(2, '0')} / {String(state.total).padStart(2, '0')}</CaseLabel>
          <span className="label mt-1 inline-block bg-paper px-1.5 py-px text-[10px] text-ink">{q.difficulty}</span>
        </div>
        {before ? (
          <div className="label text-right text-[12px] text-paper/80">Opens in<span className="display num block text-[44px] leading-none text-paper">{Math.max(1, Math.ceil((state.startAt - t) / 1000))}</span></div>
        ) : (
          <HeistClock ms={remaining} />
        )}
      </div>
      <ThinBar className="mt-2" pct={before ? 100 : (remaining / limitMs) * 100} alarm={alarm} />

      {state.paused && (
        <p role="status" className="mt-3 border-l-4 border-gold bg-plate px-3 py-2 font-body text-[17px] font-semibold">The Professor paused the plan. Hold position.</p>
      )}

      {before ? (
        <Plate className="mt-3 px-4 py-10 text-center">
          <p className="display text-[44px]">Stand by</p>
          <p className="font-body mt-1 text-[18px] text-paper/85">The question opens at zero.</p>
        </Plate>
      ) : (
        <>
          <Plate className="mt-3 p-4">
            <p className="font-body text-[22px] font-semibold leading-snug">{q.text}</p>
          </Plate>
          <div className="mt-3 grid gap-2.5">
            {q.options.map((o, i) => {
              const picked = choice === i;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!open || locked}
                  onClick={() => submit(i)}
                  aria-pressed={picked}
                  className={`flex min-h-[72px] w-full items-center gap-3 border-2 px-3.5 py-2 text-left font-body text-[20px] font-bold leading-tight shadow-press transition-transform active:translate-y-1 active:shadow-none disabled:shadow-none ${OPTION_STYLE[i]} ${locked && !picked ? 'opacity-40' : ''} ${picked ? 'outline outline-4 outline-offset-2 outline-gold' : ''}`}
                >
                  <ShapeIcon i={i} size={28} />
                  <span>{o}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-4 min-h-[76px]" aria-live="polite">
        {locked && (
          <Plate className="px-4 py-3">
            <p className="display text-[30px] text-gold">Locked in.</p>
            <p className="font-body text-[17px] text-paper/90">Waiting for the crew...</p>
            <div className="mt-2 h-1 w-full overflow-hidden bg-paper/15"><div className="scanbar" /></div>
          </Plate>
        )}
        {ack === 'late' && <p className="border-l-4 border-red bg-plate px-3 py-2 font-body text-[17px] font-semibold">Too late. The vault already closed on that one.</p>}
        {ack === 'fail' && <p className="border-l-4 border-red bg-plate px-3 py-2 font-body text-[17px] font-semibold">Signal lost. Tap an answer again.</p>}
        {ack === 'paused' && <p className="border-l-4 border-gold bg-plate px-3 py-2 font-body text-[17px] font-semibold">Plan on hold. Your answer was not logged. Try again when it resumes.</p>}
        {over && !locked && ack === 'none' && <p className="font-body text-[18px] font-semibold text-paper/90">Time. No answer logged.</p>}
        {over && locked && <p className="label mt-2 text-[12px] text-paper/80">Time. Counting the loot...</p>}
      </div>
    </section>
  );
}

/* ---------------- reveal ---------------- */

function RevealView({ state, snap, me, session }: { state: PublicState; snap: Snapshot | null; me: MeResult | null; session: Session }) {
  if (!snap || !me) return <Splash text="Opening the vault..." />;
  const answered = !!me.answered;
  const ok = !!me.correct;
  const gain = me.points ?? 0;
  const rank = me.rank ?? 0;
  return (
    <section>
      <div className="flex items-center justify-between">
        <CaseLabel className="text-gold">Plan {String(snap.q + 1).padStart(2, '0')} result</CaseLabel>
        <Stamp key={ok ? 'y' : 'n'} tone={ok ? 'gold' : answered ? 'red' : 'paper'} className="bg-ink text-[26px]">
          {ok ? 'Correct' : answered ? 'Wrong' : 'No answer'}
        </Stamp>
      </div>

      <Plate className="mt-3 px-4 py-5 text-center">
        <p className="font-body text-[22px] font-bold">
          {ok ? `Vault cracked. +${gain.toLocaleString('en-IN')}.` : answered ? 'Wrong code. The Professor is disappointed.' : 'No answer logged. The Professor noticed.'}
        </p>
        <p className="display num mt-1 text-[84px] text-gold">+<RollNumber from={0} value={gain} /></p>
      </Plate>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Plate className="px-3 py-3 text-center">
          <CaseLabel className="text-gold">Your rank</CaseLabel>
          <p className="display num text-[56px]">#{rank}</p>
          <p className="label text-[10px] text-paper/70">of {me.total}</p>
        </Plate>
        <Plate className="px-3 py-3 text-center">
          <CaseLabel className="text-gold">Total</CaseLabel>
          <p className="display num text-[56px] text-gold"><RollNumber value={me.pts ?? 0} /></p>
          <p className="font-body text-[14px] font-semibold text-paper/90">
            {rank === 1 ? 'You lead the crew.' : me.gap === 0 ? 'Level on points. Faster hands are ahead.' : me.gap != null ? `${me.gap} behind #${rank - 1}` : ''}
          </p>
        </Plate>
      </div>

      <Plate className="mt-3 p-4">
        <CaseLabel className="text-gold">The answer</CaseLabel>
        <div className="mt-1 flex items-center gap-2 font-body text-[22px] font-bold"><ShapeIcon i={snap.correct} size={24} /> {snap.options[snap.correct]}</div>
        <p className="mt-3 font-type text-[15px] leading-snug text-paper/90">{snap.fact}</p>
      </Plate>

      <Plate className="mt-3 pb-1">
        <CaseLabel className="px-4 pt-3 text-gold">Top of the board</CaseLabel>
        <Board rows={snap.cum.slice(0, 3)} mode="cum" meId={session.pid} />
      </Plate>

      <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="label mt-5 text-center text-[12px] text-paper/80">
        Plan {state.qi + 1 >= state.total ? 'complete. Waiting for the final call.' : 'loading. Wait for the next signal.'}
      </m.p>
    </section>
  );
}

/* ---------------- final ---------------- */

function FinalView({ snap, me, session }: { snap: Snapshot | null; me: MeResult | null; session: Session }) {
  if (!snap) return <Splash text="Counting the final loot..." />;
  const rank = me?.rank;
  const winner = rank !== undefined && rank <= 10;
  return (
    <section className="text-center">
      <Stamp tone="gold" className="bg-ink text-[30px]">Heist complete</Stamp>
      <h1 className="display mt-4 text-[44px]">Gracias, crew. The heist is complete.</h1>
      {me && me.s === 'OK' && (
        <Plate className="mt-4 px-4 py-4">
          <div className="flex justify-center"><Avatar id={session.avatar} size={80} /></div>
          <p className="display mt-2 text-[28px]">{session.name}</p>
          <p className="display num text-[64px] text-gold">#{rank}</p>
          <p className="font-body text-[18px] font-semibold"><RollNumber value={me.pts ?? 0} /> points</p>
          <p className="mt-2 font-body text-[17px] text-paper/90">{winner ? 'You are in the Top 10. Find the ADSC desk.' : 'Not this time. The crew salutes you.'}</p>
        </Plate>
      )}
      <p className="label mt-5 text-[12px] text-gold">Final plan: Top 10 walk away with the gifts.</p>
      <Plate className="mt-3 pb-1 text-left">
        <Board rows={snap.cum} mode="q" meId={session.pid} />
      </Plate>
    </section>
  );
}
