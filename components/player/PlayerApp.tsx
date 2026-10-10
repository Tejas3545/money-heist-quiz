'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Avatar } from '../avatars';
import { Board } from '../Board';
import JoinFlow, { clearSession, loadSession, saveSession } from './JoinFlow';
import { CaseLabel, CelebrationIcon, Footer, HeistClock, Header, JailBarsOverlay, OPTION_STYLE, Plate, ReconnectBanner, RollNumber, ShapeIcon, Splash, Stamp, Tape, ThinBar, TrophyIcon, m } from '../ui';
import { useGame, useMe, useNow, useReveal, useWakeLock } from '@/lib/useGame';
import type { MeResult, PublicState, Session, Snapshot } from '@/lib/types';
import * as sfx from '@/lib/sfx';

const Money = dynamic(() => import('../Money'), { ssr: false });

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

import { DossierGraphic, HeistMaskGraphic, LootBagsGraphic, TacticalBlueprintBanner, VaultDoorGraphic } from '../graphics';

function Game({ session, onDrop }: { session: Session; onDrop: (why: 'gone' | 'auth') => void }) {
  const { state, now, offline, refresh } = useGame(false);
  const snap = useReveal(state);
  const gone = useCallback(() => onDrop('gone'), [onDrop]);
  const me = useMe(state, session.token, !!snap, gone);
  useWakeLock();

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between overflow-x-hidden">
      <div>
        <ReconnectBanner show={offline} />
        <Header />
        <main className="mx-auto max-w-md px-2.5 xs:px-3 pt-2 sm:pt-3">
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
      </div>
      <Footer />
    </div>
  );
}

/* ---------------- lobby ---------------- */

