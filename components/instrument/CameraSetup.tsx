import { PoseFigure } from "./PoseFigure";

import { solvePose, SQUAT_PHASES } from "@/lib/design/pose";

const FIGURE = solvePose(SQUAT_PHASES[0].angles, { x: 132, y: 0 });
const HIP_Y = Math.round(FIGURE.hip.y * 10) / 10;
const CAMERA_X = 14;

/** Esquema de perfil: la cámara fija a la izquierda, a la altura de la cadera y a unos tres metros. */
export function CameraSetup({ labels, className = "" }: { labels: { label: string; distance: string; height: string }; className?: string }) {
  return (
    <svg viewBox="-4 -96 168 112" className={className} role="img" aria-label={labels.label}>
      <line x1="-4" x2="164" y1="0" y2="0" className="stroke-line-strong" strokeWidth="0.8" />
      {/* Trípode y cámara */}
      <g className="stroke-ink-muted" strokeWidth="1.4" strokeLinecap="round">
        <line x1={CAMERA_X} y1={HIP_Y} x2={CAMERA_X - 8} y2="0" />
        <line x1={CAMERA_X} y1={HIP_Y} x2={CAMERA_X + 8} y2="0" />
        <line x1={CAMERA_X} y1={HIP_Y} x2={CAMERA_X} y2="0" />
      </g>
      <rect x={CAMERA_X - 7} y={HIP_Y - 9} width="14" height="9" rx="2" className="fill-panel stroke-ink" strokeWidth="1.4" />
      <circle cx={CAMERA_X + 3} cy={HIP_Y - 4.5} r="2.4" className="fill-accent" />
      {/* Campo de visión hacia el deportista */}
      <path d={`M${CAMERA_X + 7} ${HIP_Y - 4.5} L150 -92 L150 6 Z`} className="fill-accent-soft opacity-60" />
      <line x1={CAMERA_X + 7} x2="160" y1={HIP_Y - 4.5} y2={HIP_Y - 4.5} className="stroke-accent" strokeWidth="0.8" strokeDasharray="2 2" />
      <text x={CAMERA_X + 12} y={HIP_Y - 7} className="fill-accent text-[5.5px] font-semibold">{labels.height}</text>
      <PoseFigure keypoints={FIGURE} kneeArc={false} width={2.4} />
      {/* Distancia */}
      <g className="stroke-ink-muted" strokeWidth="0.8">
        <line x1={CAMERA_X} x2="132" y1="9" y2="9" />
        <line x1={CAMERA_X} x2={CAMERA_X} y1="6" y2="12" />
        <line x1="132" x2="132" y1="6" y2="12" />
      </g>
      <text x={(CAMERA_X + 132) / 2} y="15.5" textAnchor="middle" className="fill-ink text-[6px] font-semibold">{labels.distance}</text>
    </svg>
  );
}
