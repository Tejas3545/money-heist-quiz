// 24 Authentic Money Heist Character & Mask Avatars
// High-fidelity character portraits from La Casa De Papel (Money Heist)

const RED = '#C8102E';
const GOLD = '#C9A227';

export interface Def {
  name: string;
  role: string;
  ring: string;
  objectPos?: string;
}

export const AVATARS: Def[] = [
  // 0: The Professor
  { name: 'The Professor', role: 'Mastermind (Sergio Marquina)', ring: GOLD, objectPos: 'object-top' },
  // 1: Tokyo
  { name: 'Tokyo', role: 'Gunner & Narrator (Silene Oliveira)', ring: RED, objectPos: 'object-top' },
  // 2: Berlin
  { name: 'Berlin', role: 'Commander (Andrés de Fonollosa)', ring: GOLD, objectPos: 'object-top' },
  // 3: Nairobi
  { name: 'Nairobi', role: 'Quality Lead (Ágata Jiménez)', ring: GOLD, objectPos: 'object-top' },
  // 4: Rio
  { name: 'Rio', role: 'Hacker & Tech (Aníbal Cortés)', ring: RED, objectPos: 'object-top' },
  // 5: Denver
  { name: 'Denver', role: 'Demolitions & Muscle (Daniel Ramos)', ring: RED, objectPos: 'object-top' },
  // 6: Helsinki
  { name: 'Helsinki', role: 'Heavy Arms (Mirko Dragic)', ring: RED, objectPos: 'object-top' },
  // 7: Moscow
  { name: 'Moscow', role: 'Mining Specialist (Agustín Ramos)', ring: RED, objectPos: 'object-top' },
  // 8: Oslo
  { name: 'Oslo', role: 'Infiltrator (Radko Dragic)', ring: RED, objectPos: 'object-top' },
  // 9: Stockholm
  { name: 'Stockholm', role: 'Operative (Mónica Gaztambide)', ring: RED, objectPos: 'object-top' },
  // 10: Lisbon
  { name: 'Lisbon', role: 'Strategic Lead (Raquel Murillo)', ring: GOLD, objectPos: 'object-top' },
  // 11: Palermo
  { name: 'Palermo', role: 'Chaos Architect (Martín Berrote)', ring: GOLD, objectPos: 'object-top' },
  // 12: Bogotá
  { name: 'Bogotá', role: 'Deep Welder (Santiago Lopez)', ring: RED, objectPos: 'object-top' },
  // 13: Marseille
  { name: 'Marseille', role: 'Logistics & Smuggler (Luka)', ring: RED, objectPos: 'object-top' },
  // 14: Manila
  { name: 'Manila', role: 'Inside Operative (Julia)', ring: RED, objectPos: 'object-top' },
  // 15: Alicia Sierra
  { name: 'Alicia Sierra', role: 'Master Interrogator', ring: GOLD, objectPos: 'object-top' },
  // 16: Colonel Tamayo
  { name: 'Colonel Tamayo', role: 'Task Force Lead', ring: RED, objectPos: 'object-top' },
  // 17: Arturo Román
  { name: 'Arturo Román', role: 'Hostage Saboteur', ring: RED, objectPos: 'object-top' },
  // 18: César Gandía
  { name: 'César Gandía', role: 'Governor Security Chief', ring: RED, objectPos: 'object-top' },
  // 19: Tatiana
  { name: 'Tatiana', role: 'Pianist & Master Thief', ring: GOLD, objectPos: 'object-top' },
  // 20: Rafael
  { name: 'Rafael', role: 'Electronics Prodigy', ring: RED, objectPos: 'object-top' },
  // 21: Salvador Dalí Mask
  { name: 'Salvador Dalí Mask', role: 'Symbol of Resistance', ring: RED, objectPos: 'object-center' },
  // 22: Royal Mint Gold Mask
  { name: 'Royal Mint Gold Mask', role: 'Treasure Edition', ring: GOLD, objectPos: 'object-center' },
  // 23: Bank of Spain Shadow Mask
  { name: 'Shadow Dalí Mask', role: 'Special Ops Edition', ring: RED, objectPos: 'object-center' },
];

export const AVATAR_NAMES = AVATARS.map((a) => a.name);

export function getAvatarMeta(id: number): Def {
  const safeId = ((id % AVATARS.length) + AVATARS.length) % AVATARS.length;
  return AVATARS[safeId];
}

export function Avatar({ id, size = 48, className }: { id: number; size?: number; className?: string }) {
  const safeId = ((id % AVATARS.length) + AVATARS.length) % AVATARS.length;
  const a = AVATARS[safeId];
  const imgSrc = `/avatars/avatar_${safeId}.jpg`;
  const borderWidth = Math.max(2, Math.round(size * 0.045));

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden select-none bg-[#151516] transition-transform ${className || ''}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        border: `${borderWidth}px solid ${a.ring}`,
        boxShadow: `0 0 8px rgba(0,0,0,0.6)`,
      }}
      title={`${a.name} — ${a.role}`}
    >
      <img
        src={imgSrc}
        alt={a.name}
        className={`w-full h-full object-cover ${a.objectPos || 'object-top'} rounded-full pointer-events-none`}
        loading="lazy"
      />
    </div>
  );
}