function Lobby({ session, state }: { session: Session; state: PublicState }) {
  const open = state.phase === 'LOBBY';
  return (
    <section className="text-center">
      <CaseLabel className="mb-1.5">Roster / {open ? 'assembling' : 'sealed'}</CaseLabel>
      <Plate className="px-3 py-3.5 xs:px-4 xs:py-4 shadow-lg">
        <div className="flex justify-center"><Avatar id={session.avatar} size={76} /></div>
        <p className="display mt-1 text-[28px] xs:text-[34px]">{session.name}</p>
        <Tape className="mx-auto my-2 w-32 xs:w-40" />
        <p className="font-body text-[15px] xs:text-[17px] font-semibold text-paper/95 leading-snug">
          {open ? 'Plan accepted. Wait for the signal.' : 'The vault is closed. Stay near the door.'}
        </p>
      </Plate>

      {/* Hero Vault / Mask Art on Lobby Screen: compact */}
      <div className="my-2 bg-ink/70 border border-paper/15 p-1 rounded">
        <HeistMaskGraphic height={75} />
      </div>

      <Plate className="px-3 py-2 xs:px-4 xs:py-2.5">
        <CaseLabel className="text-gold">Crew assembled in the vault</CaseLabel>
        <p className="display num text-[48px] xs:text-[58px] text-gold leading-tight"><RollNumber value={state.count} /></p>
      </Plate>

      <TacticalBlueprintBanner className="mt-2.5" />

      <button
        type="button"
        onClick={() => {
          localStorage.clear();
          location.reload();
        }}
        className="mt-2.5 w-full border border-paper/30 bg-ink/90 py-2 font-type text-[11px] xs:text-[12px] uppercase tracking-wider text-paper/70 hover:border-red hover:text-paper"
      >
        [ Change Codename / Reset Device ]
      </button>
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

  const preRemaining = state && !state.paused && t > 0 && t < state.startAt ? Math.max(0, state.startAt - t) : 0;
  const preSecLeft = Math.ceil(preRemaining / 1000);

  useEffect(() => {
    if (before && preSecLeft > 0) {
      sfx.tick(preSecLeft <= 3);
    }
  }, [before, preSecLeft]);

  return (
    <section>
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5 xs:gap-2">
            <CaseLabel className="text-gold text-[10px] xs:text-[11px]">Plan {String(q.n).padStart(2, '0')} / {String(state.total).padStart(2, '0')}</CaseLabel>
            <span className="label bg-red/90 text-paper px-1.5 py-0.5 text-[8px] xs:text-[9px] font-bold border border-ink tracking-wider">
              REAL TIME
            </span>
          </div>
          <p className="label mt-0.5 text-[9px] xs:text-[10px] text-paper/70">
            Speed matters: 1000 pts down to 100 pts
          </p>
        </div>
        {before ? (
          <div className="label text-right text-[11px] xs:text-[12px] text-paper/80">
            Opens in
            <span className="display num block text-[38px] xs:text-[46px] leading-none text-gold">
              {Math.max(1, Math.ceil((state.startAt - t) / 1000))}s
            </span>
          </div>
        ) : (
          <HeistClock ms={remaining} />
        )}
      </div>
      <ThinBar className="mt-1.5" pct={before ? 100 : (remaining / limitMs) * 100} alarm={alarm} />

      {state.paused && (
        <p role="status" className="mt-2.5 border-l-4 border-gold bg-plate px-2.5 py-1.5 font-body text-[15px] xs:text-[17px] font-semibold">The Professor paused the plan. Hold position.</p>
      )}

      {before ? (
        <Plate className="mt-2.5 px-3 py-6 xs:px-4 xs:py-8 text-center border-2 border-gold/60">
          <p className="display text-[44px] xs:text-[52px] text-gold animate-pulse">STAND BY</p>
          <p className="font-body mt-1 text-[16px] xs:text-[19px] text-paper/90">Synchronizing clocks with the vault.</p>
          <p className="label mt-2.5 text-[10px] xs:text-[11px] text-paper/60 uppercase">Fastest answers claim up to 1000 points</p>
        </Plate>
      ) : (
        <>
          <Plate className="mt-2.5 p-3 xs:p-4">
            <p className="font-body text-[18px] xs:text-[21px] font-semibold leading-snug">{q.text}</p>
          </Plate>
          <div className="mt-2.5 grid gap-2 xs:gap-2.5">
            {q.options.map((o, i) => {
              const picked = choice === i;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!open || locked}
                  onClick={() => submit(i)}
                  aria-pressed={picked}
                  className={`flex min-h-[58px] xs:min-h-[66px] w-full items-center gap-2.5 xs:gap-3 border-2 px-3 py-1.5 xs:px-3.5 xs:py-2 text-left font-body text-[16px] xs:text-[18px] sm:text-[20px] font-bold leading-tight shadow-press transition-transform active:translate-y-1 active:shadow-none disabled:shadow-none ${OPTION_STYLE[i]} ${locked && !picked ? 'opacity-40' : ''} ${picked ? 'outline outline-4 outline-offset-2 outline-gold' : ''}`}
                >
                  <ShapeIcon i={i} size={24} />
                  <span className="flex-1 break-words">{o}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-2.5 min-h-[60px]" aria-live="polite">
        {locked && (
          <Plate className="px-3 py-2 xs:px-4 xs:py-2.5">
            <p className="display text-[24px] xs:text-[28px] text-gold">Locked in.</p>
            <p className="font-body text-[14px] xs:text-[16px] text-paper/90">Waiting for the crew...</p>
            <div className="mt-1 h-1 w-full overflow-hidden bg-paper/15"><div className="scanbar" /></div>
          </Plate>
        )}
        {ack === 'late' && <p className="border-l-4 border-red bg-plate px-2.5 py-1.5 font-body text-[15px] xs:text-[17px] font-semibold">Too late. The vault already closed on that one.</p>}
        {ack === 'fail' && <p className="border-l-4 border-red bg-plate px-2.5 py-1.5 font-body text-[15px] xs:text-[17px] font-semibold">Signal lost. Tap an answer again.</p>}
        {ack === 'paused' && <p className="border-l-4 border-gold bg-plate px-2.5 py-1.5 font-body text-[15px] xs:text-[17px] font-semibold">Plan on hold. Your answer was not logged. Try again when it resumes.</p>}
        {over && !locked && ack === 'none' && <p className="font-body text-[15px] xs:text-[17px] font-semibold text-paper/90">Time. No answer logged.</p>}
        {over && locked && <p className="label mt-1 text-[10px] xs:text-[11px] text-paper/80">Time. Counting the loot...</p>}
      </div>

      <TacticalBlueprintBanner className="mt-2.5" />
    </section>
  );
}

/* ---------------- reveal ---------------- */

function RevealView({ state, snap, me, session }: { state: PublicState; snap: Snapshot | null; me: MeResult | null; session: Session }) {
  const [showResultsBanner, setShowResultsBanner] = useState(true);
  const [showJailModal, setShowJailModal] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const playedAudio = useRef(false);

  useEffect(() => {
    // 3, 2, 1 automatic results timer
    const iv = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(iv);
          setShowResultsBanner(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!me || playedAudio.current) return;
    playedAudio.current = true;
    if (me.correct) {
      sfx.bellaCiaoEffect();
      sfx.moneyChime();
    } else {
      sfx.jailEffect();
    }
  }, [me]);

  if (!snap || !me) return <Splash text="Opening the vault..." />;
  const answered = !!me.answered;
  const ok = !!me.correct;
  const gain = me.points ?? 0;
  const rank = me.rank ?? 0;

  return (
    <section className="relative">
      {/* Animated Jail Cell Closing Effect on Wrong Answer */}
      {!ok && answered && showJailModal && (
        <JailBarsOverlay onClose={() => setShowJailModal(false)} />
      )}

      {/* Falling Money Effect on Correct Answer */}
      {ok && <Money count={18} />}

      {/* 3, 2, 1 "Show the results" countdown banner overlay */}
      {showResultsBanner && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ink/90 p-6 text-center">
          <Stamp tone={ok ? 'gold' : 'red'} className="text-[28px] bg-ink">
            {ok ? 'Vault Cracked' : answered ? 'Jail Breach' : 'Sealed'}
          </Stamp>
          <h2 className="display text-[54px] mt-4 text-paper">SHOWING RESULTS</h2>
          <div className="my-6 flex items-center justify-center h-28 w-28 rounded-full border-4 border-gold bg-plate">
            <span className="display num text-[72px] text-gold">{countdown}</span>
          </div>
          <p className="label text-[14px] text-paper/70">Assembling Top 20 crew leaderboard...</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <CaseLabel className="text-gold">Plan {String(snap.q + 1).padStart(2, '0')} result</CaseLabel>
        <Stamp key={ok ? 'y' : 'n'} tone={ok ? 'gold' : answered ? 'red' : 'paper'} className="bg-ink text-[24px]">
          {ok ? 'Correct (Bella Ciao)' : answered ? 'Wrong (Jail)' : 'No answer'}
        </Stamp>
      </div>

      {/* Jail cell bars overlay indicator if wrong */}
      {!ok && answered && (
        <div className="mt-3 border-2 border-red bg-red/10 p-3 text-center">
          <p className="display text-[26px] text-alarm tracking-wide">LOCKED IN CELL / WRONG CODE</p>
          <p className="label text-[11px] text-paper/80 mt-1">JAIL EFFECT ACTIVE - 0 POINTS AWARDED</p>
        </div>
      )}

      <Plate className="mt-2 px-3 py-3 xs:px-4 xs:py-3.5 text-center">
        <p className="font-body text-[16px] xs:text-[19px] font-bold">
          {ok ? `Vault cracked! +${gain.toLocaleString('en-IN')} points!` : answered ? 'Wrong code. You got caught in the crossfire.' : 'No answer logged. The Professor noticed.'}
        </p>
        <p className="display num mt-0.5 text-[54px] xs:text-[66px] text-gold leading-none">+<RollNumber from={0} value={gain} /></p>
        <span className="label text-[9px] xs:text-[10px] text-gold/80 block mt-1 uppercase">Computed Real Time by Response Speed</span>
      </Plate>

      {/* Loot illustration on reveal: compact */}
      <div className="my-1.5 bg-ink/60 border border-paper/15 p-1 rounded">
        <LootBagsGraphic height={65} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Plate className="px-2.5 py-2 xs:px-3 xs:py-2.5 text-center">
          <CaseLabel className="text-gold text-[10px]">Your rank</CaseLabel>
          <p className="display num text-[38px] xs:text-[46px] leading-tight">#{rank}</p>
          <p className="label text-[9px] text-paper/70">of {me.total}</p>
        </Plate>
        <Plate className="px-2.5 py-2 xs:px-3 xs:py-2.5 text-center">
          <CaseLabel className="text-gold text-[10px]">Total score</CaseLabel>
          <p className="display num text-[38px] xs:text-[46px] text-gold leading-tight"><RollNumber value={me.pts ?? 0} /></p>
          <p className="font-body text-[11px] xs:text-[13px] font-semibold text-paper/90 truncate">
            {rank === 1 ? 'Leading crew' : me.gap === 0 ? 'Tied' : me.gap != null ? `${me.gap} behind #${rank - 1}` : ''}
          </p>
        </Plate>
      </div>

      <Plate className="mt-2 p-2.5 xs:p-3">
        <CaseLabel className="text-gold text-[10px]">The answer</CaseLabel>
        <div className="mt-0.5 flex items-center gap-2 font-body text-[16px] xs:text-[18px] font-bold"><ShapeIcon i={snap.correct} size={20} /> {snap.options[snap.correct]}</div>
        <p className="mt-1 font-type text-[12px] xs:text-[13px] leading-snug text-paper/90">{snap.fact}</p>
      </Plate>

      {/* Full Top 20 Scrollable Leaderboard for user */}
      <Plate className="mt-2.5 pb-2">
        <div className="flex items-center justify-between px-3 pt-2.5">
          <CaseLabel className="text-gold text-[10px] xs:text-[11px]">Leaderboard / Top 20 Crew</CaseLabel>
          <span className="label text-[9px] text-paper/60 uppercase">Rank 1: The Professor</span>
        </div>
        <div className="mt-1.5 max-h-[260px] xs:max-h-[320px] overflow-y-auto pr-1">
          <Board rows={snap.cum.slice(0, 20)} mode="cum" meId={session.pid} />
        </div>
      </Plate>

      <TacticalBlueprintBanner className="mt-2.5" />

      <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="label mt-2 text-center text-[11px] xs:text-[12px] text-paper/80">
        Plan {state.qi + 1 >= state.total ? 'complete. Waiting for final call.' : 'loading. Wait for the next signal.'}
      </m.p>
    </section>
  );
}

/* ---------------- final ---------------- */

function FinalView({ snap, me, session }: { snap: Snapshot | null; me: MeResult | null; session: Session }) {
  const [showTop10Only, setShowTop10Only] = useState(false);
  const playedAudio = useRef(false);

  useEffect(() => {
    if (!playedAudio.current) {
      playedAudio.current = true;
      sfx.firecrackerEffect();
    }
  }, []);

  if (!snap) return <Splash text="Counting the final loot..." />;
  const rank = me?.rank;
  const winner = rank !== undefined && rank <= 10;
  const displayedRows = showTop10Only ? snap.cum.slice(0, 10) : snap.cum.slice(0, 20);

  return (
    <section className="text-center relative">
      {/* Celebration firecrackers / money falling */}
      <Money count={26} />

      <Stamp tone="gold" className="bg-ink text-[22px] xs:text-[26px]">Heist complete</Stamp>
      <h1 className="display mt-1 text-[32px] xs:text-[38px]">Gracias, crew.</h1>

      {/* Dalí mask & loot climax: compact */}
      <div className="my-1.5 bg-ink/70 border border-paper/15 p-1 rounded">
        <HeistMaskGraphic height={75} />
      </div>

      {/* Top 10 Winner Fireworks Celebration Box */}
      {winner ? (
        <div className="my-3 border-2 border-gold bg-gold/15 p-4 rounded text-center animate-bounce">
          <div className="flex items-center justify-center gap-3 mb-2 text-gold">
            <CelebrationIcon size={34} />
            <TrophyIcon size={42} />
            <CelebrationIcon size={34} />
          </div>
          <h2 className="display text-[34px] text-gold">CONGRATULATIONS OPERATIVE!</h2>
          <p className="font-body text-[19px] font-bold text-paper">
            You finished in the TOP 10! You have won the Heist Day prizes!
          </p>
          <p className="label text-[12px] text-gold mt-1">Report to the ADSC desk to claim your reward.</p>
        </div>
      ) : (
        <div className="my-3 border border-paper/20 bg-ink/80 p-3 rounded text-center">
          <p className="font-body text-[18px] text-paper/90">
            Thank you for fighting with the crew! Better luck in the next heist. The Professor salutes you.
          </p>
        </div>
      )}

      {me && me.s === 'OK' && (
        <Plate className="mt-2 px-4 py-3">
          <div className="flex justify-center"><Avatar id={session.avatar} size={76} /></div>
          <p className="display mt-2 text-[26px]">{session.name}</p>
          <p className="display num text-[60px] text-gold">#{rank}</p>
          <p className="font-body text-[18px] font-semibold"><RollNumber value={me.pts ?? 0} /> points</p>
        </Plate>
      )}

      {/* Toggle View: Top 10 Winners vs Top 20 Crew */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setShowTop10Only(true)}
          className={`flex-1 py-2 font-display text-[16px] uppercase border-2 inline-flex items-center justify-center gap-1.5 ${showTop10Only ? 'bg-gold text-ink border-gold' : 'bg-ink text-paper border-paper/40'}`}
        >
          <TrophyIcon size={18} /> Top 10 Winners
        </button>
        <button
          type="button"
          onClick={() => setShowTop10Only(false)}
          className={`flex-1 py-2 font-display text-[16px] uppercase border-2 ${!showTop10Only ? 'bg-gold text-ink border-gold' : 'bg-ink text-paper border-paper/40'}`}
        >
          Top 20 Crew
        </button>
      </div>

      <Plate className="mt-2 pb-1 text-left">
        <div className="px-3 pt-2">
          <CaseLabel className="text-gold">{showTop10Only ? 'Top 10 Prize Winners' : 'Top 20 Leaderboard'}</CaseLabel>
        </div>
        <div className="max-h-[380px] overflow-y-auto pr-1">
          <Board rows={displayedRows} mode="q" meId={session.pid} />
        </div>
      </Plate>

      <TacticalBlueprintBanner className="mt-3" />
    </section>
  );
}
