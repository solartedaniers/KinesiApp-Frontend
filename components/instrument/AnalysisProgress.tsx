import { useId } from "react";

import { Glyph } from "./Glyph";
import { PoseFigure } from "./PoseFigure";

import { dialArc } from "@/lib/charts/dial";
import { cssVars } from "@/lib/design/css";
import { type Joint, squatPoseAt } from "@/lib/design/pose";
import { format } from "@/lib/i18n";

// Mismas etapas que reporta WatchAnalysis; cada una se pinta con la señal que está trabajando
export const ANALYSIS_STAGES = ["queued", "downloading", "pose", "repetitions", "risk"] as const;
export type AnalysisStage = (typeof ANALYSIS_STAGES)[number];

export const STAGE_COLOR: Record<AnalysisStage, { stroke: string; bg: string; tint: string }> = {
  queued: { stroke: "stroke-ink-muted", bg: "bg-ink-muted", tint: "var(--kin-ink-muted)" },
  downloading: { stroke: "stroke-center", bg: "bg-center", tint: "var(--kin-center)" },
  pose: { stroke: "stroke-knee", bg: "bg-knee", tint: "var(--kin-knee)" },
  repetitions: { stroke: "stroke-trunk", bg: "bg-trunk", tint: "var(--kin-trunk)" },
  risk: { stroke: "stroke-hip", bg: "bg-hip", tint: "var(--kin-hip)" },
};

// Orden en que se encienden los puntos del esqueleto: de los pies a la cabeza, como los detecta la IA
const JOINTS: Joint[] = ["toe", "heel", "ankle", "knee", "hip", "shoulder", "elbow", "wrist", "neck", "head"];
const C = { x: 100, y: 100 };
const RING = 88;
// Separación entre segmentos del anillo, en etapas
const GAP = 0.05;
const STANDING = squatPoseAt(0);
const r = (n: number) => Math.round(n * 100) / 100;

type Props = {
  stage: number;
  /** Avance dentro de la etapa actual, de 0 a 1. */
  fraction: number;
  labels: { title: string; stage: string; stageNames: Record<AnalysisStage, string>; done: string };
};

/**
 * Anillo por etapas con el esqueleto que se arma adentro: los puntos se encienden mientras se detecta
 * la pose, los huesos aparecen al contar repeticiones y la figura las hace. Sin estado: lo mueve
 * quien lo usa (el stream de progreso en la app, una simulación en la guía).
 */
export function AnalysisProgress({ stage, fraction, labels }: Props) {
  const total = ANALYSIS_STAGES.length;
  const done = stage >= total;
  const current = ANALYSIS_STAGES[Math.min(stage, total - 1)];
  const overall = done ? 1 : (stage + fraction) / total;
  const poseIndex = ANALYSIS_STAGES.indexOf("pose");
  const lit = stage > poseIndex ? JOINTS.length : stage === poseIndex ? Math.floor(fraction * JOINTS.length) : 0;
  const assembled = stage > poseIndex;
  // Al contar repeticiones la figura hace tres sentadillas; después se queda de pie
  const knee = stage === poseIndex + 1 ? Math.abs(Math.sin(fraction * Math.PI * 3)) * 105 : 0;
  const pose = assembled ? squatPoseAt(knee) : STANDING;
  const text = done ? labels.done : format(labels.stage, { index: stage + 1, total, name: labels.stageNames[current] });
  const clip = useId();

  return (
    <div
      className="kin-bezel relative mx-auto aspect-square w-full max-w-[20rem]"
      style={cssVars({ "--tint": done ? "var(--kin-zone-target)" : STAGE_COLOR[current].tint })}
      role="progressbar"
      aria-label={labels.title}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(overall * 100)}
      aria-valuetext={text}
    >
      <div className="kin-face size-full">
        <svg viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden>
          {/* El anillo arranca abajo con dialArc a 360°; lo giro para que empiece a las 12 */}
          <g transform="rotate(180 100 100)">
          {ANALYSIS_STAGES.map((name, i) => {
            const from = i + GAP;
            const to = i + 1 - GAP;
            const reached = done || i < stage ? to : i === stage ? from + (to - from) * fraction : from;
            return (
              <g key={name}>
                <path d={dialArc(C, RING, from, to, total, 360)} className="fill-none stroke-sunken" strokeWidth="9" strokeLinecap="round" />
                {reached > from && (
                  <path d={dialArc(C, RING, from, reached, total, 360)} className={`kin-signal-glow fill-none ${STAGE_COLOR[name].stroke} ${done ? "stroke-zone-target" : ""}`} strokeWidth="9" strokeLinecap="round" />
                )}
              </g>
            );
          })}
          </g>
          <clipPath id={clip}><circle cx="100" cy="100" r="74" /></clipPath>
          {current === "pose" && !done && (
            <g clipPath={`url(#${clip})`}>
              <rect x="26" y="96" width="148" height="8" className="kin-scan fill-knee-soft" />
              <line x1="26" x2="174" y1="100" y2="100" className="kin-scan stroke-knee" strokeWidth="1" />
            </g>
          )}
          <g transform="translate(96 158) scale(1.12)">
            <line x1="-46" x2="54" y1="0" y2="0" className="stroke-line-strong" strokeWidth="1" />
            {assembled && <PoseFigure keypoints={pose} kneeArc={stage === poseIndex + 1} center={stage > poseIndex + 1 || done} width={2.6} />}
            {!assembled && JOINTS.map((joint, i) => (
              <circle key={joint} cx={r(STANDING[joint].x)} cy={r(STANDING[joint].y)} r={joint === "head" ? 5 : 3.4} className={i < lit ? "kin-signal-glow fill-knee text-knee" : "fill-line-strong opacity-40"} />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

/** Lista de etapas junto al anillo: hechas con su marca, la actual en un pozo con el punto que late. */
export function StageList({ stage, names }: { stage: number; names: Record<AnalysisStage, string> }) {
  return (
    <ol className="grid gap-1.5">
      {ANALYSIS_STAGES.map((name, i) => {
        const status = i < stage ? "done" : i === stage ? "current" : "pending";
        return (
          <li key={name} className={`flex min-h-9 items-center gap-3 rounded-panel px-3 text-sm ${status === "current" ? "kin-well font-semibold text-ink" : status === "done" ? "text-ink" : "text-ink-muted"}`} aria-current={status === "current" ? "step" : undefined}>
            <span className={`grid size-6 flex-none place-items-center rounded-full ${status === "done" ? "bg-zone-target-soft text-zone-target" : status === "current" ? "bg-panel" : "bg-sunken"}`} aria-hidden>
              {status === "done" ? <Glyph name="check" size={14} /> : <span className={`size-1.5 rounded-full ${status === "current" ? `kin-waking ${STAGE_COLOR[name].bg} text-ink` : "bg-line-strong"}`} />}
            </span>
            {names[name]}
          </li>
        );
      })}
    </ol>
  );
}
