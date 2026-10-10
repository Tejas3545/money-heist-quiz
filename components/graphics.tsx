'use client';

/**
 * Money Heist Vector Illustrations (Strict Theme Palette Only)
 * Palette:
 *  - Ink: #0B0B0C
 *  - Plate: #151516
 *  - Red: #C8102E
 *  - Deep: #7A0A1A
 *  - Gold: #C9A227
 *  - Paper: #E8E1D0
 */

/** Salvador Dalí Heist Mask & Red Hoodie Hero Graphic */
export function HeistMaskGraphic({ className = '', height = 140 }: { className?: string; height?: number }) {
  return (
    <div className={`flex items-center justify-center select-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 280 200"
        height={height}
        className="w-auto max-w-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background shadow & glow */}
        <ellipse cx="140" cy="185" rx="90" ry="12" fill="#0B0B0C" fillOpacity="0.8" />
        <circle cx="140" cy="100" r="75" fill="#7A0A1A" fillOpacity="0.25" />

        {/* Red Hoodie Outer Shape */}
        <path
          d="M70 195 C70 110, 85 45, 140 40 C195 45, 210 110, 210 195 Z"
          fill="#C8102E"
          stroke="#7A0A1A"
          strokeWidth="3"
        />
        {/* Hoodie Depth / Shadow Fold */}
        <path
          d="M85 195 C88 120, 100 65, 140 60 C180 65, 192 120, 195 195"
          fill="#7A0A1A"
        />
        {/* Inner Dark Cavity */}
        <path
          d="M95 195 C98 135, 108 75, 140 72 C172 75, 182 135, 185 195 Z"
          fill="#0B0B0C"
        />

        {/* Dalí Mask Face Base */}
        <path
          d="M106 115 C104 88, 115 78, 140 78 C165 78, 176 88, 174 115 C172 145, 155 178, 140 180 C125 178, 108 145, 106 115 Z"
          fill="#E8E1D0"
          stroke="#0B0B0C"
          strokeWidth="2.5"
        />

        {/* Eyebrows (Distinctive arched Dalí expression) */}
        <path
          d="M115 102 Q125 90, 134 100"
          stroke="#0B0B0C"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M165 102 Q155 90, 146 100"
          stroke="#0B0B0C"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyes & Intense Gaze */}
        <ellipse cx="125" cy="108" rx="4.5" ry="3" fill="#0B0B0C" />
        <ellipse cx="155" cy="108" rx="4.5" ry="3" fill="#0B0B0C" />
        <line x1="116" y1="115" x2="133" y2="114" stroke="#7A0A1A" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="164" y1="115" x2="147" y2="114" stroke="#7A0A1A" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Nose */}
        <path
          d="M140 102 L137 128 L144 128"
          stroke="#0B0B0C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Iconic Dalí Moustache (Pointed Upwards) */}
        <path
          d="M140 137 Q130 137, 118 130 Q112 118, 114 104 Q116 122, 128 135 Q135 140, 140 139 Q145 140, 152 135 Q164 122, 166 104 Q168 118, 162 130 Q150 137, 140 137 Z"
          fill="#0B0B0C"
        />

        {/* Smirk / Mouth */}
        <path
          d="M132 148 Q140 152, 148 148"
          stroke="#7A0A1A"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Chin line */}
        <circle cx="140" cy="164" r="2" fill="#7A0A1A" />

        {/* Red Hoodie Collar Zippers & Lapels */}
        <path d="M125 186 L115 200" stroke="#C9A227" strokeWidth="2.5" />
        <path d="M155 186 L165 200" stroke="#C9A227" strokeWidth="2.5" />
        <line x1="140" y1="184" x2="140" y2="200" stroke="#0B0B0C" strokeWidth="4" />
        <line x1="140" y1="184" x2="140" y2="200" stroke="#C9A227" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}

/** Heavy Steel Bank Vault Wheel Graphic */
export function VaultDoorGraphic({ className = '', height = 130 }: { className?: string; height?: number }) {
  return (
    <div className={`flex items-center justify-center select-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 220 180"
        height={height}
        className="w-auto max-w-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background Vault Door Rim */}
        <rect x="25" y="10" width="170" height="160" rx="6" fill="#151516" stroke="#E8E1D0" strokeWidth="2" strokeOpacity="0.3" />
        {/* Rivets */}
        {[35, 75, 115, 155, 185].map((x, i) => (
          <circle key={`t-${i}`} cx={x} cy="20" r="2.5" fill="#C9A227" />
        ))}
        {[35, 75, 115, 155, 185].map((x, i) => (
          <circle key={`b-${i}`} cx={x} cy="160" r="2.5" fill="#C9A227" />
        ))}

        {/* Circular Outer Gear */}
        <circle cx="110" cy="90" r="56" fill="#0B0B0C" stroke="#C8102E" strokeWidth="4" />
        <circle cx="110" cy="90" r="48" stroke="#E8E1D0" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.4" />

        {/* Vault Locking Bolts radiating outward */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
          const rad = (ang * Math.PI) / 180;
          const x1 = 110 + Math.cos(rad) * 22;
          const y1 = 90 + Math.sin(rad) * 22;
          const x2 = 110 + Math.cos(rad) * 44;
          const y2 = 90 + Math.sin(rad) * 44;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C9A227" strokeWidth="5" strokeLinecap="round" />;
        })}

        {/* Center Hub & Spoke Wheel */}
        <circle cx="110" cy="90" r="22" fill="#151516" stroke="#C9A227" strokeWidth="3" />
        <circle cx="110" cy="90" r="9" fill="#C8102E" stroke="#0B0B0C" strokeWidth="2" />

        {/* 3 Wheel Handles */}
        {[30, 150, 270].map((ang, i) => {
          const rad = (ang * Math.PI) / 180;
          const hx = 110 + Math.cos(rad) * 32;
          const hy = 90 + Math.sin(rad) * 32;
          return (
            <g key={i}>
              <line x1={110} y1={90} x2={hx} y2={hy} stroke="#E8E1D0" strokeWidth="3" strokeLinecap="round" />
              <circle cx={hx} cy={hy} r="4" fill="#C9A227" stroke="#0B0B0C" strokeWidth="1.5" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Classified Dossier / Cover Story Seal Graphic */
export function DossierGraphic({ className = '', height = 120 }: { className?: string; height?: number }) {
  return (
    <div className={`flex items-center justify-center select-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 260 140"
        height={height}
        className="w-auto max-w-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Manila dossier folder back */}
        <path d="M20 15 L100 15 L115 28 L240 28 L240 130 L20 130 Z" fill="#151516" stroke="#C9A227" strokeWidth="2" />
        <line x1="35" y1="45" x2="160" y2="45" stroke="#E8E1D0" strokeWidth="2" strokeOpacity="0.4" />
        <line x1="35" y1="60" x2="140" y2="60" stroke="#E8E1D0" strokeWidth="2" strokeOpacity="0.25" />
        <line x1="35" y1="75" x2="175" y2="75" stroke="#E8E1D0" strokeWidth="2" strokeOpacity="0.25" />
        <line x1="35" y1="90" x2="120" y2="90" stroke="#E8E1D0" strokeWidth="2" strokeOpacity="0.25" />

        {/* ID Photo Card Silhouette */}
        <rect x="180" y="42" width="48" height="58" fill="#0B0B0C" stroke="#E8E1D0" strokeWidth="1.5" />
        <circle cx="204" cy="62" r="11" fill="#C8102E" />
        <path d="M190 88 C190 77, 218 77, 218 88 Z" fill="#7A0A1A" />
        {/* Paperclip */}
        <path d="M195 36 L195 48 C195 52, 202 52, 202 48 L202 38 C202 33, 190 33, 190 40 L190 54" stroke="#C9A227" strokeWidth="1.5" fill="none" />

        {/* Big Stamped "TOP SECRET / RESISTENCIA" */}
        <g transform="translate(42, 98) rotate(-6)">
          <rect x="-4" y="-14" width="130" height="22" stroke="#C8102E" strokeWidth="2" fill="#0B0B0C" fillOpacity="0.9" />
          <text x="6" y="2" fill="#C8102E" fontFamily="var(--font-display), Impact, sans-serif" fontSize="14" letterSpacing="0.2em">
            CONFIDENTIAL
          </text>
        </g>
      </svg>
    </div>
  );
}

/** Banknote Bundles / Heist Loot Stacks Graphic */
export function LootBagsGraphic({ className = '', height = 110 }: { className?: string; height?: number }) {
  return (
    <div className={`flex items-center justify-center select-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 240 120"
        height={height}
        className="w-auto max-w-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Stacks of Currency Straps */}
        {/* Stack 1 (Left) */}
        <rect x="25" y="65" width="75" height="35" rx="3" fill="#151516" stroke="#C9A227" strokeWidth="1.5" />
        <rect x="22" y="55" width="75" height="35" rx="3" fill="#151516" stroke="#E8E1D0" strokeWidth="1.5" strokeOpacity="0.8" />
        <rect x="52" y="55" width="15" height="35" fill="#C8102E" />
        <text x="54" y="78" fill="#E8E1D0" fontSize="10" fontFamily="monospace" fontWeight="bold">€</text>

        {/* Stack 2 (Right) */}
        <rect x="135" y="65" width="75" height="35" rx="3" fill="#151516" stroke="#C9A227" strokeWidth="1.5" />
        <rect x="138" y="55" width="75" height="35" rx="3" fill="#151516" stroke="#E8E1D0" strokeWidth="1.5" strokeOpacity="0.8" />
        <rect x="168" y="55" width="15" height="35" fill="#C8102E" />
        <text x="170" y="78" fill="#E8E1D0" fontSize="10" fontFamily="monospace" fontWeight="bold">€</text>

        {/* Center Stash Pyramided on top */}
        <rect x="80" y="30" width="80" height="38" rx="3" fill="#0B0B0C" stroke="#C9A227" strokeWidth="2" />
        <rect x="112" y="30" width="16" height="38" fill="#C8102E" />
        <circle cx="120" cy="49" r="5" fill="#C9A227" />
        <text x="90" y="54" fill="#C9A227" fontSize="11" fontFamily="var(--font-display), sans-serif">100M</text>
        <text x="133" y="54" fill="#C9A227" fontSize="11" fontFamily="var(--font-display), sans-serif">EUR</text>

        {/* Base shadow */}
        <line x1="15" y1="105" x2="225" y2="105" stroke="#7A0A1A" strokeWidth="3" strokeDasharray="6 4" />
      </svg>
    </div>
  );
}

/** Tactical Blueprint Floorplan Ribbon Graphic */
export function TacticalBlueprintBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden border border-paper/20 bg-ink p-3 relative ${className}`}>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:12px_12px]" />
      <div className="flex items-center justify-between text-[11px] font-mono text-paper/70 tracking-widest uppercase">
        <span className="flex items-center gap-1.5 text-gold font-bold">
          <span className="inline-block w-2 h-2 rounded-full bg-red animate-pulse" />
          VAULT SECTOR 03
        </span>
        <span className="text-paper/40">FREQ 142.85 MHZ</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-paper/50">
        <span>SECURITY PROTOCOL: ESCUDO</span>
        <span className="text-gold">STATUS: ARMED</span>
      </div>
    </div>
  );
}
