'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, m } from 'framer-motion';

/* ---------- branding ---------- */

export function AdscStamp({ size = 40, big = false }: { size?: number; big?: boolean }) {
  return (
    <span className={`inline-flex -rotate-2 items-center border-2 border-gold bg-ink ${big ? 'gap-4 px-4 py-3' : 'gap-1.5 px-1.5 py-1'}`}>
      {/* Logo file is displayed unmodified. Replace /public/brand/adsc-logo.png with the real one. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/adsc-logo.png" alt="ADSC logo" width={size} height={size} style={{ width: size, height: size }} className="block object-contain" />
      <span className={`label leading-tight text-gold ${big ? 'text-[22px]' : 'text-[9px]'}`}>
        ADSC
        <br />
        crew
      </span>
    </span>
  );
}

export function AtmiyaLogo({ size = 38 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/atmiya-logo.png" alt="Atmiya University logo" width={size} height={size} style={{ width: size, height: size }} className="block object-contain" />
  );
}

export function TitleLockup({ size = 'sm' }: { size?: 'sm' | 'xl' }) {
  const xl = size === 'xl';
  return (
    <div className="text-center">
      <div className={`display stencil text-red ${xl ? 'text-[120px]' : 'text-[26px]'}`}>Code Carnival 3.0</div>
      <div className={`label inline-block -rotate-2 bg-paper text-ink ${xl ? 'mt-3 px-5 py-1 text-[28px] tracking-[0.3em]' : 'mt-1 px-1.5 py-px text-[10px] tracking-[0.22em]'}`}>
        Heist Day
      </div>
    </div>
  );
}

export function Header() {
  return (
    <header className="spill relative bg-ink">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-3 py-2">
        <AtmiyaLogo />
        <TitleLockup />
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

export function VolumeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {off ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M17 8c2 2.5 2 5.500 0 8M20 5c4 4 4 10 0 14" />}
    </svg>
  );
}

export function ReconnectBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-50 bg-deep px-3 py-2 text-center">
      <span className="label text-[12px] text-paper">Reconnecting to the vault...</span>
    </div>
  );
}

export function Splash({ text }: { text: string }) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6">
      <div className="h-1.5 w-40 overflow-hidden bg-paper/15">
        <div className="scanbar" />
      </div>
      <p className="label text-[12px] text-paper/80">{text}</p>
    </div>
  );
}

export { m };
