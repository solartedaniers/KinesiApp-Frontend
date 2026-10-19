"use client";

import { useEffect, useState } from "react";

import { ANALYSIS_STAGES, AnalysisProgress, type AnalysisStageKey } from "@/components/lab/AnalysisProgress";
import { LabButton } from "@/components/lab/Button";
import { format } from "@/lib/i18n/locale";

const TOTAL_FRAMES = 1200;
// Duración simulada de cada etapa; la de la postura es la larga, como en la IA real
const STAGE_MS: Record<AnalysisStageKey, number> = { queued: 700, downloading: 900, pose: 5200, repetitions: 900, risk: 800 };
const TICK_MS = 100;

type Labels = { stages: Record<AnalysisStageKey | "done", string>; frames: string; plate: string; start: string; restart: string };

/** Simula los eventos de WatchAnalysis para mostrar el progreso sin backend. */
export function ProgressSimulation({ labels }: { labels: Labels }) {
  const [elapsed, setElapsed] = useState<number | null>(null);
  const total = Object.values(STAGE_MS).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (elapsed === null || elapsed >= total) return;
    const timer = setTimeout(() => setElapsed((value) => (value ?? 0) + TICK_MS), TICK_MS);
    return () => clearTimeout(timer);
  }, [elapsed, total]);

  let remaining = elapsed ?? 0;
  let stage: AnalysisStageKey | "done" = "done";
  let framesDone = TOTAL_FRAMES;
  for (const key of ANALYSIS_STAGES) {
    if (remaining < STAGE_MS[key]) {
      stage = key;
      framesDone = key === "pose" ? Math.round((remaining / STAGE_MS.pose) * TOTAL_FRAMES) : 0;
      break;
    }
    remaining -= STAGE_MS[key];
  }
  if (elapsed === null) stage = "queued";

  return (
    <div className="grid gap-5">
      <AnalysisProgress
        stage={stage}
        framesDone={framesDone}
        framesTotal={TOTAL_FRAMES}
        labels={{ ...labels, frames: format(labels.frames, { done: framesDone, total: TOTAL_FRAMES }) }}
      />
      <div>
        <LabButton variant="secondary" icon="play" onClick={() => setElapsed(0)} disabled={elapsed !== null && elapsed < total}>
          {elapsed === null ? labels.start : labels.restart}
        </LabButton>
      </div>
    </div>
  );
}
