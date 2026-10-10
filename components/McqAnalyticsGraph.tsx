'use client';
import { m } from 'framer-motion';
import { CaseLabel, OPTION_STYLE, ShapeIcon, Stamp } from './ui';
import type { Snapshot } from '@/lib/types';

interface Props {
  snap: Snapshot;
}

export function McqAnalyticsGraph({ snap }: Props) {
  const dist = snap.dist || [0, 0, 0, 0];
  const totalAnswers = dist.reduce((a, b) => a + b, 0) || snap.answered || 0;
  const correctCount = dist[snap.correct] || 0;
  const accuracyPct = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {/* 1. Header & Live Indicator for THIS specific question */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-gold/30">
          <div className="flex items-center gap-3">
            <CaseLabel className="!text-[22px] text-gold">Plan {String(snap.q + 1).padStart(2, '0')} Real-Time Distribution</CaseLabel>
            <span className="label text-[12px] text-gold font-bold bg-ink px-2.5 py-0.5 border border-gold/40 uppercase">
              Current Question Audit
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="label text-[15px] text-paper/90 font-mono">
              Total Responses: <strong className="text-gold font-bold">{totalAnswers.toLocaleString('en-IN')}</strong>
            </span>
            <span className="label bg-ink px-2.5 py-0.5 border border-gold/40 text-[14px] text-gold font-bold">
              Accuracy: {accuracyPct}%
            </span>
          </div>
        </div>

        {/* 2. Current Question Text Box */}
        <div className="mt-3 bg-ink/90 border border-paper/20 p-3.5 rounded">
          <span className="label text-[12px] text-gold font-bold uppercase tracking-wider block mb-1">
            Plan {String(snap.q + 1).padStart(2, '0')} Question:
          </span>
          <p className="font-body text-[24px] font-semibold text-paper leading-snug">
            {snap.text}
          </p>
        </div>

        {/* 3. Verified Correct Answer Plate */}
        <div className={`mt-2.5 flex items-center justify-between border-[3px] px-4 py-2.5 font-body text-[24px] font-bold leading-tight ${OPTION_STYLE[snap.correct]}`}>
          <div className="flex items-center gap-3 truncate">
            <ShapeIcon i={snap.correct} size={32} />
            <span className="truncate">CORRECT: {snap.options[snap.correct]}</span>
          </div>
          <span className="label bg-ink px-2.5 py-1 text-[12px] text-gold border border-gold uppercase tracking-wider shrink-0 font-bold">
            Verified Answer
          </span>
        </div>

        {/* 4. Movie Lore Fact Card */}
        {snap.fact && (
          <div className="mt-2.5 bg-ink/70 border-l-4 border-gold px-3.5 py-2 text-left">
            <p className="font-type text-[16px] text-paper/90 leading-tight">
              <strong className="text-gold uppercase tracking-wide mr-2 font-bold font-sans text-[12px]">[HEIST FACT]</strong>
              {snap.fact}
            </p>
          </div>
        )}
      </div>

      {/* 5. The 4 Option Response Distribution Cards for THIS question */}
      <div className="my-2.5 flex flex-col gap-2.5">
        {snap.options.map((optText, i) => {
          const isCorrect = i === snap.correct;
          const count = dist[i] || 0;
          const pct = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;

          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded border-2 px-3.5 py-2.5 transition-all ${
                isCorrect
                  ? 'border-gold bg-gold/15 shadow-[0_0_15px_rgba(201,162,39,0.35)]'
                  : 'border-paper/20 bg-ink/75'
              }`}
            >
              {/* Animated Progress Fill Bar */}
              <m.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
                className={`absolute inset-y-0 left-0 opacity-25 ${isCorrect ? 'bg-gold' : 'bg-paper/30'}`}
              />

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center font-display text-[18px] font-bold rounded ${
                    isCorrect ? 'bg-gold text-ink' : 'bg-paper/20 text-paper'
                  }`}>
                    {letters[i]}
                  </div>
                  <ShapeIcon i={i} size={22} />
                  <span className={`truncate font-body text-[22px] font-semibold ${isCorrect ? 'text-gold' : 'text-paper'}`}>
                    {optText}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  <span className="label text-[15px] text-paper/85 font-mono">
                    <strong className="text-paper font-bold">{count.toLocaleString('en-IN')}</strong> {count === 1 ? 'Vote' : 'Votes'}
                  </span>
                  <div className="flex items-baseline w-16 justify-end">
                    <span className={`display num text-[30px] font-bold ${isCorrect ? 'text-gold' : 'text-paper'}`}>
                      {pct}%
                    </span>
                  </div>
                  {isCorrect && (
                    <Stamp tone="gold" className="bg-ink text-[12px] px-2 py-0.5 border">
                      Correct
                    </Stamp>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Current Question Quick Stats */}
      <div className="grid grid-cols-3 gap-2.5 pt-1 border-t border-paper/15">
        <div className="bg-ink/80 border border-paper/20 p-2 text-center rounded">
          <p className="label text-[11px] text-gold uppercase tracking-wider">Question Votes</p>
          <p className="display num text-[24px] text-paper mt-0.5">{totalAnswers.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-ink/80 border border-paper/20 p-2 text-center rounded">
          <p className="label text-[11px] text-gold uppercase tracking-wider">Question Accuracy</p>
          <p className="display num text-[24px] text-gold mt-0.5">{accuracyPct}%</p>
        </div>
        <div className="bg-ink/80 border border-paper/20 p-2 text-center rounded">
          <p className="label text-[11px] text-gold uppercase tracking-wider">Question Phase</p>
          <p className="display text-[18px] text-paper uppercase mt-1">LOCKED & REVEALED</p>
        </div>
      </div>
    </div>
  );
}
