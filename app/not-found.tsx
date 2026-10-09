import { Stamp, Tape } from '@/components/ui';

export default function NotFound() {
  return (
    <main className="spill flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Stamp tone="red" className="text-[64px]">404</Stamp>
      <p className="display text-[34px]">Nothing here</p>
      <p className="label max-w-xs text-[12px] text-paper/80">This door is not part of the plan.</p>
      <Tape className="w-48" />
    </main>
  );
}
