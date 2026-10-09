import type { Config } from 'tailwindcss';

// The palette is the ONLY colour set. Values live in CSS variables (globals.css).
const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      ink: c('ink'), // #0B0B0C heist black
      plate: c('plate'), // #151516 charcoal
      red: c('red'), // #C8102E heist red
      deep: c('deep'), // #7A0A1A deep red
      alarm: c('alarm'), // #E5192B alarm red (last 3 seconds / alerts only)
      gold: c('gold'), // #C9A227 vault gold
      paper: c('paper'), // #E8E1D0 aged paper
    },
    borderRadius: { none: '0', sm: '1px', DEFAULT: '2px', md: '2px', full: '9999px' },
    fontFamily: {
      display: ['var(--font-display)', 'Impact', 'Arial Narrow', 'sans-serif'],
      body: ['var(--font-body)', 'Arial Narrow', 'sans-serif'],
      type: ['var(--font-type)', 'Courier New', 'monospace'],
    },
    extend: {
      boxShadow: {
        press: '0 4px 0 0 rgb(var(--ink))',
        hard: '5px 5px 0 0 rgb(var(--deep))',
      },
      keyframes: {
        scan: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(400%)' } },
        fall: {
          '0%': { transform: 'translate3d(0,-20vh,0) rotate(var(--r0))' },
          '100%': { transform: 'translate3d(var(--dx),120vh,0) rotate(var(--r1))' },
        },
        stampdown: {
          '0%': { transform: 'scale(2.4) rotate(-8deg)', opacity: '0' },
          '60%': { transform: 'scale(1) rotate(-4deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-4deg)', opacity: '1' },
        },
      },
      animation: {
        scan: 'scan 1.6s linear infinite',
        stamp: 'stampdown .22s cubic-bezier(.6,0,.9,.4) both',
      },
    },
  },
  plugins: [],
};

export default config;
