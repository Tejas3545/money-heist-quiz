'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, m } from 'framer-motion';

import * as sfx from '@/lib/sfx';

/* ---------- branding ---------- */

export function AdscStamp({ size = 46, big = false }: { size?: number; big?: boolean }) {
  return (
    <div
      className={`inline-flex shrink-0 items-center border border-gold/80 sm:border-2 sm:border-gold bg-ink/95 rounded shadow-sm transition-transform ${
        big ? 'gap-3 px-3.5 py-2' : 'gap-1 sm:gap-2 px-1.5 py-1 sm:px-2.5 sm:py-1.5'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/adsc-logo.png"
        alt="ADSC logo"
        className="block shrink-0 object-contain"
        style={{
          width: big ? 82 : undefined,
          height: big ? 82 : undefined,
        }}
      />
      <span className={`label leading-tight text-gold font-bold ${big ? 'text-[22px]' : 'text-[9px] xs:text-[10px] sm:text-[13px]'}`}>
        ADSC
        <br />
        CREW
      </span>
    </div>
  );
}

export function AtmiyaLogo({ size = 46, big = false }: { size?: number; big?: boolean }) {
  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded bg-white border border-gold/80 sm:border-2 sm:border-gold shadow-sm ${
        big ? 'h-[88px] max-w-[280px] px-4 py-2' : 'h-[40px] xs:h-[44px] sm:h-[54px] min-w-[70px] xs:min-w-[90px] sm:min-w-[125px] max-w-[110px] xs:max-w-[140px] sm:max-w-[210px] px-1.5 xs:px-2 sm:px-3 py-1'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/atmiya-logo.png"
        alt="Atmiya University logo"
        className="block shrink-0 h-full w-auto object-contain"
        style={{
          maxHeight: big ? 78 : undefined,
        }}
      />
    </div>
  );
}

export function TitleLockup({ size = 'sm' }: { size?: 'sm' | 'xl' }) {
  const xl = size === 'xl';
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center text-center px-0.5 sm:px-1">
      <div className={`display stencil text-red tracking-wide truncate max-w-full ${xl ? 'text-[120px]' : 'text-[17px] xs:text-[20px] sm:text-[26px]'}`}>
        Code Carnival 3.0
      </div>
      <div className={`label inline-block bg-paper text-ink font-bold shadow-sm ${xl ? 'mt-3 px-5 py-1 text-[28px] tracking-[0.3em]' : 'mt-0.5 px-1.5 py-px text-[8px] xs:text-[9px] sm:text-[10px] tracking-[0.16em] sm:tracking-[0.2em]'}`}>
        Heist Day
      </div>
    </div>
  );
}

export function Header({ fullWidth = false, showAudio = true }: { fullWidth?: boolean; showAudio?: boolean }) {
  return (
    <header className="spill relative bg-ink border-b border-gold/30 sm:border-b-2 sm:border-gold/40 shadow-md">
      <div className={`mx-auto flex items-center justify-between gap-1.5 xs:gap-2 sm:gap-3 px-2 py-1.5 sm:px-5 sm:py-2.5 ${fullWidth ? 'max-w-7xl' : 'max-w-md sm:max-w-2xl'}`}>
        <AtmiyaLogo />
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-2">
          <TitleLockup />
          {showAudio && <SoundButton size="sm" />}
        </div>
        <AdscStamp />
      </div>
      <div className="tape" />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto mt-8 max-w-md px-3 pb-6 text-center">
      <div className="tape mb-3" />
      <p className="label text-[11px] text-paper/80">Atmiya Developer Students Club</p>
      <p className="label mt-1 text-[10px] text-paper/60">Operation Code Carnival</p>
    </footer>
  );
}

/* ---------- primitives ---------- */

export function Tape({ className = '' }: { className?: string }) {
  return <div className={`tape ${className}`} />;
}

export function Plate({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`plate ${className}`}>{children}</div>;
}

export function CaseLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`label text-[11px] text-paper/70 ${className}`}>{children}</p>;
}

const stampTone = {
  red: 'border-red text-red',
  gold: 'border-gold text-gold',
  paper: 'border-paper text-paper',
  alarm: 'border-alarm text-alarm',
  deep: 'border-paper bg-deep text-paper',
};

/** Stamped label that slams down. Use large sizes for red/alarm tones (contrast). */
export function Stamp({ children, tone = 'red', className = '' }: { children: ReactNode; tone?: keyof typeof stampTone; className?: string }) {
  return (
    <span className={`stamp-in display inline-block border-[3px] px-3 py-1 tracking-wider ${stampTone[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Ticker-style number roll. */
export function RollNumber({ value, from, className = '' }: { value: number; from?: number; className?: string }) {
  const [shown, setShown] = useState(from ?? value);
  const prev = useRef(from ?? value);
  useEffect(() => {
    const c = animate(prev.current, value, { duration: 0.9, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) });
    prev.current = value;
    return () => c.stop();
  }, [value]);
  return <span className={`num ${className}`}>{shown.toLocaleString('en-IN')}</span>;
}

/** Heist clock: fixed-width segment cells, tenths, goes alarm red for the last 3 seconds. */
export function HeistClock({ ms, size = 'sm', label = 'SEC' }: { ms: number; size?: 'sm' | 'xl'; label?: string }) {
  const clamped = Math.max(0, ms);
  const secs = Math.floor(clamped / 1000);
  const tenth = Math.floor((clamped % 1000) / 100);
  const alarm = clamped > 0 && clamped <= 3000;
  const xl = size === 'xl';
  const cell = xl ? 'h-[210px] w-[130px] text-[190px]' : 'h-[54px] w-[36px] text-[44px]';
  const tone = alarm ? 'border-alarm text-alarm' : 'border-gold text-paper';
  const digits = String(secs).padStart(2, '0').split('');
  return (
    <div className="inline-flex flex-col items-end" role="timer" aria-label={`${secs} seconds left`}>
      <div className="flex items-end gap-1">
        {digits.map((d, i) => (
          <span key={i} className={`display num flex items-center justify-center border-2 bg-ink leading-none ${cell} ${tone}`}>
            {d}
          </span>
        ))}
        <span className={`display num pb-1 leading-none ${xl ? 'text-[90px]' : 'text-[22px]'} ${alarm ? 'text-alarm' : 'text-gold'}`}>.{tenth}</span>
      </div>
      <span className={`label text-gold ${xl ? 'mt-2 text-[22px]' : 'mt-0.5 text-[9px]'}`}>{label}</span>
    </div>
  );
}

export function ThinBar({ pct, alarm = false, className = '' }: { pct: number; alarm?: boolean; className?: string }) {
  return (
    <div className={`h-1.5 w-full bg-paper/15 ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Time left">
      <div className={`h-full ${alarm ? 'bg-alarm' : 'bg-red'}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

/** Shape icons so colour is never the only cue: triangle, diamond, circle, square. */
export function ShapeIcon({ i, size = 26 }: { i: number; size?: number }) {
  const p = [
    <polygon key="t" points="12,3 22,21 2,21" />,
    <polygon key="d" points="12,2 22,12 12,22 2,12" />,
    <circle key="c" cx="12" cy="12" r="9.5" />,
    <rect key="s" x="3.5" y="3.5" width="17" height="17" />,
  ][i % 4];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }}>
      {p}
    </svg>
  );
}

/** Answer-option colours. Text colours were picked for WCAG AA against each fill. */
export const OPTION_STYLE = [
  'bg-red text-paper border-ink',
  'bg-gold text-ink border-ink',
  'bg-ink text-paper border-paper',
  'bg-deep text-paper border-ink',
];

export function VolumeIcon({ off, size = 24 }: { off: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {off ? (
        <>
          <line x1="22" y1="9" x2="16" y2="15" strokeWidth="2.5" />
          <line x1="16" y1="9" x2="22" y2="15" strokeWidth="2.5" />
        </>
      ) : (
        <>
          <path d="M16 9a5 5 0 0 1 0 6" />
          <path d="M19 6a9 9 0 0 1 0 12" />
        </>
      )}
    </svg>
  );
}

export function ReconnectBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-50 bg-deep px-3 py-2 text-center border-b border-gold/40">
      <span className="label text-[12px] text-paper">Reconnecting to the vault...</span>
    </div>
  );
}

export function Splash({ text }: { text: string }) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="h-1.5 w-40 overflow-hidden bg-paper/15 rounded">
        <div className="h-full bg-gold animate-pulse w-full" />
      </div>
      <p className="label text-[13px] text-paper/80">{text}</p>
    </div>
  );
}

