import React from "react";

export default function NationalEmblem({
  size = 44,
  className = "",
  variant = "dark",
}: {
  size?: number;
  className?: string;
  variant?: "light" | "dark";
}) {
  const color = variant === "light" ? "#F1F5F9" : "#0F2B48";
  const accent = variant === "light" ? "#CBD5E1" : "#475569";

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`} title="State Emblem of India">
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 100 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="National Emblem of India"
      >
        {/* Ashoka Lion Capital Vector Silhouette */}
        {/* Three Lions at top */}
        {/* Central Lion */}
        <g fill={color}>
          {/* Central head & mane */}
          <path d="M 50,12 C 45,12 42,16 42,22 C 40,24 38,27 38,32 C 38,38 41,42 44,45 C 44,52 46,58 50,62 C 54,58 56,52 56,45 C 59,42 62,38 62,32 C 62,27 60,24 58,22 C 58,16 55,12 50,12 Z" />
          {/* Crown/crest details */}
          <circle cx="50" cy="18" r="2.5" fill={accent} />
          <ellipse cx="46" cy="28" rx="2" ry="3" fill={accent} />
          <ellipse cx="54" cy="28" rx="2" ry="3" fill={accent} />
          {/* Muzzle */}
          <polygon points="48,34 52,34 50,38" fill={accent} />

          {/* Left Lion profile */}
          <path d="M 38,20 C 33,20 28,24 26,30 C 24,35 25,41 28,45 C 29,50 33,55 38,58 C 36,52 36,46 38,40 C 36,36 36,28 38,20 Z" />
          
          {/* Right Lion profile */}
          <path d="M 62,20 C 67,20 72,24 74,30 C 76,35 75,41 72,45 C 71,50 67,55 62,58 C 64,52 64,46 62,40 C 64,36 64,28 62,20 Z" />
        </g>

        {/* Abacus / Base Platform */}
        <rect x="22" y="65" width="56" height="5" rx="1.5" fill={color} />

        {/* Central Ashoka Chakra */}
        <g transform="translate(50, 78)">
          <circle cx="0" cy="0" r="8" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx="0" cy="0" r="1.5" fill={color} />
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1="0"
              y1="-8"
              x2="0"
              y2="8"
              stroke={color}
              strokeWidth="0.7"
              transform={`rotate(${i * 15})`}
            />
          ))}
        </g>

        {/* Bull on left & Horse on right */}
        {/* Galloping Horse (left) */}
        <path d="M 28,74 C 30,73 34,74 36,78 C 34,80 30,81 26,79 C 25,76 26,74 28,74 Z" fill={color} />
        {/* Bull (right) */}
        <path d="M 72,74 C 70,73 66,74 64,78 C 66,80 70,81 74,79 C 75,76 74,74 72,74 Z" fill={color} />

        {/* Lower plinth */}
        <rect x="18" y="88" width="64" height="4" rx="1" fill={color} />

        {/* Lotus base (Inverted bell lotus) */}
        <path
          d="M 22,92 C 30,99 40,103 50,103 C 60,103 70,99 78,92 C 72,106 62,110 50,110 C 38,110 28,106 22,92 Z"
          fill={color}
        />
        <rect x="15" y="110" width="70" height="3" rx="1" fill={color} />

        {/* Satyameva Jayate (सत्यमेव जयते) in Devanagari */}
        <text
          x="50"
          y="124"
          textAnchor="middle"
          fill={color}
          fontSize="7"
          fontWeight="800"
          letterSpacing="0.8"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          सत्यमेव जयते
        </text>
      </svg>
    </div>
  );
}

