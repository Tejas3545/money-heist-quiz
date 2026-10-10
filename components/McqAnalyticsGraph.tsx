'use client';
import { useState } from 'react';
import { m } from 'framer-motion';
import { CaseLabel, OPTION_STYLE, ShapeIcon, Stamp } from './ui';
import type { Snapshot } from '@/lib/types';

interface Props {
  snap: Snapshot;
}

export function McqAnalyticsGraph({ snap }: Props) {
  // Allow user / host on screen-live to view any plan from history, default to current plan
  const [selectedQ, setSelectedQ] = useState(snap.q);

  const history = snap.history && snap.history.length > 0
    ? snap.history
    : [{
        q: snap.q,
        text: snap.text,
        options: snap.options,
        correct: snap.correct,
        dist: snap.dist,
        answered: snap.answered,
      }];

  const currentItem = history.find((h) => h.q === selectedQ) || {
    q: snap.q,
    text: snap.text,
    options: snap.options,
    correct: snap.correct,
    dist: snap.dist,
    answered: snap.answered,
  };

  const dist = currentItem.dist || [0, 0, 0, 0];
  const totalAnswers = dist.reduce((a, b) => a + b, 0) || currentItem.answered || 0;
  const correctCount = dist[currentItem.correct] || 0;
  const accuracyPct = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Header with Plan Selector / Navigation Pills */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-gold/30">
          <div className="flex items-center gap-3">
            <CaseLabel className="!text-[22px] text-gold">Real-Time Distribution Graph</CaseLabel>
            <span className="label text-[13px] text-gold font-bold bg-ink px-2 py-0.5 border border-gold/40">
              Crew Breakdown
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="label text-[14px] text-paper/70 font-mono">
              Total Responses: <strong className="text-gold">{totalAnswers.toLocaleString('en-IN')}</strong>
            </span>
            <span className="label bg-ink px-2 py-0.5 border border-paper/30 text-[13px] text-paper font-bold">
              Accuracy: <strong className="text-gold">{accuracyPct}%</strong>
            </span>
          </div>
        </div>

        {/* Selected Plan Details & Correct Option Banner */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-left">
            <span className="label text-[14px] text-gold font-bold uppercase tracking-wider">
              Plan {String(currentItem.q + 1).padStart(2, '0')} Question:
            </span>
            {selectedQ !== snap.q && (
              <button
                type="button"
                onClick={() => setSelectedQ(snap.q)}
                className="label text-[12px] text-gold underline hover:text-paper"
              >
                Jump to Live Plan {snap.q + 1}
              </button>
            )}
          </div>
          <p className="mt-1 line-clamp-1 font-body text-[24px] font-semibold text-paper/90 text-left">
            {currentItem.text}
          </p>

          <div className={`mt-2 flex items-center justify-between border-[3px] px-4 py-2 font-body text-[26px] font-bold leading-tight ${OPTION_STYLE[currentItem.correct]}`}>
            <div className="flex items-center gap-3 truncate">
              <ShapeIcon i={currentItem.correct} size={34} />
              <span className="truncate">CORRECT: {currentItem.options[currentItem.correct]}</span>
            </div>
            <span className="label bg-ink px-2.5 py-1 text-[13px] text-gold border border-gold uppercase tracking-wider shrink-0">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main 4-Option Distribution Bars & Member Percentages */}
      <div className="my-3 flex flex-col gap-2.5">
        {currentItem.options.map((optText, i) => {
          const isCorrect = i === currentItem.correct;
          const count = dist[i] || 0;
          const pct = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
          const letters = ['A', 'B', 'C', 'D'];

          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded border-2 p-2.5 transition-all ${
                isCorrect
                  ? 'border-gold bg-gold/10 shadow-[0_0_15px_rgba(201,162,39,0.25)]'
                  : 'border-paper/20 bg-ink/70'
              }`}
            >
              {/* Animated Progress Fill Bar */}
              <m.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
                className={`absolute inset-y-0 left-0 opacity-25 ${isCorrect ? 'bg-gold' : 'bg-paper/40'}`}
              />

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center font-display text-[18px] font-bold ${
                    isCorrect ? 'bg-gold text-ink' : 'bg-paper/20 text-paper'
                  }`}>
                    {letters[i]}
                  </div>
                  <ShapeIcon i={i} size={24} />
                  <span className={`truncate font-body text-[22px] font-semibold ${isCorrect ? 'text-gold' : 'text-paper'}`}>
                    {optText}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="label text-[16px] text-paper/80 font-mono">
                    <strong className="text-paper font-bold">{count.toLocaleString('en-IN')}</strong> {count === 1 ? 'Member' : 'Members'}
                  </span>
                  <div className="flex items-baseline w-16 justify-end">
                    <span className={`display num text-[32px] font-bold ${isCorrect ? 'text-gold' : 'text-paper'}`}>
                      {pct}%
                    </span>
                  </div>
                  {isCorrect && (
                    <Stamp tone="gold" className="bg-ink text-[12px] px-1.5 py-0.5 border">
                      Correct
                    </Stamp>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All MCQs Timeline Strip (Plan 01 to Plan 11) */}
      <div className="border-t border-gold/30 pt-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <CaseLabel className="!text-[16px] text-gold">All MCQs Performance Matrix</CaseLabel>
          <span className="label text-[12px] text-paper/60 font-mono">Click any plan to inspect answers</span>
        </div>

        <div className="grid grid-cols-11 gap-1.5">
          {Array.from({ length: 11 }, (_, idx) => {
            const planData = history.find((h) => h.q === idx);
            const isLive = idx === snap.q;
            const isSelected = idx === selectedQ;
            const hasData = !!planData;

            const pTotal = planData ? planData.dist.reduce((a, b) => a + b, 0) : 0;
            const pCorrect = planData ? planData.dist[planData.correct] || 0 : 0;
            const pPct = pTotal > 0 ? Math.round((pCorrect / pTotal) * 100) : 0;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (hasData) setSelectedQ(idx);
                }}
                disabled={!hasData}
                title={hasData ? `Plan ${idx + 1}: ${pPct}% accuracy (${pTotal} members)` : `Plan ${idx + 1}: Upcoming`}
                className={`flex flex-col items-center justify-between p-1 rounded border text-center transition-all ${
                  isSelected
                    ? 'border-gold bg-gold/25 ring-2 ring-gold'
                    : isLive
                      ? 'border-gold bg-ink'
                      : hasData
                        ? 'border-paper/30 bg-ink hover:border-gold'
                        : 'border-paper/10 bg-ink/40 opacity-40 cursor-not-allowed'
                }`}
              >
                <span className={`font-mono text-[11px] font-bold ${isSelected || isLive ? 'text-gold' : 'text-paper/70'}`}>
                  Q{String(idx + 1).padStart(2, '0')}
                </span>
                <div className="my-0.5 h-6 w-full flex items-end justify-center bg-paper/10 rounded overflow-hidden">
                  {hasData ? (
                    <div
                      className="w-full bg-gold transition-all"
                      style={{ height: `${Math.max(15, pPct)}%` }}
                    />
                  ) : (
                    <div className="w-full h-1 bg-paper/20" />
                  )}
                </div>
                <span className={`font-type text-[10px] font-bold ${hasData ? 'text-paper' : 'text-paper/40'}`}>
                  {hasData ? `${pPct}%` : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
