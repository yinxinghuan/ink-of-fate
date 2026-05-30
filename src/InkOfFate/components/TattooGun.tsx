// Stylized side-view tattoo machine — inline SVG so it animates cleanly
// with CSS (jitter + spark + slow pan across the canvas).

interface Props {
  className?: string;
}

export default function TattooGun({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 130"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="iof-gun-grip" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3a141a" />
          <stop offset="50%" stopColor="#1a0608" />
          <stop offset="100%" stopColor="#0a0204" />
        </linearGradient>
        <linearGradient id="iof-gun-frame" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#48131a" />
          <stop offset="100%" stopColor="#1a0608" />
        </linearGradient>
        <radialGradient id="iof-gun-coil" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0%" stopColor="#a83040" />
          <stop offset="60%" stopColor="#5a141c" />
          <stop offset="100%" stopColor="#0a0204" />
        </radialGradient>
      </defs>

      {/* Cord (from back of grip down off-screen) */}
      <path
        d="M 48 110 Q 28 122, 6 128"
        stroke="#0a0204"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Vertical grip */}
      <rect x="38" y="14" width="22" height="98" fill="url(#iof-gun-grip)" rx="3" />
      <rect x="38" y="22" width="22" height="3" fill="#0a0204" opacity="0.6" />
      <rect x="38" y="36" width="22" height="3" fill="#0a0204" opacity="0.6" />
      <rect x="38" y="50" width="22" height="3" fill="#0a0204" opacity="0.6" />
      <rect x="38" y="64" width="22" height="3" fill="#0a0204" opacity="0.6" />
      <rect x="38" y="78" width="22" height="3" fill="#0a0204" opacity="0.6" />
      <rect x="38" y="92" width="22" height="3" fill="#0a0204" opacity="0.6" />

      {/* Body frame (the L that holds the coil + barrel) */}
      <path
        d="M 60 26 L 130 26 L 130 86 L 100 86 L 100 60 L 60 60 Z"
        fill="url(#iof-gun-frame)"
        stroke="#0a0204"
        strokeWidth="1.5"
      />

      {/* Coil — the spinning round one */}
      <circle cx="92" cy="45" r="18" fill="url(#iof-gun-coil)" />
      <circle cx="92" cy="45" r="10" fill="#0a0204" />
      <circle cx="92" cy="45" r="3.5" fill="#a83040" />
      {/* Inner copper hint */}
      <circle cx="92" cy="45" r="14" fill="none" stroke="#7a1a1a" strokeWidth="1" opacity="0.7" />

      {/* Side coil */}
      <circle cx="118" cy="45" r="11" fill="#5a141c" />
      <circle cx="118" cy="45" r="6" fill="#0a0204" />

      {/* Barrel forward */}
      <rect x="130" y="38" width="40" height="14" fill="#3a141a" rx="3" />
      <rect x="130" y="38" width="40" height="3" fill="#5a1a22" rx="2" />

      {/* Needle housing tip */}
      <rect x="170" y="40" width="14" height="10" fill="#5a1a22" rx="2" />

      {/* Needle */}
      <line x1="184" y1="45" x2="208" y2="45" stroke="#d8d2c4" strokeWidth="2" />
      {/* Highlight on needle */}
      <line x1="186" y1="44" x2="206" y2="44" stroke="#ffffff" strokeWidth="0.6" opacity="0.7" />

      {/* Ink drop forming at needle tip */}
      <circle cx="209" cy="45" r="2.5" fill="#0a0204">
        <animate
          attributeName="r"
          values="2.5;3.5;2.5"
          dur="0.55s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Spark on top of the coil */}
      <circle cx="92" cy="32" r="3" fill="#ffe27a" opacity="0.0">
        <animate
          attributeName="opacity"
          values="0;1;0"
          dur="0.18s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
