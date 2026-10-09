'use client';
import { m } from 'framer-motion';
import { ShapeIcon, Stamp } from './ui';

/** Answer distribution as vertical bars. The correct bar is gold and stamped. */
export function DistChart({ dist, correct, options, big = false }: { dist: number[]; correct: number; options?: string[]; big?: boolean }) {
  const max = Math.max(1, ...dist);
  const total = dist.reduce((a, b) => a + b, 0);
  const H = big ? 330 : 150;
  return (
    <div className={`grid grid-cols-4 items-end ${big ? 'gap-6' : 'gap-3'}`} role="img" aria-label={`Answer distribution: ${dist.join(', ')}`}>
      {dist.map((n, i) => {
        const ok = i === correct;
        const pct = total ? Math.round((n / total) * 100) : 0;
        return (
          <div key={i} className="flex flex-col items-center">
            <span className={`display num ${ok ? 'text-gold' : 'text-paper'} ${big ? 'text-[56px]' : 'text-[24px]'}`}>{n}</span>
            <div className="relative flex w-full items-end" style={{ height: H }}>
              <m.div
                className={`w-full border-2 border-ink ${ok ? 'bg-gold' : 'bg-paper/35'}`}
                initial={{ height: 0 }}
                animate={{ height: Math.max(6, (n / max) * H) }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              />
              {ok && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <Stamp tone="gold" className={big ? 'bg-ink text-[26px]' : 'bg-ink text-[12px]'}>Correct</Stamp>
                </div>
              )}
            </div>
            <div className={`mt-2 flex items-center gap-1 ${ok ? 'text-gold' : 'text-paper'}`}>
              <ShapeIcon i={i} size={big ? 34 : 18} />
              <span className={`label ${big ? 'text-[22px]' : 'text-[11px]'}`}>{pct}%</span>
            </div>
            {options && big && <p className="mt-1 line-clamp-2 text-center font-body text-[22px] leading-tight text-paper/85">{options[i]}</p>}
          </div>
        );
      })}
    </div>
  );
}
