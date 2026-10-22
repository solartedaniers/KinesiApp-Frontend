import { PoseFigure } from "./PoseFigure";

import { cssVars } from "@/lib/design/css";
import { frameBounds, JUMP_PHASES, sequence, smoothPath, SQUAT_PHASES } from "@/lib/design/pose";
import type { MovementType } from "@/lib/types";

const PHASES = { jump: JUMP_PHASES, squat: SQUAT_PHASES };
// Separación entre siluetas: el salto avanza un poco más para que el vuelo no se encime
const SPACING: Record<MovementType, number> = { jump: 34, squat: 42 };
const r = (n: number) => Math.round(n * 100) / 100;

/**
 * Placa cronofotográfica al estilo de Marey: cada fase del movimiento como una silueta desplazada y la
 * curva del centro de gravedad uniéndolas. Las siluetas viejas se apagan para que se lea el orden.
 * Sin `label` es decorativa (por ejemplo, dentro de un enlace que ya se nombra solo).
 */
export function Chronophotograph({ movement, label, className = "" }: { movement: MovementType; label?: string; className?: string }) {
  const frames = sequence(PHASES[movement], SPACING[movement], 0);
  const box = frameBounds(frames.map((frame) => frame.keypoints), 10);
  const path = smoothPath(frames.map((frame) => frame.center));
  return (
    <svg viewBox={`${r(box.x)} ${r(box.y)} ${r(box.width)} ${r(box.height)}`} className={className} {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>
      <line x1={r(box.x)} x2={r(box.x + box.width)} y1="0" y2="0" className="stroke-line-strong" strokeWidth="0.8" />
      {frames.map((frame, i) => (
        <g key={i} className="kin-rise" style={{ ...cssVars({ "--i": i }), opacity: 0.35 + (0.65 * (i + 1)) / frames.length }}>
          <PoseFigure keypoints={frame.keypoints} center={false} kneeArc={i === frames.length - 1} width={2.2} />
        </g>
      ))}
      <g className="kin-draw text-center" style={cssVars({ "--delay": "600ms" })}>
        <path d={path} className="kin-signal-glow fill-none stroke-center" strokeWidth="1.6" strokeDasharray="3 2.4" />
        {frames.map((frame, i) => (
          <circle key={i} cx={r(frame.center.x)} cy={r(frame.center.y)} r="1.8" className="fill-center" />
        ))}
      </g>
    </svg>
  );
}
