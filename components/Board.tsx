'use client';
import { m } from 'framer-motion';
import { Avatar } from './avatars';
import { RollNumber } from './ui';
import type { Row } from '@/lib/types';

function Move({ row, big }: { row: Row; big: boolean }) {
  const sz = big ? 30 : 18;
  if (row.prev === undefined) return <span className="w-8" />;
  if (row.prev === null) return <span className={`label text-gold ${big ? 'text-[20px]' : 'text-[10px]'}`}>New</span>;
  const d = row.prev - row.rank;
  if (d === 0)
    return (
      <span className="flex w-8 justify-center text-paper/70" aria-label="no change">
        <svg width={sz} height={sz} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
      </span>
    );
  const up = d > 0;
  return (
    <span className={`flex items-center gap-0.5 ${up ? 'text-gold' : 'text-red'}`} aria-label={`${up ? 'up' : 'down'} ${Math.abs(d)}`}>
      <svg width={sz} height={sz} viewBox="0 0 24 24" aria-hidden="true">
        <path d={up ? 'M12 4 L21 17 H3Z' : 'M12 20 L21 7 H3Z'} fill="currentColor" />
      </svg>
      <span className={`display num ${big ? 'text-[28px]' : 'text-[14px]'}`}>{Math.abs(d)}</span>
    </span>
  );
}

/**
 * Investigation-board leaderboard: pins joined by red thread. On the cumulative board, rows that
 * climbed start lower and slide up while their thread draws in.
 */
export function Board({ rows, mode, size = 'sm', meId, delay = 0, empty = 'Nobody here yet.' }: {
  rows: Row[]; mode: 'q' | 'cum'; size?: 'sm' | 'lg'; meId?: string; delay?: number; empty?: string;
}) {
  const big = size === 'lg';
  const H = big ? 66 : 54;
  if (!rows.length) return <p className="label p-4 text-[12px] text-paper/80">{empty}</p>;
  return (
    <ol>
      {rows.map((r, i) => {
        const showMove = mode === 'cum';
        const fresh = showMove && r.prev === null;
        const shift = showMove && typeof r.prev === 'number' ? (r.prev - r.rank) * H : 0;
        const mine = meId && r.id === meId;
        return (
          <m.li
            key={r.id}
            initial={shift || fresh ? { y: shift, x: fresh ? 40 : 0, opacity: fresh ? 0 : 1 } : false}
            animate={{ y: 0, x: 0, opacity: 1 }}
            transition={{ delay: delay + i * 0.06, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
            className={`relative flex items-center gap-3 border-b border-paper/15 pr-2 ${mine ? 'bg-deep' : ''}`}
            style={{ height: H }}
          >
            <span className={`display num w-9 text-center text-gold ${big ? 'text-[38px]' : 'text-[24px]'}`}>{r.rank}</span>
            <span className="relative z-10 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-ink bg-red ring-1 ring-paper/60" />
            {i < rows.length - 1 && (
              <m.span
                aria-hidden="true"
                className="absolute w-[2px] origin-top bg-red"
                style={{ left: 54, top: H / 2 + 7, height: H }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: delay + 0.3 + i * 0.06, duration: 0.3 }}
              />
            )}
            <Avatar id={r.a} size={big ? 50 : 38} />
            <span className={`min-w-0 flex-1 truncate font-body font-semibold ${big ? 'text-[32px]' : 'text-[17px]'}`}>{r.n}</span>
            <span className={`display num text-gold ${big ? 'text-[36px]' : 'text-[22px]'}`}>
              <RollNumber value={r.pts} />
            </span>
            {showMove && <Move row={r} big={big} />}
          </m.li>
        );
      })}
    </ol>
  );
}
