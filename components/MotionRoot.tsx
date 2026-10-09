'use client';
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import type { ReactNode } from 'react';

/** Loads only the small DOM animation feature set; honours prefers-reduced-motion. */
export default function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
