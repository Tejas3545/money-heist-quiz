import type { Metadata } from 'next';
import ScreenApp from '@/components/screen/ScreenApp';

export const metadata: Metadata = { title: 'Heist Day - Screen', robots: { index: false, follow: false } };

export default function Page() {
  return <ScreenApp />;
}
