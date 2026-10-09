// 24 original flat vector avatars. One style: thick ink outlines, flat fills, one hard shadow cut,
// palette only. Each sits on a dark circular badge with a thin gold or red ring.
import type { ReactNode } from 'react';

const INK = '#0B0B0C';
const PLATE = '#151516';
const RED = '#C8102E';
const DEEP = '#7A0A1A';
const GOLD = '#C9A227';
const PAPER = '#E8E1D0';

const o = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const op = { ...o, stroke: PAPER, strokeWidth: 2.5 };
const shade = { fill: INK, opacity: 0.22 };

type Expr = 'neutral' | 'smirk' | 'surprised' | 'sad' | 'wink';

function Mask({ fill, feat, cheek = RED, ex = 'neutral', tilt = 0, ol = INK }: { fill: string; feat: string; cheek?: string; ex?: Expr; tilt?: number; ol?: string }) {
  const f = { fill: 'none', stroke: feat, strokeLinecap: 'round' as const };
  const crescentL = 'M36 43 Q41 38 47 43 Q41 46 36 43Z';
  const crescentR = 'M53 43 Q59 38 64 43 Q59 46 53 43Z';
  return (
    <g transform={`rotate(${tilt} 50 52)`}>
      <path d="M29 27 Q50 18 71 27 Q76 52 67 67 Q59 82 50 84 Q41 82 33 67 Q24 52 29 27Z" fill={fill} stroke={ol} strokeWidth={3} strokeLinejoin="round" />
      <path d="M60 22 Q73 25 71 27 Q76 52 67 67 Q59 82 50 84 Q58 66 60 22Z" {...shade} />
      <circle cx="38" cy="55" r="3.2" fill={cheek} />
      <circle cx="62" cy="55" r="3.2" fill={cheek} />
      {ex === 'surprised' ? (
        <>
          <path d="M35 33 Q41 29 47 33M53 33 Q59 29 65 33" {...f} strokeWidth={2} />
          <circle cx="41" cy="42" r="3.4" fill={feat} />
          <circle cx="59" cy="42" r="3.4" fill={feat} />
        </>
      ) : ex === 'sad' ? (
        <>
          <path d="M35 38 L47 33M53 33 L65 38" {...f} strokeWidth={2.2} />
          <path d="M37 44 Q42 41 46 44M54 44 Q58 41 63 44" {...f} strokeWidth={2.6} />
        </>
      ) : ex === 'wink' ? (
        <>
          <path d="M36 36 Q41 33 47 36M53 33 Q59 30 64 33" {...f} strokeWidth={2} />
          <path d="M36 43 Q41 47 47 43" {...f} strokeWidth={2.6} />
          <path d={crescentR} fill={feat} />
        </>
      ) : (
        <>
          <path d="M36 36 Q41 33 47 36M53 36 Q59 33 64 36" {...f} strokeWidth={2} />
          <path d={crescentL} fill={feat} />
          <path d={crescentR} fill={feat} />
        </>
      )}
      <path d="M50 62 Q43 57 34 60 Q31 61 32 58M50 62 Q57 57 66 60 Q69 61 68 58" {...f} strokeWidth={2.4} />
      {ex === 'surprised' ? (
        <ellipse cx="50" cy="70" rx="3" ry="3.6" fill={feat} />
      ) : ex === 'sad' ? (
        <path d="M45 72 Q50 67 55 72" {...f} strokeWidth={2.2} />
      ) : ex === 'neutral' ? (
        <path d="M45 69 Q50 71 55 69" {...f} strokeWidth={2.2} />
      ) : (
        <path d="M44 70 Q50 72 57 66" {...f} strokeWidth={2.2} />
      )}
      <path d="M47 75 Q50 80 53 75Z" fill={feat} />
    </g>
  );
}

function Bar({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <path d={`M${x + 4} ${y} H${x + w - 4} L${x + w} ${y + h} H${x}Z`} fill={GOLD} {...o} />
      <path d={`M${x + 8} ${y + 4} H${x + w - 8}`} stroke={PAPER} strokeWidth={2} strokeLinecap="round" />
      <path d={`M${x + w * 0.62} ${y} H${x + w - 4} L${x + w} ${y + h} H${x + w * 0.58}Z`} {...shade} />
    </g>
  );
}