export function SoundButton({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [muted, setMutedState] = useState(true);

  useEffect(() => {
    setMutedState(sfx.isMuted());
  }, []);

  const handleToggle = () => {
    const isNowMuted = sfx.toggleMute();
    setMutedState(isNowMuted);
  };

  const dim = size === 'lg' ? 'h-14 w-14 border-2' : size === 'sm' ? 'h-9 w-9 border-2' : 'h-11 w-11 border-2';
  const iconSize = size === 'lg' ? 30 : size === 'sm' ? 20 : 24;

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition-all active:scale-90 ${
        !muted
          ? 'border-gold bg-gold/25 text-gold shadow-[0_0_15px_rgba(201,162,39,0.6)] hover:bg-gold/35'
          : 'border-paper/40 bg-ink/90 text-paper/70 hover:border-gold hover:text-gold shadow-sm'
      } ${dim} ${className}`}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      title={muted ? 'Click to play sound' : 'Click to mute sound'}
    >
      <VolumeIcon off={muted} size={iconSize} />
    </button>
  );
}

export function TrophyIcon({ size = 26, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`inline-block ${className}`} aria-hidden="true">
      <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
      <path d="M4 3h16v6a8 8 0 0 1-16 0V3z" fill="currentColor" fillOpacity="0.25" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </svg>
  );
}

export function CelebrationIcon({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`inline-block ${className}`} aria-hidden="true">
      <path d="M4 14l3-3m5-5l3-3m-8 8l3-3m-5 5L2 17l5 5 3-3-8-5z" fill="currentColor" fillOpacity="0.25" />
      <circle cx="17" cy="5" r="1.5" fill="currentColor" />
      <circle cx="21" cy="9" r="1.5" fill="currentColor" />
      <path d="M14 2l1 2M22 14l-2-1M18 18l2 2M10 6l-2-1" />
    </svg>
  );
}

export function DownloadIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`inline-block ${className}`} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function PadlockIcon({ size = 38, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`inline-block ${className}`} aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="currentColor" fillOpacity="0.15" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Animated Iron Prison Cell Bars that slam down on wrong answer */
export function JailBarsOverlay({ onClose }: { onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-ink/80 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Heavy Vertical Prison Bars */}
      <div className="pointer-events-none absolute inset-0 flex justify-between px-3 sm:px-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-full w-3 sm:w-4 bg-gradient-to-r from-[#1A1A1C] via-[#60606A] to-[#121214] border-x border-black shadow-[0_0_12px_rgba(0,0,0,0.9)] relative animate-in slide-in-from-top duration-500"
            style={{ animationDelay: `${i * 25}ms` }}
          >
            {/* Horizontal steel bolt braces */}
            <div className="absolute top-[20%] -inset-x-1 h-3.5 bg-[#25252A] border-y border-[#454550]" />
            <div className="absolute top-[50%] -inset-x-1 h-3.5 bg-[#25252A] border-y border-[#454550]" />
            <div className="absolute top-[80%] -inset-x-1 h-3.5 bg-[#25252A] border-y border-[#454550]" />
          </div>
        ))}
      </div>

      {/* Red Prison Alarm Flash Effect */}
      <div className="pointer-events-none absolute inset-0 bg-red/10 animate-pulse" />

      {/* Center Prison Cell Door Slam Padlock Card */}
      <div className="relative z-10 mx-4 max-w-sm w-full border-4 border-red bg-ink/95 p-5 sm:p-6 text-center shadow-[0_0_35px_rgba(200,16,46,0.6)] animate-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-3 border-alarm bg-alarm/20 text-alarm shadow-lg">
          <PadlockIcon size={34} />
        </div>
        <span className="label mt-3 inline-block bg-red px-3 py-0.5 text-[12px] font-bold tracking-widest text-paper uppercase">
          CELL LOCKED
        </span>
        <h2 className="display mt-2 text-[32px] sm:text-[36px] text-paper">JAIL BREACH</h2>
        <p className="font-body mt-1 text-[16px] sm:text-[18px] text-paper/90 leading-tight">
          Wrong code submitted. You were intercepted by the guards.
        </p>
        <div className="my-3 border-2 border-red/60 bg-red/20 py-2">
          <p className="display num text-[42px] text-alarm leading-none">0 PTS</p>
          <span className="label text-[10px] text-paper/70 uppercase">Zero Loot Awarded</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full border-2 border-paper/40 bg-plate py-2.5 font-display text-[16px] uppercase tracking-wider text-paper hover:border-gold hover:text-gold transition-colors"
          >
            Inspect Leaderboard
          </button>
        )}
      </div>
    </div>
  );
}

export { m };

