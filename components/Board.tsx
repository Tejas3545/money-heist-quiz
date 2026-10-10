'use client';
import { useState } from 'react';
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
export function Board({ rows, mode, size = 'sm', meId, delay = 0, empty = 'Nobody here yet.', onSelect }: {
  rows: Row[]; mode: 'q' | 'cum'; size?: 'sm' | 'lg'; meId?: string; delay?: number; empty?: string; onSelect?: (r: Row) => void;
}) {
  const [inspected, setInspected] = useState<Row | null>(null);
  const big = size === 'lg';
  const H = big ? 60 : 48;
  if (!rows.length) return <p className="label p-4 text-[12px] text-paper/80">{empty}</p>;
  return (
    <>
      <ol>
        {rows.map((r, i) => {
          const showMove = mode === 'cum';
          const fresh = showMove && r.prev === null;
          const shift = showMove && typeof r.prev === 'number' ? (r.prev - r.rank) * H : 0;
          const mine = meId && r.id === meId;
          const isProfessor = r.rank === 1;
          const avatarId = typeof r.a === 'number' ? r.a : 0;
          return (
            <m.li
              key={r.id}
              initial={shift || fresh ? { y: shift, x: fresh ? 40 : 0, opacity: fresh ? 0 : 1 } : false}
              animate={{ y: 0, x: 0, opacity: 1 }}
              transition={{ delay: delay + i * 0.06, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={() => {
                if (onSelect) onSelect(r);
                else setInspected(r);
              }}
              className={`relative flex items-center gap-3 border-b border-paper/15 pr-2 cursor-pointer hover:bg-paper/5 transition-colors ${mine ? 'bg-deep' : ''}`}
              style={{ height: H }}
              title="Click to view participant dossier"
            >
              <span className={`display num w-9 text-center text-gold font-bold ${big ? 'text-[38px]' : 'text-[24px]'}`}>{r.rank}</span>
              <span className={`relative z-10 h-4 w-4 shrink-0 rounded-full border-2 border-ink ring-2 ${isProfessor ? 'bg-gold ring-gold shadow-[0_0_12px_#C9A227]' : 'bg-red ring-paper/60'}`} />
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
              <Avatar id={avatarId} size={big ? 50 : 38} />
              <div className="min-w-0 flex-1 truncate flex items-center">
                <span className={`font-body font-semibold truncate ${big ? 'text-[30px]' : 'text-[17px]'}`}>{r.n}</span>
                {isProfessor && <span className="ml-2.5 label text-[12px] text-ink bg-gold px-2 py-0.5 font-bold uppercase rounded tracking-wider shadow shrink-0">👑 THE PROFESSOR</span>}
              </div>
              <span className={`display num text-gold ${big ? 'text-[36px]' : 'text-[22px]'}`}>
                <RollNumber value={r.pts} />
              </span>
              {showMove && <Move row={r} big={big} />}
            </m.li>
          );
        })}
      </ol>

      {/* Participant info modal on click for duplicate/winner verification */}
      {inspected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4" onClick={() => setInspected(null)}>
          <div className="plate max-w-sm w-full p-5 text-center shadow-2xl border-2 border-gold" onClick={(e) => e.stopPropagation()}>
            <p className="label text-gold text-[12px] mb-2">Operative Dossier / Verification</p>
            <div className="flex justify-center mb-3">
              <Avatar id={inspected.a} size={80} />
            </div>
            <h3 className="display text-[32px] text-paper">{inspected.n}</h3>
            <p className="display num text-[42px] text-gold">Rank #{inspected.rank}</p>
            <p className="font-body text-[18px] text-paper/85">{inspected.pts.toLocaleString('en-IN')} points</p>
            {inspected.ph && (
              <div className="mt-3 bg-ink p-2.5 border border-paper/30">
                <p className="label text-[11px] text-gold">Registered Mobile (Manual Calling)</p>
                <p className="font-type text-[22px] text-paper mt-0.5 tracking-wider">+91 {inspected.ph}</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setInspected(null)}
              className="mt-4 w-full border-2 border-paper/40 bg-ink py-2.5 font-display text-[18px] uppercase text-paper hover:border-gold"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </>
  );
}
