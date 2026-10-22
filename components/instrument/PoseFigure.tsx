import { centerOfMass, flexionArc, type Joint, type Keypoints } from "@/lib/design/pose";
import { type Signal, SIGNAL_CLASS } from "@/lib/design/signals";

// Cada hueso lleva el color de la señal que mide; brazos y pie son contexto y van en tinta tenue
const BONES: { from: Joint; to: Joint; signal?: Signal }[] = [
  { from: "heel", to: "toe" },
  { from: "ankle", to: "knee", signal: "knee" },
  { from: "knee", to: "hip", signal: "knee" },
  { from: "hip", to: "shoulder", signal: "trunk" },
  { from: "shoulder", to: "neck", signal: "trunk" },
  { from: "shoulder", to: "elbow" },
  { from: "elbow", to: "wrist" },
];

const r = (n: number) => Math.round(n * 10) / 10;

/**
 * Esqueleto de perfil coloreado por señal: rodilla, tronco, cadera y centro de gravedad usan los mismos
 * colores que las gráficas y los medidores. Devuelve un <g> para componerlo dentro de cualquier SVG.
 */
export function PoseFigure({ keypoints: k, kneeArc = true, center = true, width = 2.4 }: { keypoints: Keypoints; kneeArc?: boolean; center?: boolean; width?: number }) {
  const com = centerOfMass(k);
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {kneeArc && <path d={flexionArc(k.ankle, k.knee, k.hip, 11)} className="fill-knee-soft stroke-knee" strokeWidth={width * 0.4} opacity={0.9} />}
      {BONES.map(({ from, to, signal }) => (
        <line
          key={`${from}-${to}`}
          x1={r(k[from].x)} y1={r(k[from].y)} x2={r(k[to].x)} y2={r(k[to].y)}
          className={signal ? `${SIGNAL_CLASS[signal].stroke} kin-signal-glow ${SIGNAL_CLASS[signal].text}` : "stroke-ink-muted"}
          strokeWidth={signal ? width : width * 0.75}
        />
      ))}
      <circle cx={r(k.head.x)} cy={r(k.head.y)} r={5} className="fill-panel stroke-ink-muted" strokeWidth={width * 0.75} />
      <circle cx={r(k.knee.x)} cy={r(k.knee.y)} r={width * 1.25} className="fill-knee stroke-panel" strokeWidth={width * 0.4} />
      <circle cx={r(k.hip.x)} cy={r(k.hip.y)} r={width * 1.25} className="fill-hip stroke-panel" strokeWidth={width * 0.4} />
      {center && (
        <g className="text-center">
          <circle cx={r(com.x)} cy={r(com.y)} r={width * 2} className="fill-none stroke-center" strokeWidth={width * 0.5} />
          <circle cx={r(com.x)} cy={r(com.y)} r={width * 0.8} className="fill-center" />
        </g>
      )}
    </g>
  );
}
