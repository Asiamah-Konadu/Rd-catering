import React from "react";

interface PaperSquare {
  id: number;
  left: number;
  top: number;
  size: number;
  aspect: number;
  rotate: number;
  color: string;
  opacity: number;
  sway: boolean;
  delay: number;
}

// Ghanaian flag palette: Red, Gold, Green, and Black Star accent
const GHANA_COLORS = [
  "#CE1126", // Red
  "#CE1126",
  "#FCD116", // Gold
  "#FCD116",
  "#006B3F", // Green
  "#006B3F",
  "#18181B", // Black
];

// Deterministic PRNG (mulberry32) so SSR and client match without hydration issues
function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateShreddedSquares(count: number): PaperSquare[] {
  const rand = createRng(19570306); // Ghana Independence Day seed
  const squares: PaperSquare[] = [];

  for (let i = 0; i < count; i++) {
    const size = 4 + Math.floor(rand() * 4); // 4px - 7px tiny squares
    const aspect = 0.85 + rand() * 0.3; // slight organic paper-cut variation around square
    const left = Number((rand() * 99.2).toFixed(2));
    // Concentrate slightly more in the upper/mid white space, tapering softly toward the hero edge
    const rawTop = Math.pow(rand(), 1.15) * 90 + 2;
    const top = Number(rawTop.toFixed(2));
    const rotate = Math.round((rand() - 0.5) * 84);
    const color = GHANA_COLORS[Math.floor(rand() * GHANA_COLORS.length)];
    const opacity = Number((0.72 + rand() * 0.28).toFixed(2));
    const sway = i % 4 === 0;
    const delay = Number((rand() * 4).toFixed(2));

    squares.push({
      id: i,
      left,
      top,
      size,
      aspect,
      rotate,
      color,
      opacity,
      sway,
      delay,
    });
  }

  return squares;
}

const SHREDDED_SQUARES = generateShreddedSquares(520);

export default function GhanaShreddedHeaderBand() {
  return (
    <div className="ghana-shredded-band" aria-hidden="true">
      {SHREDDED_SQUARES.map((sq) => (
        <span
          key={sq.id}
          className={`ghana-shred-square${sq.sway ? " is-swaying" : ""}`}
          style={
            {
              left: `${sq.left}%`,
              top: `${sq.top}%`,
              width: `${sq.size}px`,
              height: `${Math.max(3, Math.round(sq.size * sq.aspect))}px`,
              backgroundColor: sq.color,
              opacity: sq.opacity,
              "--sq-rot": `${sq.rotate}deg`,
              animationDelay: sq.sway ? `${sq.delay}s` : undefined,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
