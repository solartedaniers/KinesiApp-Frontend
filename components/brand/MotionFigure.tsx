// Esqueleto de captura (vista lateral, aterrizaje de un salto) con el ángulo de la rodilla medido:
// muestra qué hace la app en vez de decorar. Decorativo para lectores de pantalla.
const JOINTS = {
  head: [120, 40],
  shoulder: [115, 72],
  elbow: [142, 104],
  wrist: [164, 122],
  hip: [100, 150],
  knee: [140, 195],
  ankle: [110, 250],
  toe: [138, 256],
} as const;

const SEGMENTS: [keyof typeof JOINTS, keyof typeof JOINTS][] = [
  ["shoulder", "elbow"],
  ["elbow", "wrist"],
  ["shoulder", "hip"],
  ["hip", "knee"],
  ["knee", "ankle"],
  ["ankle", "toe"],
];

export function MotionFigure({ className }: { className?: string }) {
  const [kneeX, kneeY] = JOINTS.knee;
  return (
    <svg viewBox="0 0 240 290" className={className} aria-hidden focusable="false">
      {/* Línea del suelo y marcas de tiempo, como en la línea de tiempo del análisis */}
      <path d="M24 262h192" className="stroke-line-strong" strokeWidth="1.5" />
      {[48, 96, 144, 192].map((x) => (
        <path key={x} d={`M${x} 262v6`} className="stroke-line-strong" strokeWidth="1.5" />
      ))}
      <circle cx={JOINTS.head[0]} cy={JOINTS.head[1]} r="13" className="fill-none stroke-ink-muted" strokeWidth="2.5" />
      <g className="stroke-accent" strokeWidth="3.5" strokeLinecap="round" fill="none">
        {SEGMENTS.map(([from, to]) => (
          <path key={`${from}-${to}`} d={`M${JOINTS[from][0]} ${JOINTS[from][1]}L${JOINTS[to][0]} ${JOINTS[to][1]}`} />
        ))}
      </g>
      {/* Arco del ángulo de la rodilla (~110°) entre muslo y tibia */}
      <path d="M128.05 181.55A18 18 0 0 0 131.38 210.8" className="fill-none stroke-ink" strokeWidth="2" strokeLinecap="round" />
      <text x="88" y="206" className="fill-ink font-display text-[15px] font-semibold tabular-nums">
        110°
      </text>
      {Object.entries(JOINTS)
        .filter(([name]) => name !== "head")
        .map(([name, [x, y]]) => (
          <circle key={name} cx={x} cy={y} r={name === "knee" ? 6.5 : 5} className="fill-panel stroke-accent" strokeWidth="2.5" />
        ))}
      <circle cx={kneeX} cy={kneeY} r="12" className="fill-none stroke-accent" strokeOpacity="0.35" strokeWidth="2" />
    </svg>
  );
}
