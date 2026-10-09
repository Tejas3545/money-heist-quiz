'use client';
import { useMemo } from 'react';

function Bill({ tone }: { tone: number }) {
  const bg = tone === 0 ? '#E8E1D0' : tone === 1 ? '#C9A227' : '#E8E1D0';
  const mark = tone === 1 ? '#0B0B0C' : '#C8102E';
  return (
    <svg viewBox="0 0 120 56" width="120" height="56" aria-hidden="true">
      <rect x="1.5" y="1.5" width="117" height="53" fill={bg} stroke="#0B0B0C" strokeWidth="3" />
      <rect x="9" y="9" width="102" height="38" fill="none" stroke={mark} strokeWidth="2" />
      <circle cx="60" cy="28" r="12" fill="none" stroke={mark} strokeWidth="3" />
      <path d="M60 20 V36M55 25 Q60 22 65 25 Q55 30 65 33 Q60 36 55 33" fill="none" stroke={mark} strokeWidth="2" />
      <path d="M16 16 H30M16 22 H26M90 34 H104M94 40 H104" stroke={mark} strokeWidth="2" />
    </svg>
  );
}

/** Flat vector paper money, CSS-animated (cheap). Hidden for reduced-motion users. */
export default function Money({ count = 26 }: { count?: number }) {
  const bills = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 96,
        dur: 6 + Math.random() * 6,
        delay: -Math.random() * 12,
        r0: `${Math.round(-40 + Math.random() * 80)}deg`,
        r1: `${Math.round(-200 + Math.random() * 400)}deg`,
        dx: `${Math.round(-120 + Math.random() * 240)}px`,
        tone: i % 3,
        scale: 0.55 + Math.random() * 0.6,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      {bills.map((b, i) => (
        <div
          key={i}
          className="bill"
          style={{ left: `${b.left}%`, ['--dur' as string]: `${b.dur}s`, ['--delay' as string]: `${b.delay}s`, ['--r0' as string]: b.r0, ['--r1' as string]: b.r1, ['--dx' as string]: b.dx, scale: b.scale }}
        >
          <Bill tone={b.tone} />
        </div>
      ))}
    </div>
  );
}
