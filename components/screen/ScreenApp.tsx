'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Avatar } from '../avatars';
import { Board } from '../Board';
import { DistChart } from '../DistChart';
import { AdscStamp, AtmiyaLogo, CaseLabel, HeistClock, OPTION_STYLE, ReconnectBanner, RollNumber, ShapeIcon, SoundButton, Stamp, Tape, ThinBar, TitleLockup, VolumeIcon, m } from '../ui';
import { useGame, useNow, useReveal } from '@/lib/useGame';
import type { PublicState, Row, Snapshot } from '@/lib/types';

const Money = dynamic(() => import('../Money'), { ssr: false });
type Sfx = typeof import('@/lib/sfx');

function Stage({ children }: { children: ReactNode }) {
  const [sc, setSc] = useState(1);
  useEffect(() => {
    const f = () => setSc(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return (
    <div className="fixed inset-0 overflow-hidden bg-ink">
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 1920, height: 1080, transform: `translate(-50%,-50%) scale(${sc})` }}>{children}</div>
    </div>
  );
}

/** Vault-door slide between scenes. Old content stays until the doors have closed. */
function Scenes({ k, children }: { k: string; children: ReactNode }) {
  const [shownKey, setShownKey] = useState(k);
  const [ph, setPh] = useState<'idle' | 'close' | 'open'>('idle');
  const frozen = useRef<ReactNode>(children);
  if (shownKey === k) frozen.current = children;
  useEffect(() => {
    if (k === shownKey) { setPh('idle'); return; }
    setPh('close');
    const a = setTimeout(() => { setShownKey(k); setPh('open'); }, 420);
    const b = setTimeout(() => setPh('idle'), 420 + 600);
    return () => { clearTimeout(a); clearTimeout(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);
  const closed = ph === 'close';
  const tr = ph === 'close' ? 'transform .42s cubic-bezier(.7,0,.9,.4)' : 'transform .6s cubic-bezier(.2,.7,.2,1)';
  const door = (side: 'l' | 'r') => (
    <div
      className="absolute top-0 h-full w-1/2 bg-plate"
      style={{
        [side === 'l' ? 'left' : 'right']: 0,
        transform: closed ? 'translateX(0)' : `translateX(${side === 'l' ? '-101%' : '101%'})`,
        transition: tr,
        borderRight: side === 'l' ? '6px solid #C9A227' : undefined,
        borderLeft: side === 'r' ? '6px solid #C9A227' : undefined,
        backgroundImage: 'radial-gradient(circle at 40px 40px, rgba(232,225,208,.3) 5px, transparent 6px)',
        backgroundSize: '160px 160px',
      }}
    />
  );
  return (
    <div className="relative h-full w-full overflow-hidden">
      {frozen.current}
      <div className="pointer-events-none absolute inset-0 z-40" aria-hidden="true">
        {door('l')}
        {door('r')}
        <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[10px] border-gold bg-ink" style={{ opacity: closed || ph === 'open' ? 1 : 0, transition: 'opacity .3s' }}>
          <div className="absolute inset-0 flex items-center justify-center"><div className="display text-[70px] text-red">ADSC</div></div>
        </div>
      </div>
    </div>
  );
}

function QR({ url }: { url: string }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    if (!url) return;
    let dead = false;
    void import('qrcode').then((q) => q.toString(url, { type: 'svg', margin: 1, color: { dark: '#0B0B0C', light: '#E8E1D0' } })).then((s) => { if (!dead) setSvg(s); });
    return () => { dead = true; };
  }, [url]);
  return <div className="h-[460px] w-[460px] border-[6px] border-ink bg-paper [&>svg]:h-full [&>svg]:w-full" role="img" aria-label="QR code to join" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default function ScreenApp() {
  const { state, now, offline } = useGame(true);
  const snap = useReveal(state, true);
  const t = useNow(now, 100);
  const [code, setCode] = useState('');
  const [origin, setOrigin] = useState('');
  const [audio, setAudio] = useState({ on: false, muted: false });
  const sfx = useRef<Sfx | null>(null);

  useEffect(() => setOrigin(location.origin), []);

  useEffect(() => {
    if (!state || (state.phase !== 'IDLE' && state.phase !== 'LOBBY')) return;
    let dead = false;
    const go = async () => {
      try {
        const r = await fetch('/api/screen-code', { headers: { 'x-screen-key': location.pathname } });
        if (r.ok) { const j = (await r.json()) as { code: string }; if (!dead) setCode(j.code); }
      } catch { /* retry */ }
    };
    void go();
    const id = setInterval(go, 10000);
    return () => { dead = true; clearInterval(id); };
  }, [state?.phase]);

  useEffect(() => {
    void import('@/lib/sfx').then((s) => {
      sfx.current = s;
    });
  }, []);

  let scene = 'boot';
  if (state) {
    if (state.phase === 'IDLE') scene = 'idle';
    else if (state.phase === 'LOBBY') scene = 'lobby';
    else if (state.phase === 'QUESTION') scene = !state.paused && t > 0 && t < state.startAt ? 'pre' : !state.paused && t >= state.endAt ? 'timeup' : 'q';
    else scene = snap ? (state.phase === 'REVEAL' ? 'reveal' : 'final') : 'timeup';
  }
  const remaining = state ? (state.paused ? state.remMs : Math.max(0, state.endAt - t)) : 0;
  const secLeft = Math.ceil(remaining / 1000);

  const preRemaining = state && !state.paused && t > 0 && t < state.startAt ? Math.max(0, state.startAt - t) : 0;
  const preSecLeft = Math.ceil(preRemaining / 1000);

  useEffect(() => {
    if (scene === 'pre' && preSecLeft > 0) {
      sfx.current?.tick(preSecLeft <= 3);
    }
  }, [preSecLeft, scene]);

  useEffect(() => {
    if (scene === 'pre') sfx.current?.lock();
    if (scene === 'reveal') {
      sfx.current?.thud();
      sfx.current?.bellaCiaoEffect();
    }
    if (scene === 'final') {
      sfx.current?.thud();
      sfx.current?.firecrackerEffect();
    }
  }, [scene]);

  useEffect(() => {
    if (scene === 'q' && state && !state.paused && secLeft > 0) sfx.current?.tick(secLeft <= 3);
  }, [secLeft, scene, state]);

  return (
    <Stage>
      <div className="relative flex h-full w-full flex-col bg-ink">
        {/* top letterbox bar with large readable framed logos */}
        <div className="flex h-[114px] shrink-0 items-center justify-between bg-ink px-8 border-b-2 border-gold/40 shadow-lg">
          <AtmiyaLogo big />

          <div className="flex items-center justify-center gap-6">
            <p className="label text-[28px] text-paper font-bold tracking-[0.25em]">OPERATION CODE CARNIVAL / HEIST DAY</p>
            <SoundButton size="lg" />
          </div>

          <AdscStamp big />
        </div>
        <Tape />

        <div className="spill scanlines relative min-h-0 flex-1 overflow-hidden">
          <Scenes k={scene === 'pre' || scene === 'timeup' ? 'q' : scene}>
            <SceneBody scene={scene} state={state} snap={snap} t={t} remaining={remaining} code={code} origin={origin} />
          </Scenes>
          {state?.paused && state.phase === 'QUESTION' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/70">
              <Stamp tone="gold" className="bg-ink px-12 text-[140px]">Paused</Stamp>
            </div>
          )}
        </div>

        <Tape />
        <div className="flex h-[60px] shrink-0 items-center justify-center bg-ink">
          <p className="label text-[22px] text-paper/80">Atmiya Developer Students Club</p>
        </div>
        {offline && <div className="absolute inset-x-0 top-0 z-50"><ReconnectBanner show /></div>}
      </div>
    </Stage>
  );
}

function StampClock({ ms, over }: { ms: number; over: boolean }) {
  const clamped = Math.max(0, ms);
  const secs = Math.ceil(clamped / 1000);
  const alarm = clamped > 0 && clamped <= 3500;

  return (
    <m.div
      key={over ? 'over' : secs}
      initial={{ scale: 1.12, rotate: -2 }}
      animate={{ scale: 1, rotate: -1.5 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className={`relative flex items-center justify-center gap-7 px-10 py-3 rounded-2xl border-[5px] ${
        over
          ? 'border-alarm bg-ink/95 shadow-[0_0_55px_rgba(200,16,46,0.65)]'
          : alarm
            ? 'border-alarm bg-ink/95 shadow-[0_0_45px_rgba(200,16,46,0.5)]'
            : 'border-gold bg-ink/95 shadow-[0_0_35px_rgba(201,162,39,0.35)]'
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(232,225,208,0.06) 0%, transparent 70%)',
      }}
    >
      {/* Decorative mechanical clock dial SVG */}
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 100 100" className={`h-20 w-20 ${alarm ? 'text-alarm animate-spin' : 'text-gold'}`} style={{ animationDuration: '3s' }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="2" />
          {Array.from({ length: 12 }, (_, i) => {
            const rad = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={50 + Math.sin(rad) * 38}
                y1={50 - Math.cos(rad) * 38}
                x2={50 + Math.sin(rad) * 43}
                y2={50 - Math.cos(rad) * 43}
                stroke="currentColor"
                strokeWidth={i % 3 === 0 ? '3' : '1.5'}
              />
            );
          })}
          {/* Clock ticking hand */}
          <line
            x1="50"
            y1="50"
            x2={50 + Math.sin((secs * 6 * Math.PI) / 180) * 30}
            y2={50 - Math.cos((secs * 6 * Math.PI) / 180) * 30}
            stroke={alarm ? '#C8102E' : '#E8E1D0'}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="4" fill={alarm ? '#C8102E' : '#C9A227'} />
        </svg>
      </div>

      {/* Main Countdown Display */}
      {over ? (
        <div className="flex flex-col items-center">
          <span className="stamp text-alarm text-[58px] font-black tracking-widest uppercase">
            VAULT LOCKED
          </span>
          <span className="label text-[15px] text-paper/70 tracking-widest">COUNTING THE LOOT</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-3">
          <div className="flex flex-col items-start">
            <span className="label text-[13px] text-gold tracking-[0.25em] font-bold">COUNTDOWN</span>
            <span className={`display stencil text-[96px] leading-none tracking-wider ${alarm ? 'text-alarm' : 'text-gold'}`}>
              {String(secs).padStart(2, '0')}
            </span>
          </div>
          <span className={`label text-[22px] font-bold tracking-widest ${alarm ? 'text-alarm' : 'text-paper/80'}`}>
            SECONDS
          </span>
        </div>
      )}

      {/* Stamp effect border badges */}
      <div className="flex flex-col items-center pl-4 border-l-2 border-paper/20">
        <span className={`font-mono font-bold text-[13px] uppercase px-2 py-0.5 border ${
          alarm ? 'text-alarm border-alarm bg-alarm/10 animate-pulse' : 'text-gold border-gold/40 bg-gold/10'
        }`}>
          {alarm ? 'URGENT' : 'SECURE'}
        </span>
        <span className="label text-[11px] text-paper/60 mt-1">PLAN TIMER</span>
      </div>
    </m.div>
  );
}

function SceneBody({ scene, state, snap, t, remaining, code, origin }: {
  scene: string; state: PublicState | null; snap: Snapshot | null; t: number; remaining: number; code: string; origin: string;
}) {
  if (!state || scene === 'boot') return <Center><p className="label text-[34px] text-paper/80">Connecting to the vault...</p></Center>;
  if (scene === 'idle')
    return (
      <Center>
        <TitleLockup size="xl" />
        <Tape className="my-10 w-[700px]" />
        <p className="display text-[84px]">The vault is closed</p>
        <p className="label mt-4 text-[28px] text-paper/80">Wait for the Professor</p>
      </Center>
    );
  if (scene === 'lobby')
    return (
      <div className="grid h-full grid-cols-[1fr_640px] gap-12 p-14">
        <div className="flex flex-col justify-between">
          <div>
            <CaseLabel className="!text-[24px]">Case file 03 / Plan accepted</CaseLabel>
            <div className="mt-6 text-left"><TitleLockup size="xl" /></div>
          </div>
          <div>
            <p className="display text-[64px]">Crew assembled</p>
            <p className="display num text-[300px] leading-[0.9] text-gold"><RollNumber value={state.count} /></p>
          </div>
        </div>
        <div className="plate flex flex-col items-center justify-center gap-5 p-8">
          <CaseLabel className="!text-[24px] text-gold">Scan to join</CaseLabel>
          <QR url={code && origin ? `${origin}/?c=${encodeURIComponent(code)}` : ''} />
          <CaseLabel className="!text-[24px]">Crew code</CaseLabel>
          <p className="display stencil text-[130px] tracking-[0.12em] text-gold">{code || '......'}</p>
        </div>
      </div>
    );
  if (scene === 'pre' && state.q)
    return (
      <Center>
        <CaseLabel className="!text-[30px] text-gold">Plan {String(state.q.n).padStart(2, '0')} / {String(state.total).padStart(2, '0')}</CaseLabel>
        <p className="display mt-4 text-[150px]">Stand by</p>
        <div className="mt-8"><HeistClock size="xl" ms={Math.max(0, state.startAt - t)} label="Opens in" /></div>
      </Center>
    );
  if ((scene === 'q' || scene === 'timeup') && state.q) {
    const q = state.q;
    const over = scene === 'timeup';
    return (
      <div className="flex h-full flex-col px-12 py-8">
        {/* Top plan details bar with full width for question */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <CaseLabel className="!text-[28px] text-gold">Plan {String(q.n).padStart(2, '0')} / {String(state.total).padStart(2, '0')}</CaseLabel>
              <span className="label bg-paper px-3 py-1 text-[22px] text-ink font-bold">{q.difficulty}</span>
              <span className="label text-[22px] text-paper/80">{state.answered} of {state.count} locked in</span>
            </div>
            <span className="label text-[18px] text-paper/70 font-mono tracking-wider">PROJECTOR BROADCAST</span>
          </div>
          <h1 className="display mt-4 text-[72px] leading-[1.05]">{q.text}</h1>
        </div>

        <ThinBar className="!h-3 mt-4" pct={(remaining / (q.limit * 1000)) * 100} alarm={remaining > 0 && remaining <= 3000} />

        {/* Center stamped animation clock in the exact middle */}
        <div className="my-5 flex items-center justify-center">
          <StampClock ms={remaining} over={over} />
        </div>

        {/* Options grid */}
        <div className="grid flex-1 grid-cols-2 gap-5">
          {q.options.map((o, i) => (
            <div key={i} className={`flex items-center gap-6 border-[4px] px-8 py-4 font-body text-[46px] font-bold leading-tight ${OPTION_STYLE[i]} ${over ? 'opacity-60' : ''}`}>
              <ShapeIcon i={i} size={58} />
              <span className="break-words">{o}</span>
            </div>
          ))}
        </div>
        {over && <p className="label mt-3 text-[26px] text-paper/80">Counting the loot...</p>}
      </div>
    );
  }
  if (scene === 'timeup') return <Center><Stamp tone="red" className="bg-ink text-[140px]">Time</Stamp><p className="label mt-8 text-[30px] text-paper/80">Counting the loot...</p></Center>;
  if (scene === 'reveal' && snap) return <RevealScene snap={snap} />;
  if (scene === 'final' && snap) return <FinalScene snap={snap} />;
  return <Center><p className="label text-[34px]">Stand by</p></Center>;
}

function Center({ children }: { children: ReactNode }) {
  return <div className="flex h-full flex-col items-center justify-center text-center">{children}</div>;
}

function RevealScene({ snap }: { snap: Snapshot }) {
  const rm = useReducedMotion();
  const D = (x: number) => (rm ? 0 : x);
  const slide = (delay: number) => ({
    initial: { clipPath: 'inset(0 100% 0 0)' },
    animate: { clipPath: 'inset(0 0% 0 0)' },
    transition: { delay: D(delay), duration: rm ? 0 : 0.6, ease: [0.7, 0, 0.2, 1] as [number, number, number, number] },
  });

  const top = snap.cum.slice(0, 20);
  const colLeft = top.slice(0, 10);
  const colRight = top.slice(10, 20);

  return (
    <div className="flex h-full flex-col px-12 py-7">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-6">
          <CaseLabel className="!text-[24px] text-gold">Plan {String(snap.q + 1).padStart(2, '0')} result</CaseLabel>
          <p className="line-clamp-1 font-body text-[30px] font-semibold text-paper/85">{snap.text}</p>
        </div>
        <span className="label bg-red text-paper px-3 py-1 text-[16px] font-bold uppercase tracking-wider">
          LIVE CUMULATIVE STANDINGS
        </span>
      </div>

      <div className="mt-4 grid flex-1 grid-cols-[740px_1fr] gap-8">
        {/* Left Column: Distribution Graph & Correct Answer */}
        <m.section {...slide(0)} className="plate flex flex-col p-6 border-2 border-gold/40">
          <div className="flex items-center justify-between">
            <CaseLabel className="!text-[22px] text-gold">Real-Time Distribution Graph</CaseLabel>
            <span className="label text-[14px] text-gold font-bold bg-ink px-2 py-0.5 border border-gold/30">Crew Breakdown</span>
          </div>
          <div className={`mt-3 flex items-center gap-4 border-[4px] px-5 py-4 font-body text-[36px] font-bold leading-tight ${OPTION_STYLE[snap.correct]}`}>
            <ShapeIcon i={snap.correct} size={44} />
            <span className="truncate">{snap.options[snap.correct]}</span>
          </div>
          <div className="mt-5 flex-1"><DistChart dist={snap.dist} correct={snap.correct} options={snap.options} big /></div>
          <p className="mt-4 font-type text-[23px] leading-snug text-paper/90">{snap.fact}</p>
        </m.section>

        {/* Right Column: Full Stretched Cumulative Top 20 Crew Leaderboard */}
        <m.section {...slide(1.8)} className="plate flex flex-col p-6 border-2 border-gold/40">
          <div className="flex items-center justify-between pb-3 border-b border-gold/30">
            <div className="flex items-center gap-3">
              <CaseLabel className="!text-[22px] text-gold">Fastest Hands / Top 20 Cumulative Crew</CaseLabel>
              <span className="label bg-gold text-ink font-bold px-2 py-0.5 text-[13px] uppercase">Official Top 20</span>
            </div>
            <span className="label text-[15px] text-paper/70 font-mono">Live Scores & Rank Changes</span>
          </div>

          <div className="mt-3 grid flex-1 grid-cols-2 gap-x-8">
            <Board rows={colLeft} mode="cum" size="lg" delay={D(2.2)} empty="No scores yet." />
            <Board rows={colRight} mode="cum" size="lg" delay={D(2.6)} empty="Awaiting more crew in ranks 11-20..." />
          </div>
        </m.section>
      </div>
    </div>
  );
}

function VaultDoor({ place, h }: { place: number; h: number }) {
  return (
    <div className="plate relative flex items-center justify-center" style={{ height: h, width: 400 }}>
      <svg viewBox="0 0 200 200" className="absolute h-[88%] opacity-90" aria-hidden="true">
        <circle cx="100" cy="100" r="92" fill="#0B0B0C" stroke="#C9A227" strokeWidth="6" />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i * 22.5 * Math.PI) / 180;
          return <circle key={i} cx={100 + Math.sin(a) * 80} cy={100 - Math.cos(a) * 80} r="4.5" fill="#E8E1D0" />;
        })}
        <circle cx="100" cy="100" r="58" fill="none" stroke="#7A0A1A" strokeWidth="8" />
      </svg>
      <span className="display relative text-[190px] text-gold" style={{ textShadow: '5px 5px 0 #7A0A1A' }}>{place}</span>
    </div>
  );
}

function Podium({ row, place, h }: { row?: Row; place: number; h: number }) {
  if (!row) return <div style={{ width: 400 }} />;
  return (
    <m.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + (3 - place) * 0.5, duration: 0.6 }} className="flex flex-col items-center">
      <Avatar id={row.a} size={place === 1 ? 150 : 120} />
      <p className="display mt-2 max-w-[400px] truncate text-[52px]">{row.n}</p>
      <p className="display num mb-3 text-[48px] text-gold">{row.pts.toLocaleString('en-IN')}</p>
      <VaultDoor place={place} h={h} />
    </m.div>
  );
}

function FinalScene({ snap }: { snap: Snapshot }) {
  const top = snap.cum;
  const rest = top.slice(3, 20); // Ranks 4 to 20 without duplicating podium ranks 1-3
  const left = rest.slice(0, 9); // Ranks 4 to 12
  const right = rest.slice(9, 17); // Ranks 13 to 20
  return (
    <div className="relative flex h-full flex-col px-12 py-6">
      <Money count={26} />
      <div className="relative z-10 flex items-center justify-between">
        <h1 className="display stencil text-[76px]">Gracias, crew. The heist is complete.</h1>
        <Stamp tone="gold" className="bg-ink text-[34px]">Final Heist Standings (Top 20)</Stamp>
      </div>
      <div className="relative z-10 mt-3 flex items-end justify-center gap-10">
        <Podium row={top[1]} place={2} h={220} />
        <Podium row={top[0]} place={1} h={290} />
        <Podium row={top[2]} place={3} h={180} />
      </div>
      <div className="plate relative z-10 mt-4 px-8 py-3">
        <div className="flex items-center justify-between border-b border-gold/30 pb-2 mb-2">
          <CaseLabel className="!text-[22px] text-gold">Crew Standings / Ranks 4 to 20</CaseLabel>
          <span className="label text-[15px] text-paper/70 font-mono">Official Final Scores</span>
        </div>
        <div className="grid grid-cols-2 gap-x-12">
          {[left, right].map((col, c) => (
            <ol key={c}>
              {col.map((r) => (
                <li key={r.id} className="flex items-center gap-4 border-b border-paper/15 py-1">
                  <span className="display num w-12 text-center text-[34px] text-gold">#{r.rank}</span>
                  <Avatar id={r.a} size={42} />
                  <span className="min-w-0 flex-1 truncate font-type text-[30px] font-semibold text-paper">{r.n}</span>
                  <span className="display num text-[32px] text-gold">{r.pts.toLocaleString('en-IN')}</span>
                </li>
              ))}
            </ol>
          ))}
        </div>
      </div>
    </div>
  );
}
