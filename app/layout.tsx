import type { Metadata, Viewport } from 'next';
import { Anton, IBM_Plex_Sans_Condensed, Special_Elite } from 'next/font/google';
import MotionRoot from '@/components/MotionRoot';
import './globals.css';

const display = Anton({ subsets: ['latin'], weight: '400', variable: '--font-display', display: 'swap' });
const body = IBM_Plex_Sans_Condensed({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' });
const type = Special_Elite({ subsets: ['latin'], weight: '400', variable: '--font-type', display: 'swap' });

export const metadata: Metadata = {
  title: 'Code Carnival 3.0 - Heist Day',
  description: 'Atmiya Developer Students Club. Operation Code Carnival.',
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { themeColor: '#0B0B0C', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${type.variable}`}>
      <body>
        <MotionRoot>{children}</MotionRoot>
      </body>
    </html>
  );
}
