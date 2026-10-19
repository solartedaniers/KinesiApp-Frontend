import { CenterOfMassMark } from "./CenterOfMassMark";
import { LabIcon } from "./LabIcon";
import { Skeleton } from "./Skeleton";

import { frameBounds, JUMP_PHASES, sequence, smoothPath } from "@/lib/design/pose";

// Mismas etapas que AnalysisStage del contrato, en el orden en que llegan por WatchAnalysis
export const ANALYSIS_STAGES = ["queued", "downloading", "pose", "repetitions", "risk"] as const;
export type AnalysisStageKey = (typeof ANALYSIS_STAGES)[number];

const SPACING = 30;
const FRAMES = sequence(JUMP_PHASES, SPACING, 0);
const VIEW = frameBounds(FRAMES.map(({ keypoints }) => keypoints), 10);

const styles = {
  root: "grid gap-5",
  plate: "w-full text-ink",
  bones: "stroke-ink [stroke-width:1.6]",
  trajectory: "lab-glow fill-none stroke-accent [stroke-width:1.4]",
  meter: "grid gap-2",
  meterHead: "flex items-baseline justify-between gap-4",
  stage: "text-base font-semibold text-ink",
  frames: "font-mono text-sm text-ink-muted [font-variant-numeric:tabular-nums]",
  track: "h-1.5 overflow-hidden rounded-full bg-sunken",
  fill: "h-full origin-left bg-accent transition-transform duration-[var(--kin-motion-hover)] ease-linear",
  steps: "grid gap-2 text-sm sm:grid-cols-5",
  step: "flex items-center gap-2 text-ink-muted data-[state=done]:text-ink data-[state=current]:font-semibold data-[state=current]:text-accent",
  dot: "size-2 rounded-full shadow-[inset_0_0_0_1.5px_currentColor]",
};

/**
 * Progreso del análisis como una placa que se expone: cada pose aparece cuando la IA ya procesó su
 * parte de los frames, y el centro de gravedad se traza detrás. Sólo pinta: el estado llega de fuera.
 */
export function AnalysisProgress({
  stage, framesDone, framesTotal, labels,
}: {
  stage: AnalysisStageKey | "done";
  framesDone: number;
  framesTotal: number;
  labels: { stages: Record<AnalysisStageKey | "done", string>; frames: string; plate: string };
}) {
  const stageIndex = stage === "done" ? ANALYSIS_STAGES.length : ANALYSIS_STAGES.indexOf(stage);
  const poseProgress = stageIndex > 2 ? 1 : stage === "pose" && framesTotal > 0 ? framesDone / framesTotal : 0;
  const visible = Math.ceil(poseProgress * FRAMES.length);
  const overall = Math.min(1, (stageIndex + (stage === "pose" ? poseProgress : 0)) / ANALYSIS_STAGES.length);

  return (
    <div className={styles.root}>
      <svg className={styles.plate} viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`} role="img" aria-label={labels.plate}>
        <line className="stroke-line-strong [stroke-width:0.8]" x1={VIEW.x} x2={VIEW.x + VIEW.width} y1={0.5} y2={0.5} />
        {FRAMES.map(({ keypoints }, index) =>
          // Lo que falta procesar queda como sombra tenue; al exponerse, la pose se monta de nuevo y se traza
          index < visible ? (
            <Skeleton key={`${index}-on`} keypoints={keypoints} className={styles.bones} opacity={0.3 + (0.7 * index) / (FRAMES.length - 1)} />
          ) : (
            <Skeleton key={`${index}-off`} keypoints={keypoints} className={styles.bones} opacity={0.08} animate={false} />
          ),
        )}
        {visible > 1 && <path className={styles.trajectory} d={smoothPath(FRAMES.slice(0, visible).map(({ center }) => center))} />}
        {FRAMES.slice(0, visible).map(({ center }, index) => <CenterOfMassMark key={index} x={center.x} y={center.y} size={5} />)}
      </svg>
      <div className={styles.meter}>
        <p className={styles.meterHead}>
          <span className={styles.stage} role="status">{labels.stages[stage]}</span>
          {stage === "pose" && <span className={styles.frames}>{labels.frames}</span>}
        </p>
        <div className={styles.track} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(overall * 100)} aria-label={labels.stages[stage]}>
          <div className={styles.fill} style={{ transform: `scaleX(${overall})` }} />
        </div>
        <ol className={styles.steps}>
          {ANALYSIS_STAGES.map((key, index) => {
            const state = index < stageIndex ? "done" : index === stageIndex ? "current" : "upcoming";
            return (
              <li key={key} className={styles.step} data-state={state}>
                {state === "done" ? <LabIcon name="check" size={16} /> : <span className={styles.dot} aria-hidden />}
                {labels.stages[key]}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