interface Def { name: string; ring: string; draw: () => ReactNode }

const AVATARS: Def[] = [
  { name: 'Classic mask', ring: GOLD, draw: () => <Mask fill={PAPER} feat={INK} /> },
  { name: 'Red mask', ring: RED, draw: () => <Mask fill={RED} feat={PAPER} cheek={DEEP} ex="smirk" tilt={-9} /> },
  { name: 'Gold mask', ring: GOLD, draw: () => <Mask fill={GOLD} feat={INK} cheek={DEEP} tilt={8} /> },
  { name: 'Black mask', ring: RED, draw: () => <Mask fill={INK} feat={PAPER} ol={PAPER} /> },
  { name: 'Startled mask', ring: GOLD, draw: () => <Mask fill={PAPER} feat={INK} ex="surprised" tilt={-12} /> },
  { name: 'Sulking mask', ring: RED, draw: () => <Mask fill={DEEP} feat={PAPER} ex="sad" tilt={6} ol={PAPER} /> },
  { name: 'Winking mask', ring: GOLD, draw: () => <Mask fill={PAPER} feat={INK} ex="wink" tilt={10} /> },
  {
    name: 'Hooded crew',
    ring: RED,
    draw: () => (
      <g>
        <path d="M16 92 Q20 70 50 66 Q80 70 84 92Z" fill={RED} {...o} />
        <path d="M27 67 Q19 38 50 17 Q81 38 73 67 Q61 73 50 73 Q39 73 27 67Z" fill={RED} {...o} />
        <path d="M50 17 Q81 38 73 67 Q66 70 62 71 Q70 44 50 17Z" {...shade} />
        <ellipse cx="50" cy="47" rx="19" ry="23" fill={INK} />
        <g transform="translate(50 48) scale(.52) translate(-50 -52)">
          <Mask fill={PAPER} feat={INK} />
        </g>
        <path d="M50 74 V92" stroke={GOLD} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    ),
  },
  {
    name: 'The Professor',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M18 92 Q22 72 50 68 Q78 72 82 92Z" fill={INK} {...op} />
        <path d="M41 68 L50 81 L59 68Z" fill={PAPER} {...o} />
        <path d="M48 72 H52 L53.5 86 L50 90 L46.5 86Z" fill={RED} {...o} strokeWidth={2} />
        <rect x="44" y="58" width="12" height="12" fill={PAPER} {...o} />
        <ellipse cx="50" cy="44" rx="16" ry="19" fill={PAPER} {...o} />
        <path d="M58 26 Q67 34 66 44 Q65 58 54 62 Q60 48 58 26Z" {...shade} />
        <path d="M33 41 Q32 20 50 21 Q68 20 67 41 Q60 30 50 31 Q40 30 33 41Z" fill={INK} stroke={PAPER} strokeWidth={1.5} strokeLinejoin="round" />
        <circle cx="43" cy="46" r="6.5" fill="none" stroke={INK} strokeWidth={2.6} />
        <circle cx="57" cy="46" r="6.5" fill="none" stroke={INK} strokeWidth={2.6} />
        <path d="M49.5 45 H50.5M34 44 L36.5 45M63.5 45 L66 44" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
        <circle cx="43" cy="46" r="1.5" fill={INK} />
        <circle cx="57" cy="46" r="1.5" fill={INK} />
        <path d="M45 56 Q50 58 55 56" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      </g>
    ),
  },
  {
    name: 'Vault dial',
    ring: RED,
    draw: () => (
      <g>
        <circle cx="50" cy="50" r="34" fill={GOLD} {...o} />
        <path d="M50 16 A34 34 0 0 1 50 84Z" {...shade} />
        <circle cx="50" cy="50" r="24" fill={INK} stroke={PAPER} strokeWidth={2.5} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <line key={i} x1={50 + Math.sin(a) * 27.5} y1={50 - Math.cos(a) * 27.5} x2={50 + Math.sin(a) * 31} y2={50 - Math.cos(a) * 31} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />;
        })}
        <path d="M50 30 V70M30 50 H70" stroke={PAPER} strokeWidth={4.5} strokeLinecap="round" />
        <circle cx="50" cy="50" r="7.5" fill={RED} {...o} />
      </g>
    ),
  },
  {
    name: 'Gold bars',
    ring: GOLD,
    draw: () => (
      <g>
        <Bar x={21} y={62} w={29} h={16} />
        <Bar x={50} y={62} w={29} h={16} />
        <Bar x={35.5} y={45} w={29} h={16} />
      </g>
    ),
  },
  {
    name: 'Cash bundle',
    ring: RED,
    draw: () => (
      <g>
        <rect x="22" y="38" width="56" height="30" fill={PAPER} {...o} transform="rotate(-7 50 53)" />
        <rect x="22" y="38" width="56" height="30" fill={PAPER} {...o} transform="rotate(5 50 53)" />
        <rect x="22" y="40" width="56" height="30" fill={PAPER} {...o} />
        <rect x="27" y="45" width="46" height="20" fill="none" stroke={RED} strokeWidth={1.6} />
        <circle cx="35" cy="55" r="3" fill="none" stroke={RED} strokeWidth={1.6} />
        <rect x="43" y="36" width="14" height="38" fill={RED} {...o} />
        <circle cx="50" cy="55" r="4.5" fill={GOLD} stroke={INK} strokeWidth={2} />
        <path d="M57 40 H78 V70 H57Z" {...shade} />
      </g>
    ),
  },
  {
    name: 'Money bag',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M38 40 Q27 56 30 70 Q34 82 50 82 Q66 82 70 70 Q73 56 62 40Z" fill={GOLD} {...o} />
        <path d="M54 40 H62 Q73 56 70 70 Q66 82 50 82 Q60 66 54 40Z" {...shade} />
        <path d="M38 40 L33 29 L44 34 L50 27 L56 34 L67 29 L62 40Z" fill={GOLD} {...o} />
        <rect x="38" y="38" width="24" height="6" fill={RED} {...o} strokeWidth={2.5} />
        <path d="M55 53 Q44 51 45 57 Q46 61 53 62 Q58 64 56 68 Q54 71 44 69M50 49 V73" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      </g>
    ),
  },
  {
    name: 'Siren',
    ring: RED,
    draw: () => (
      <g>
        <path d="M50 22 V15M31 29 L26 23M69 29 L74 23M23 45 H16M77 45 H84" stroke={GOLD} strokeWidth={3.2} strokeLinecap="round" />
        <rect x="28" y="68" width="44" height="11" fill={INK} {...op} />
        <rect x="33" y="60" width="34" height="9" fill={DEEP} {...o} />
        <path d="M35 60 V48 Q35 31 50 31 Q65 31 65 48 V60Z" fill={RED} {...o} />
        <path d="M56 31.5 Q65 34 65 48 V60 H58 Q60 44 56 31.5Z" {...shade} />
        <path d="M41 51 Q41 39 49 37" fill="none" stroke={PAPER} strokeWidth={3} strokeLinecap="round" />
      </g>
    ),
  },
  {
    name: 'Padlock',
    ring: GOLD,
    draw: () => (
      <g>
        <path d="M39 46 V38 Q39 25 50 25 Q61 25 61 38 V46" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <path d="M39 46 V38 Q39 25 50 25 Q61 25 61 38 V46" fill="none" stroke={PAPER} strokeWidth={4.5} strokeLinecap="round" />
        <rect x="31" y="44" width="38" height="31" fill={GOLD} {...o} />
        <path d="M56 44 H69 V75 H56Z" {...shade} />
        <circle cx="50" cy="56" r="4.5" fill={INK} />
        <path d="M47.5 58 H52.5 L54 67 H46Z" fill={INK} />
      </g>
    ),
  },
  {
    name: 'Key',
    ring: RED,
    draw: () => (
      <g transform="rotate(-35 50 50)">
        <rect x="46" y="45" width="36" height="9" fill={GOLD} {...o} />
        <rect x="66" y="54" width="7" height="10" fill={GOLD} {...o} strokeWidth={2.5} />
        <rect x="76" y="54" width="6" height="7" fill={GOLD} {...o} strokeWidth={2.5} />
        <circle cx="36" cy="50" r="14" fill={GOLD} {...o} />
        <circle cx="36" cy="50" r="5" fill={INK} />
        <path d="M46 36 A14 14 0 0 1 46 64 Q42 50 46 36Z" {...shade} />
      </g>
    ),
  },
  {
    name: 'Fingerprint',
    ring: GOLD,
    draw: () => (
      <g>
        <circle cx="50" cy="50" r="31" fill={RED} {...o} />
        <path d="M50 19 A31 31 0 0 1 50 81 Q66 50 50 19Z" {...shade} />
        <g fill="none" stroke={PAPER} strokeWidth={2.6} strokeLinecap="round">
          <path d="M31 56 Q31 31 50 31 Q69 31 69 54" />
          <path d="M37 64 Q37 39 50 39 Q63 39 63 58" strokeDasharray="16 3" />
          <path d="M43 69 Q43 47 50 47 Q57 47 57 62" />
          <path d="M50 55 V70" />
          <path d="M33 66 Q35 72 40 75" strokeDasharray="5 3" />
        </g>
      </g>
    ),
  },
  {
    name: 'Blueprint',
    ring: RED,
    draw: () => (
      <g>
        <rect x="26" y="36" width="48" height="38" fill={PAPER} {...o} />
        <path d="M38 38 V72M50 38 V72M62 38 V72M28 48 H72M28 60 H72" stroke={RED} strokeWidth={1.2} opacity={0.7} />
        <path d="M31 43 H46 V55 H39 V68 H31Z" fill="none" stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
        <circle cx="62" cy="58" r="5" fill="none" stroke={RED} strokeWidth={2} />
        <path d="M58 38 H74 V74 H58Z" {...shade} />
        <rect x="21" y="26" width="58" height="13" rx="6.5" fill={GOLD} {...o} />
        <circle cx="28" cy="32.5" r="3" fill={INK} />
      </g>
    ),
  },
  {
    name: 'Walkie-talkie',
    ring: GOLD,
    draw: () => (
      <g>
        <rect x="58" y="19" width="5.5" height="19" fill={INK} {...op} strokeWidth={2} />
        <rect x="35" y="34" width="30" height="48" rx="3" fill={RED} {...o} />
        <path d="M55 34 H65 V82 H55Z" {...shade} />
        <rect x="40" y="39" width="20" height="10" fill={GOLD} {...o} strokeWidth={2} />
        <path d="M41 56 H59M41 61 H59M41 66 H59" stroke={PAPER} strokeWidth={2.2} strokeLinecap="round" />
        <rect x="40" y="71" width="8" height="7" fill={INK} />
        <circle cx="56" cy="74.5" r="3.4" fill={PAPER} stroke={INK} strokeWidth={1.6} />
      </g>
    ),
  },
  {
    name: 'Drone',
    ring: RED,
    draw: () => (
      <g>
        <path d="M27 43 V47M73 43 V47" stroke={PAPER} strokeWidth={3} strokeLinecap="round" />
        <path d="M30 47 L41 52M70 47 L59 52" stroke={PAPER} strokeWidth={3.4} strokeLinecap="round" />
        <ellipse cx="27" cy="40" rx="13" ry="3.6" fill={PAPER} {...o} strokeWidth={2.2} />
        <ellipse cx="73" cy="40" rx="13" ry="3.6" fill={PAPER} {...o} strokeWidth={2.2} />
        <path d="M40 63 L36 72M60 63 L64 72" stroke={PAPER} strokeWidth={3} strokeLinecap="round" />
        <path d="M37 50 Q50 41 63 50 L60 61 Q50 65 40 61Z" fill={RED} {...o} />
        <path d="M54 46 Q63 50 63 50 L60 61 Q56 62 54 63Z" {...shade} />
        <circle cx="50" cy="54" r="2.8" fill={GOLD} />
        <circle cx="50" cy="66" r="5" fill={INK} stroke={GOLD} strokeWidth={2.4} />
      </g>
    ),
  },
  {
    name: 'Laptop',
    ring: GOLD,
    draw: () => (
      <g>
        <rect x="27" y="29" width="46" height="32" fill={RED} {...o} />
        <path d="M60 29 H73 V61 H60Z" {...shade} />
        <ellipse cx="50" cy="45" rx="7.5" ry="10" fill={PAPER} stroke={INK} strokeWidth={2} />
        <path d="M46 43 H49M52 43 H55M46 51 Q50 49 54 51" stroke={INK} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        <path d="M21 62 H79 L85 73 H15Z" fill={PAPER} {...o} />
        <rect x="42" y="65" width="16" height="3.2" fill={INK} />
      </g>
    ),
  },
  {
    name: 'Crowbar',
    ring: RED,
    draw: () => (
      <g>
        <path d="M31 75 L61 41 Q67 33 58 27" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <path d="M31 75 L61 41 Q67 33 58 27" fill="none" stroke={RED} strokeWidth={6.5} strokeLinecap="round" />
        <path d="M40 65 L47 57" stroke={GOLD} strokeWidth={6.5} />
        <path d="M31 75 L25 79" stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <path d="M33 72 L61 41" stroke={PAPER} strokeWidth={1.6} opacity={0.55} strokeLinecap="round" />
      </g>
    ),
  },
  {
    name: 'Safe',
    ring: GOLD,
    draw: () => (
      <g>
        <rect x="27" y="27" width="46" height="47" fill={DEEP} {...o} />
        <rect x="32" y="32" width="36" height="37" fill={RED} {...o} strokeWidth={2.5} />
        <path d="M54 32 H68 V69 H54Z" {...shade} />
        <circle cx="50" cy="51" r="9.5" fill={GOLD} {...o} strokeWidth={2.5} />
        <circle cx="50" cy="51" r="3" fill={INK} />
        <path d="M50 42.5 V45.5M50 56.5 V59.5M41.5 51 H44.5M55.5 51 H58.5" stroke={INK} strokeWidth={2} strokeLinecap="round" />
        <rect x="24" y="36" width="4" height="9" fill={INK} stroke={PAPER} strokeWidth={1.2} />
        <rect x="24" y="56" width="4" height="9" fill={INK} stroke={PAPER} strokeWidth={1.2} />
        <rect x="31" y="74" width="9" height="5" fill={INK} stroke={PAPER} strokeWidth={1.4} />
        <rect x="60" y="74" width="9" height="5" fill={INK} stroke={PAPER} strokeWidth={1.4} />
      </g>
    ),
  },
  {
    name: 'Guard cap',
    ring: RED,
    draw: () => (
      <g>
        <path d="M26 55 Q26 28 50 28 Q74 28 74 55Z" fill={INK} {...op} />
        <rect x="26" y="47" width="48" height="9" fill={GOLD} {...o} />
        <path d="M23 59 Q50 72 77 59 L75 54 H25Z" fill={INK} {...op} />
        <path d="M50 31 L56 39 L50 47 L44 39Z" fill={GOLD} {...o} strokeWidth={2} />
        <circle cx="50" cy="39" r="2" fill={RED} />
      </g>
    ),
  },
];

export const AVATAR_NAMES = AVATARS.map((a) => a.name);

export function Avatar({ id, size = 48, className }: { id: number; size?: number; className?: string }) {
  const a = AVATARS[((id % AVATARS.length) + AVATARS.length) % AVATARS.length];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label={a.name} style={{ flex: 'none' }}>
      <defs>
        <clipPath id="avclip">
          <circle cx="50" cy="50" r="45" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="47" fill={PLATE} stroke={a.ring} strokeWidth={3} />
      <g clipPath="url(#avclip)">{a.draw()}</g>
    </svg>
  );
}
