// 24 Authentic Money Heist Character & Mask Vector Avatars
// Handcrafted vector portraits of iconic characters and masks from La Casa De Papel
import type { ReactNode } from 'react';

const INK = '#0B0B0C';
const PLATE = '#151516';
const RED = '#C8102E';
const DEEP = '#7A0A1A';
const GOLD = '#C9A227';
const PAPER = '#E8E1D0';
const SKIN = '#F3D2B8';
const SKIN_SHADOW = '#D9A98A';
const HAIR_DARK = '#1C1515';
const BLONDE = '#E6C568';
const AUBURN = '#9E3C22';
const GREY_HAIR = '#7A7A80';

const o = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const op = { ...o, stroke: PAPER, strokeWidth: 2.2 };
const shade = { fill: INK, opacity: 0.22 };

interface Def {
  name: string;
  role: string;
  ring: string;
  draw: () => ReactNode;
}

export const AVATARS: Def[] = [
  // 0: The Professor
  {
    name: 'The Professor',
    role: 'Mastermind',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M18 92 Q22 72 50 68 Q78 72 82 92Z" fill={INK} {...op} />
        <path d="M41 68 L50 81 L59 68Z" fill={PAPER} {...o} />
        <path d="M48 72 H52 L53.5 86 L50 90 L46.5 86Z" fill={RED} {...o} strokeWidth={2} />
        <ellipse cx="50" cy="45" rx="16" ry="19" fill={SKIN} {...o} />
        <path d="M38 52 Q50 63 62 52 Q62 61 50 64 Q38 61 38 52Z" fill={HAIR_DARK} {...o} />
        <path d="M31 39 Q30 18 50 19 Q70 18 69 39 Q60 27 50 28 Q40 27 31 39Z" fill={HAIR_DARK} {...o} />
        <rect x="36" y="38" width="12" height="10" rx="2" fill="none" stroke={INK} strokeWidth={2.4} />
        <rect x="52" y="38" width="12" height="10" rx="2" fill="none" stroke={INK} strokeWidth={2.4} />
        <path d="M48 43 H52" stroke={INK} strokeWidth={2.4} />
        <circle cx="42" cy="43" r="1.6" fill={INK} />
        <circle cx="58" cy="43" r="1.6" fill={INK} />
      </g>
    ),
  },

  // 1: Tokyo
  {
    name: 'Tokyo',
    role: 'Gunner & Narrator',
    ring: RED,
    draw: () => (
      <g>
        <path d="M22 92 Q26 72 50 70 Q74 72 78 92Z" fill={RED} {...o} />
        <ellipse cx="50" cy="48" rx="15" ry="18" fill={SKIN} {...o} />
        <rect x="42" y="63" width="16" height="4" rx="2" fill={INK} />
        <circle cx="50" cy="65" r="2" fill={RED} />
        <path d="M30 46 Q26 22 50 20 Q74 22 70 46 L68 56 Q67 44 65 44 L65 34 Q50 38 35 34 L35 44 Q33 44 32 56Z" fill={HAIR_DARK} {...o} />
        <path d="M34 37 Q50 42 66 37" fill={HAIR_DARK} stroke={INK} strokeWidth={2} />
        <path d="M37 46 L45 44M63 46 L55 44" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
        <ellipse cx="42" cy="48" rx="2.5" ry="1.8" fill={INK} />
        <ellipse cx="58" cy="48" rx="2.5" ry="1.8" fill={INK} />
        <path d="M45 58 Q50 61 55 58" fill="none" stroke={RED} strokeWidth={2.2} strokeLinecap="round" />
      </g>
    ),
  },

  // 2: Berlin
  {
    name: 'Berlin',
    role: 'Commander',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M20 92 Q24 72 50 68 Q76 72 80 92Z" fill={DEEP} {...o} />
        <path d="M43 68 L50 80 L57 68Z" fill={PAPER} {...o} />
        <path d="M60 76 L66 73 L68 78Z" fill={GOLD} />
        <ellipse cx="50" cy="45" rx="15" ry="19" fill={SKIN} {...o} />
        <path d="M32 37 Q33 18 50 17 Q67 18 68 37 Q60 26 50 27 Q40 26 32 37Z" fill={HAIR_DARK} {...o} />
        <path d="M38 41 Q43 38 47 41M53 41 Q57 37 62 39" stroke={INK} strokeWidth={2.2} fill="none" />
        <circle cx="43" cy="46" r="2" fill={INK} />
        <circle cx="57" cy="46" r="2" fill={INK} />
        <path d="M46 56 Q51 59 56 55" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      </g>
    ),
  },

  // 3: Nairobi
  {
    name: 'Nairobi',
    role: 'Quality Lead',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M22 92 Q26 72 50 70 Q74 72 78 92Z" fill={RED} {...o} />
        <circle cx="31" cy="52" r="4.5" fill="none" stroke={GOLD} strokeWidth={2.5} />
        <circle cx="69" cy="52" r="4.5" fill="none" stroke={GOLD} strokeWidth={2.5} />
        <ellipse cx="50" cy="47" rx="15" ry="18" fill={SKIN} {...o} />
        <circle cx="43" cy="56" r="1.2" fill={INK} />
        <path d="M28 48 Q26 18 50 18 Q74 18 72 48 Q70 66 68 70 Q66 50 64 42 Q50 36 36 42 Q34 50 32 70Z" fill={HAIR_DARK} {...o} />
        <path d="M36 43 Q42 39 46 42M54 42 Q58 39 64 43" stroke={INK} strokeWidth={2.4} fill="none" />
        <ellipse cx="42" cy="47" rx="2.5" ry="2" fill={INK} />
        <ellipse cx="58" cy="47" rx="2.5" ry="2" fill={INK} />
        <path d="M44 58 Q50 63 56 58" fill="none" stroke={RED} strokeWidth={2.8} strokeLinecap="round" />
      </g>
    ),
  },

  // 4: Rio
  {
    name: 'Rio',
    role: 'Hacker',
    ring: RED,
    draw: () => (
      <g>
        <path d="M22 92 Q26 74 50 71 Q74 74 78 92Z" fill={RED} {...o} />
        <ellipse cx="50" cy="48" rx="15" ry="18" fill={SKIN} {...o} />
        <path d="M31 38 Q30 20 50 19 Q70 20 69 38 Q66 26 50 25 Q34 26 31 38Z" fill={HAIR_DARK} {...o} />
        <circle cx="37" cy="27" r="5" fill={HAIR_DARK} />
        <circle cx="48" cy="24" r="5" fill={HAIR_DARK} />
        <circle cx="61" cy="26" r="5" fill={HAIR_DARK} />
        <circle cx="68" cy="47" r="3" fill={GOLD} {...o} />
        <path d="M68 47 Q64 56 58 56" fill="none" stroke={INK} strokeWidth={1.8} />
        <circle cx="43" cy="47" r="2.2" fill={INK} />
        <circle cx="57" cy="47" r="2.2" fill={INK} />
        <path d="M46 58 Q50 61 54 58" fill="none" stroke={INK} strokeWidth={2} />
      </g>
    ),
  },

  // 5: Denver
  {
    name: 'Denver',
    role: 'Bruiser & Heart',
    ring: RED,
    draw: () => (
      <g>
        <path d="M20 92 Q24 72 50 68 Q76 72 80 92Z" fill={RED} {...o} />
        <path d="M47 68 V86" stroke={GOLD} strokeWidth={2.8} />
        <ellipse cx="50" cy="46" rx="16" ry="19" fill={SKIN} {...o} />
        <path d="M32 38 Q32 18 50 18 Q68 18 68 38 Q63 26 50 27 Q37 26 32 38Z" fill={HAIR_DARK} {...o} />
        <path d="M37 41 L45 42M55 42 L63 41" stroke={INK} strokeWidth={2.4} />
        <circle cx="42" cy="46" r="2.2" fill={INK} />
        <circle cx="58" cy="46" r="2.2" fill={INK} />
        <path d="M42 56 Q50 66 58 56 Z" fill={PAPER} stroke={INK} strokeWidth={2} />
      </g>
    ),
  },

  // 6: Helsinki
  {
    name: 'Helsinki',
    role: 'Heavy Artillery',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M16 92 Q22 68 50 66 Q78 68 84 92Z" fill={RED} {...o} />
        <ellipse cx="50" cy="44" rx="18" ry="20" fill={SKIN} {...o} />
        <path d="M30 46 Q30 76 50 78 Q70 76 70 46 Q64 56 50 56 Q36 56 30 46Z" fill={HAIR_DARK} {...o} />
        <circle cx="42" cy="42" r="2.4" fill={INK} />
        <circle cx="58" cy="42" r="2.4" fill={INK} />
        <path d="M36 38 L46 39M54 39 L64 38" stroke={INK} strokeWidth={2.8} />
        <path d="M68 62 L74 66" stroke={DEEP} strokeWidth={2} />
      </g>
    ),
  },

  // 7: Oslo
  {
    name: 'Oslo',
    role: 'Vanguard',
    ring: RED,
    draw: () => (
      <g>
        <path d="M16 92 Q22 68 50 66 Q78 68 84 92Z" fill={RED} {...o} />
        <path d="M30 38 Q30 18 50 18 Q70 18 70 38 Z" fill={INK} {...o} />
        <ellipse cx="50" cy="46" rx="17" ry="18" fill={SKIN} {...o} />
        <path d="M32 48 Q32 74 50 75 Q68 74 68 48 Q62 56 50 56 Q38 56 32 48Z" fill={GREY_HAIR} {...o} />
        <circle cx="42" cy="44" r="2.2" fill={INK} />
        <circle cx="58" cy="44" r="2.2" fill={INK} />
      </g>
    ),
  },

  // 8: Moscow
  {
    name: 'Moscow',
    role: 'Miner & Breacher',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M18 92 Q22 72 50 70 Q78 72 82 92Z" fill={DEEP} {...o} />
        <path d="M26 38 Q26 22 50 20 Q74 22 74 38 L72 42 H28 Z" fill={INK} {...op} />
        <ellipse cx="50" cy="47" rx="16" ry="18" fill={SKIN} {...o} />
        <path d="M32 50 Q32 75 50 76 Q68 75 68 50 Q60 58 50 58 Q40 58 32 50Z" fill={GREY_HAIR} {...o} />
        <circle cx="42" cy="44" r="2" fill={INK} />
        <circle cx="58" cy="44" r="2" fill={INK} />
        <path d="M45 54 Q50 56 55 54" stroke={INK} strokeWidth={2} fill="none" />
      </g>
    ),
  },

  // 9: Lisbon (Raquel Murillo)
  {
    name: 'Lisbon',
    role: 'Negotiator & Co-Pilot',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M20 92 Q24 72 50 70 Q76 72 80 92Z" fill={RED} {...o} />
        <rect x="58" y="14" width="22" height="4" rx="1" fill={GOLD} transform="rotate(25 58 14)" />
        <circle cx="62" cy="24" r="8" fill={HAIR_DARK} />
        <ellipse cx="50" cy="46" rx="15" ry="18" fill={SKIN} {...o} />
        <path d="M32 40 Q32 20 50 20 Q68 20 68 40 Q62 26 50 26 Q38 26 32 40Z" fill={HAIR_DARK} {...o} />
        <circle cx="42" cy="45" r="2.2" fill={INK} />
        <circle cx="58" cy="45" r="2.2" fill={INK} />
        <path d="M45 56 Q50 59 55 56" stroke={RED} strokeWidth={2.4} fill="none" />
      </g>
    ),
  },

  // 10: Stockholm (Mónica Gaztambide)
  {
    name: 'Stockholm',
    role: 'Insurgent',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M22 92 Q26 72 50 70 Q74 72 78 92Z" fill={RED} {...o} />
        <circle cx="32" cy="38" r="9" fill={BLONDE} />
        <circle cx="68" cy="38" r="9" fill={BLONDE} />
        <circle cx="36" cy="52" r="8" fill={BLONDE} />
        <circle cx="64" cy="52" r="8" fill={BLONDE} />
        <ellipse cx="50" cy="46" rx="15" ry="18" fill={SKIN} {...o} />
        <path d="M32 36 Q40 22 50 22 Q60 22 68 36 Z" fill={BLONDE} {...o} />
        <circle cx="43" cy="45" r="2.2" fill={INK} />
        <circle cx="57" cy="45" r="2.2" fill={INK} />
        <path d="M45 56 Q50 60 55 56" stroke={RED} strokeWidth={2.6} fill="none" />
      </g>
    ),
  },

  // 11: Bogotá
  {
    name: 'Bogotá',
    role: 'Chief Welder',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M18 92 Q22 70 50 68 Q78 70 82 92Z" fill={RED} {...o} />
        <ellipse cx="50" cy="46" rx="16" ry="19" fill={SKIN} {...o} />
        <rect x="30" y="26" width="40" height="7" rx="2" fill={INK} {...op} />
        <circle cx="41" cy="29.5" r="3" fill={GOLD} />
        <circle cx="59" cy="29.5" r="3" fill={GOLD} />
        <path d="M32 46 Q32 72 50 74 Q68 72 68 46 Q60 56 50 56 Q40 56 32 46Z" fill={HAIR_DARK} {...o} />
        <circle cx="42" cy="43" r="2" fill={INK} />
        <circle cx="58" cy="43" r="2" fill={INK} />
      </g>
    ),
  },

  // 12: Palermo
  {
    name: 'Palermo',
    role: 'Governor',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M18 92 Q22 72 50 68 Q78 72 82 92Z" fill={INK} {...op} />
        <path d="M43 68 L50 82 L57 68Z" fill={PAPER} {...o} />
        <path d="M47 74 H53 L51 86 H49Z" fill={GOLD} />
        <ellipse cx="50" cy="45" rx="15" ry="19" fill={SKIN} {...o} />
        <path d="M32 36 Q32 18 50 17 Q68 18 68 36 Q62 26 50 27 Q38 26 32 36Z" fill={HAIR_DARK} {...o} />
        <circle cx="42" cy="43" r="6" fill="none" stroke={GOLD} strokeWidth={2.2} />
        <circle cx="58" cy="43" r="6" fill="none" stroke={GOLD} strokeWidth={2.2} />
        <path d="M48 43 H52" stroke={GOLD} strokeWidth={2} />
        <circle cx="42" cy="43" r="1.8" fill={INK} />
        <circle cx="58" cy="43" r="1.8" fill={INK} />
        <path d="M46 56 Q51 59 56 55" stroke={INK} strokeWidth={2.2} fill="none" />
      </g>
    ),
  },

  // 13: Marseille
  {
    name: 'Marseille',
    role: 'Logistics Field Agent',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M18 92 Q22 72 50 68 Q78 72 82 92Z" fill={INK} {...op} />
        <ellipse cx="50" cy="45" rx="15" ry="19" fill={SKIN} {...o} />
        <path d="M30 44 Q28 18 50 17 Q72 18 70 44 Q62 26 50 27 Q38 26 30 44Z" fill={GREY_HAIR} {...o} />
        <path d="M38 52 Q50 49 62 52 Q68 56 64 54 Q56 51 50 55 Q44 51 36 54 Q32 56 38 52Z" fill={HAIR_DARK} {...o} />
        <circle cx="43" cy="43" r="2.2" fill={INK} />
        <circle cx="57" cy="43" r="2.2" fill={INK} />
      </g>
    ),
  },

  // 14: Manila
  {
    name: 'Manila',
    role: 'Infiltrator',
    ring: RED,
    draw: () => (
      <g>
        <path d="M22 92 Q26 72 50 70 Q74 72 78 92Z" fill={RED} {...o} />
        <ellipse cx="50" cy="47" rx="15" ry="18" fill={SKIN} {...o} />
        <path d="M28 48 Q26 18 50 18 Q74 18 72 48 Q70 66 68 72 Q66 48 64 38 Q50 36 36 38 Q34 48 32 72Z" fill={HAIR_DARK} {...o} />
        <circle cx="43" cy="46" r="2.2" fill={INK} />
        <circle cx="57" cy="46" r="2.2" fill={INK} />
        <path d="M44 57 Q50 62 56 57" stroke={RED} strokeWidth={2.8} fill="none" />
      </g>
    ),
  },

  // 15: Alicia Sierra
  {
    name: 'Alicia Sierra',
    role: 'Inspector Inspector',
    ring: RED,
    draw: () => (
      <g>
        <path d="M20 92 Q24 72 50 70 Q76 72 80 92Z" fill={INK} {...op} />
        <circle cx="50" cy="18" r="8" fill={AUBURN} {...o} />
        <ellipse cx="50" cy="46" rx="15" ry="18" fill={SKIN} {...o} />
        <path d="M32 38 Q34 22 50 22 Q66 22 68 38 Q62 26 50 26 Q38 26 32 38Z" fill={AUBURN} {...o} />
        <circle cx="42" cy="45" r="2.2" fill={INK} />
        <circle cx="58" cy="45" r="2.2" fill={INK} />
        <circle cx="59" cy="56" r="4.5" fill={RED} {...o} />
        <path d="M59 56 L64 68" stroke={PAPER} strokeWidth={2.2} />
      </g>
    ),
  },

  // 16: Arturo Román (Arturito)
  {
    name: 'Arturo Román',
    role: 'The Hostage',
    ring: RED,
    draw: () => (
      <g>
        <path d="M20 92 Q24 72 50 70 Q76 72 80 92Z" fill={PLATE} {...op} />
        <rect x="42" y="78" width="16" height="12" fill={PAPER} {...o} />
        <ellipse cx="50" cy="47" rx="16" ry="19" fill={SKIN} {...o} />
        <path d="M34 38 Q42 22 50 24 Q58 22 66 38 Q64 30 50 31 Q36 30 34 38Z" fill={HAIR_DARK} {...o} />
        <path d="M37 40 L45 42M55 42 L63 40" stroke={INK} strokeWidth={2} />
        <ellipse cx="42" cy="45" rx="3" ry="3.5" fill={PAPER} stroke={INK} strokeWidth={1.5} />
        <ellipse cx="58" cy="45" rx="3" ry="3.5" fill={PAPER} stroke={INK} strokeWidth={1.5} />
        <circle cx="42" cy="45" r="1.4" fill={INK} />
        <circle cx="58" cy="45" r="1.4" fill={INK} />
        <ellipse cx="50" cy="58" rx="4" ry="5" fill={INK} />
      </g>
    ),
  },

  // 17: Colonel Tamayo
  {
    name: 'Colonel Tamayo',
    role: 'Police Commander',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M18 92 Q22 72 50 68 Q78 72 82 92Z" fill={PLATE} {...op} />
        <polygon points="50,72 52,77 57,77 53,80 55,85 50,82 45,85 47,80 43,77 48,77" fill={GOLD} />
        <ellipse cx="50" cy="45" rx="16" ry="19" fill={SKIN} {...o} />
        <path d="M33 34 Q33 24 50 24 Q67 24 67 34 Z" fill={GREY_HAIR} {...o} />
        <rect x="36" y="40" width="11" height="9" rx="1" fill="none" stroke={INK} strokeWidth={2} />
        <rect x="53" y="40" width="11" height="9" rx="1" fill="none" stroke={INK} strokeWidth={2} />
        <path d="M47 44 H53" stroke={INK} strokeWidth={2} />
        <circle cx="41.5" cy="44.5" r="1.6" fill={INK} />
        <circle cx="58.5" cy="44.5" r="1.6" fill={INK} />
        <path d="M45 56 H55" stroke={INK} strokeWidth={2.4} />
      </g>
    ),
  },

  // 18: Tatiana
  {
    name: 'Tatiana',
    role: 'Concert Pianist',
    ring: RED,
    draw: () => (
      <g>
        <path d="M22 92 Q26 72 50 70 Q74 72 78 92Z" fill={INK} {...op} />
        <ellipse cx="50" cy="24" rx="20" ry="8" fill={RED} {...o} transform="rotate(-15 50 24)" />
        <circle cx="48" cy="18" r="2.5" fill={RED} />
        <ellipse cx="50" cy="48" rx="15" ry="18" fill={SKIN} {...o} />
        <path d="M32 42 Q32 26 50 26 Q68 26 68 42 L66 60 Q50 36 34 60Z" fill={HAIR_DARK} {...o} />
        <circle cx="43" cy="46" r="2" fill={INK} />
        <circle cx="57" cy="46" r="2" fill={INK} />
        <path d="M45 57 Q50 61 55 57" stroke={RED} strokeWidth={2.6} fill="none" />
      </g>
    ),
  },

  // 19: César Gandía
  {
    name: 'César Gandía',
    role: 'Bank Head of Security',
    ring: RED,
    draw: () => (
      <g>
        <path d="M16 92 Q22 68 50 66 Q78 68 84 92Z" fill={PLATE} {...op} />
        <ellipse cx="50" cy="45" rx="16" ry="19" fill={SKIN} {...o} />
        <path d="M33 30 Q33 24 50 24 Q67 24 67 30 Z" fill={HAIR_DARK} {...o} />
        <circle cx="67" cy="46" r="2.5" fill={INK} />
        <path d="M67 46 Q62 55 56 55" fill="none" stroke={INK} strokeWidth={1.5} />
        <circle cx="42" cy="43" r="2" fill={INK} />
        <circle cx="58" cy="43" r="2" fill={INK} />
        <path d="M38 38 L46 40M54 40 L62 38" stroke={INK} strokeWidth={2.6} />
        <path d="M39 48 L44 54" stroke={RED} strokeWidth={1.8} />
      </g>
    ),
  },

  // 20: Classic Salvador Dalí Mask
  {
    name: 'Dalí Mask (Classic)',
    role: 'Heist Symbol',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M29 27 Q50 18 71 27 Q76 52 67 67 Q59 82 50 84 Q41 82 33 67 Q24 52 29 27Z" fill={PAPER} {...o} />
        <path d="M60 22 Q73 25 71 27 Q76 52 67 67 Q59 82 50 84 Q58 66 60 22Z" {...shade} />
        <circle cx="38" cy="55" r="3.2" fill={RED} />
        <circle cx="62" cy="55" r="3.2" fill={RED} />
        <path d="M36 36 Q41 33 47 36M53 36 Q59 33 64 36" stroke={INK} strokeWidth={2} fill="none" />
        <path d="M36 43 Q41 38 47 43 Q41 46 36 43Z" fill={INK} />
        <path d="M53 43 Q59 38 64 43 Q59 46 53 43Z" fill={INK} />
        <path d="M50 62 Q43 57 34 60 Q31 61 32 58M50 62 Q57 57 66 60 Q69 61 68 58" stroke={INK} strokeWidth={2.4} fill="none" />
        <path d="M45 69 Q50 71 55 69" stroke={INK} strokeWidth={2.2} fill="none" />
        <path d="M47 75 Q50 80 53 75Z" fill={INK} />
      </g>
    ),
  },

  // 21: Red Hooded Heist Mask
  {
    name: 'Hooded Dalí Mask',
    role: 'Combat Uniform',
    ring: RED,
    draw: () => (
      <g>
        <path d="M16 92 Q20 70 50 66 Q80 70 84 92Z" fill={RED} {...o} />
        <path d="M27 67 Q19 38 50 17 Q81 38 73 67 Q61 73 50 73 Q39 73 27 67Z" fill={RED} {...o} />
        <ellipse cx="50" cy="47" rx="19" ry="23" fill={INK} />
        <g transform="translate(50 48) scale(.56) translate(-50 -52)">
          <path d="M29 27 Q50 18 71 27 Q76 52 67 67 Q59 82 50 84 Q41 82 33 67 Q24 52 29 27Z" fill={PAPER} {...o} />
          <circle cx="38" cy="55" r="3.2" fill={RED} />
          <circle cx="62" cy="55" r="3.2" fill={RED} />
          <path d="M36 43 Q41 38 47 43 Q41 46 36 43Z" fill={INK} />
          <path d="M53 43 Q59 38 64 43 Q59 46 53 43Z" fill={INK} />
          <path d="M50 62 Q43 57 34 60M50 62 Q57 57 66 60" stroke={INK} strokeWidth={3} fill="none" />
        </g>
        <path d="M50 74 V92" stroke={GOLD} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    ),
  },

  // 22: Royal Mint Gold Mask
  {
    name: 'Royal Mint Gold Mask',
    role: 'Treasure Edition',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M29 27 Q50 18 71 27 Q76 52 67 67 Q59 82 50 84 Q41 82 33 67 Q24 52 29 27Z" fill={GOLD} {...o} />
        <circle cx="38" cy="55" r="3.2" fill={DEEP} />
        <circle cx="62" cy="55" r="3.2" fill={DEEP} />
        <path d="M36 43 Q41 38 47 43 Q41 46 36 43Z" fill={INK} />
        <path d="M53 43 Q59 38 64 43 Q59 46 53 43Z" fill={INK} />
        <path d="M50 62 Q43 57 34 60 Q31 61 32 58M50 62 Q57 57 66 60 Q69 61 68 58" stroke={INK} strokeWidth={2.4} fill="none" />
        <path d="M45 69 Q50 71 55 69" stroke={INK} strokeWidth={2.2} fill="none" />
      </g>
    ),
  },

  // 23: Bank of Spain Shadow Mask
  {
    name: 'Shadow Dalí Mask',
    role: 'Special Ops Edition',
    ring: RED,
    draw: () => (
      <g>
        <path d="M29 27 Q50 18 71 27 Q76 52 67 67 Q59 82 50 84 Q41 82 33 67 Q24 52 29 27Z" fill={PLATE} stroke={PAPER} strokeWidth={2.5} />
        <circle cx="38" cy="55" r="3.2" fill={RED} />
        <circle cx="62" cy="55" r="3.2" fill={RED} />
        <path d="M36 43 Q41 38 47 43 Q41 46 36 43Z" fill={RED} />
        <path d="M53 43 Q59 38 64 43 Q59 46 53 43Z" fill={RED} />
        <path d="M50 62 Q43 57 34 60 Q31 61 32 58M50 62 Q57 57 66 60 Q69 61 68 58" stroke={PAPER} strokeWidth={2.4} fill="none" />
        <path d="M45 69 Q50 71 55 69" stroke={RED} strokeWidth={2.2} fill="none" />
      </g>
    ),
  },
];

export const AVATAR_NAMES = AVATARS.map((a) => a.name);

export function getAvatarMeta(id: number) {
  const safeId = ((id % AVATARS.length) + AVATARS.length) % AVATARS.length;
  return AVATARS[safeId];
}

export function Avatar({ id, size = 48, className }: { id: number; size?: number; className?: string }) {
  const safeId = ((id % AVATARS.length) + AVATARS.length) % AVATARS.length;
  const a = AVATARS[safeId];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label={a.name} style={{ flex: 'none' }}>
      <defs>
        <clipPath id={`avclip-${safeId}`}>
          <circle cx="50" cy="50" r="45" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="47" fill={PLATE} stroke={a.ring} strokeWidth={3} />
      <g clipPath={`url(#avclip-${safeId})`}>{a.draw()}</g>
    </svg>
  );
}
