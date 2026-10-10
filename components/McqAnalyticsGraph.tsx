'use client';
import { useState } from 'react';
import { m } from 'framer-motion';
import { CaseLabel, OPTION_STYLE, ShapeIcon, Stamp } from './ui';
import type { Snapshot } from '@/lib/types';

interface Props {
  snap: Snapshot;
}

export function McqAnalyticsGraph({ snap }: Props) {
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
    <div className="flex h-full flex-col justify-between overflow-hidden">
      {/* 1. Header & Live Indicator */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-gold/30">
          <div className="flex items-center gap-3">
            <CaseLabel className="!text-[20px] text-gold">Real-Time Distribution Graph</CaseLabel>
            <span className="label text-[12px] text-gold font-bold bg-ink px-2 py-0.5 border border-gold/40">
              Intelligence Audit
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="label text-[14px] text-paper/80 font-mono">
              Total Responses: <strong className="text-gold font-bold">{totalAnswers.toLocaleString('en-IN')}</strong>
            </span>
            <span className="label bg-ink px-2.5 py-0.5 border border-gold/40 text-[13px] text-gold font-bold">
              Accuracy: {accuracyPct}%
            </span>
          </div>
        </div>

        {/* 2. Question Text Card */}
        <div className="mt-2.5 bg-ink/80 border border-paper/20 p-3 rounded">
          <div className="flex items-center justify-between">
            <span className="label text-[12px] text-gold font-bold uppercase tracking-wider">
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
          <p className="mt-1 line-clamp-2 font-body text-[22px] font-semibold text-paper leading-snug">
            {currentItem.text}
          </p>
        </div>

        {/* 3. Verified Correct Answer Showcase Plate */}
        <div className={`mt-2 flex items-center justify-between border-[3px] px-4 py-2 font-body text-[24px] font-bold leading-tight ${OPTION_STYLE[currentItem.correct]}`}>
          <div className="flex items-center gap-3 truncate">
            <ShapeIcon i={currentItem.correct} size={30} />
            <span className="truncate">CORRECT: {currentItem.options[currentItem.correct]}</span>
          </div>
          <span className="label bg-ink px-2 py-0.5 text-[12px] text-gold border border-gold uppercase tracking-wider shrink-0 font-bold">
            Verified Answer
          </span>
        </div>

        {/* 4. Movie Lore Fact Card (Fills Space with Value) */}
        {snap.fact && (
          <div className="mt-2 bg-ink/60 border-l-4 border-gold px-3 py-1.5 text-left">
            <p className="font-type text-[16px] text-paper/85 leading-tight line-clamp-2">
              <strong className="text-gold uppercase tracking-wide mr-1.5 font-bold font-sans text-[11px]">[HEIST FACT]</strong>
              {snap.fact}
            </p>
          </div>
        )}
      </div>

      {/* 5. The 4 Option Response Distribution Cards */}
      <div className="my-2 flex flex-col gap-2">
        {currentItem.options.map((optText, i) => {
          const isCorrect = i === currentItem.correct;
          const count = dist[i] || 0;
          const pct = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
          const letters = ['A', 'B', 'C', 'D'];

          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded border-2 px-3 py-2 transition-all ${
                isCorrect
                  ? 'border-gold bg-gold/15 shadow-[0_0_12px_rgba(201,162,39,0.3)]'
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
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center font-display text-[16px] font-bold rounded ${
                    isCorrect ? 'bg-gold text-ink' : 'bg-paper/20 text-paper'
                  }`}>
                    {letters[i]}
                  </div>
                  <ShapeIcon i={i} size={20} />
                  <span className={`truncate font-body text-[20px] font-semibold ${isCorrect ? 'text-gold' : 'text-paper'}`}>
                    {optText}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="label text-[14px] text-paper/80 font-mono">
                    <strong className="text-paper font-bold">{count.toLocaleString('en-IN')}</strong> {count === 1 ? 'Vote' : 'Votes'}
                  </span>
                  <div className="flex items-baseline w-14 justify-end">
                    <span className={`display num text-[28px] font-bold ${isCorrect ? 'text-gold' : 'text-paper'}`}>
                      {pct}%
                    </span>
                  </div>
                  {isCorrect && (
                    <Stamp tone="gold" className="bg-ink text-[11px] px-1.5 py-0.5 border">
                      Correct
                    </Stamp>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Quick Stats Metric Cards (Zero Empty Space) */}
      <div className="grid grid-cols-3 gap-2 py-1">
        <div className="bg-ink/80 border border-paper/20 p-2 text-center rounded">
          <p className="label text-[10px] text-gold uppercase tracking-wider">Crew Participants</p>
          <p className="display num text-[22px] text-paper mt-0.5">{totalAnswers.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-ink/80 border border-paper/20 p-2 text-center rounded">
          <p className="label text-[10px] text-gold uppercase tracking-wider">Accuracy Rate</p>
          <p className="display num text-[22px] text-gold mt-0.5">{accuracyPct}%</p>
        </div>
        <div className="bg-ink/80 border border-paper/20 p-2 text-center rounded">
          <p className="label text-[10px] text-gold uppercase tracking-wider">Plan Phase</p>
          <p className="display text-[16px] text-paper uppercase mt-1">LOCKED & REVEALED</p>
        </div>
      </div>

      {/* 7. All MCQs Timeline Strip (Plan 01 to Plan 11) - Fitted with No Overlap */}
      <div className="border-t border-gold/30 pt-2">
        <div className="flex items-center justify-between mb-1">
          <CaseLabel className="!text-[14px] text-gold">All MCQs Performance Matrix</CaseLabel>
          <span className="label text-[11px] text-paper/60 font-mono">Click to inspect any plan</span>
        </div>

        <div className="grid grid-cols-11 gap-1">
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
                title={hasData ? `Plan ${idx + 1}: ${pPct}% accuracy (${pTotal} responses)` : `Plan ${idx + 1}: Upcoming`}
                className={`flex flex-col items-center justify-between p-1 rounded border text-center transition-all ${
                  isSelected
                    ? 'border-gold bg-gold/25 ring-2 ring-gold'
                    : isLive
                      ? 'border-gold bg-ink'
                      : hasData
                        ? 'border-paper/30 bg-ink hover:border-gold'
                        : 'border-paper/10 bg-ink/40 opacity-30 cursor-not-allowed'
                }`}
              >
                <span className={`font-mono text-[10px] font-bold ${isSelected || isLive ? 'text-gold' : 'text-paper/70'}`}>
                  Q{String(idx + 1).padStart(2, '0')}
                </span>
                <div className="my-0.5 h-4 w-full flex items-end justify-center bg-paper/10 rounded overflow-hidden">
                  {hasData ? (
                    <div
                      className="w-full bg-gold transition-all"
                      style={{ height: `${Math.max(20, pPct)}%` }}
                    />
                  ) : (
                    <div className="w-full h-0.5 bg-paper/20" />
                  )}
                </div>
                <span className={`font-type text-[9px] font-bold ${hasData ? 'text-paper' : 'text-paper/40'}`}>
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
