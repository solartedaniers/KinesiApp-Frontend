"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { type AnalysisStage as RingStage, AnalysisProgress as ProgressRing } from "@/components/instrument/AnalysisProgress";
import { Notice } from "@/components/instrument/Status";
import { Button } from "@/components/ui/Button";
import { watchAnalysis } from "@/lib/actions/analyses";
import { useAiStatus, useWakeAi } from "@/lib/ai-status/use-ai-status";
import { format } from "@/lib/i18n";
import { useT } from "@/lib/i18n/client";
import { ANALYSIS_STAGES, type AnalysisProgress, type AnalysisStage } from "@/lib/types";

// Las etapas del contrato y las del anillo van en el mismo orden; solo cambian los nombres cortos
const RING_STAGE: Record<AnalysisStage, RingStage> = {
  queued: "queued",
  downloading_video: "downloading",
  extracting_pose: "pose",
  detecting_repetitions: "repetitions",
  scoring_risk: "risk",
};

/**
 * Isla CSR del detalle: se suscribe a WatchAnalysis por una Server Action que devuelve un stream.
 * Cuando llega el resultado, router.refresh() vuelve a renderizar la página en el servidor.
 */
export function AnalysisPoller({ analysisId }: { analysisId: string }) {
  const t = useT();
  const p = t.analysisDetail.progress;
  const router = useRouter();
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [stalled, setStalled] = useState(false);
  const [subscription, setSubscription] = useState(0);
  // El backend publica "en cola" también mientras despierta la IA: pregunto por ella para distinguirlo.
  // Si ya está activa la respuesta es inmediata; si no, coincide con el arranque que el backend espera
  useWakeAi();
  const ai = useAiStatus();

  useEffect(() => {
    let active = true;
    (async () => {
      for await (const event of await watchAnalysis(analysisId)) {
        if (!active) return;
        if (event.kind === "progress") setProgress(event.progress);
        if (event.kind === "finished") return router.refresh();
        if (event.kind === "failed") return setStalled(true);
      }
    })().catch(() => active && setStalled(true));
    return () => {
      active = false;
    };
  }, [analysisId, router, subscription]);

  if (stalled) {
    return (
      <div className="kin-card flex flex-wrap items-center gap-4 p-5" role="status">
        <p className="text-sm text-ink">{t.analysisDetail.pendingStalled}</p>
        <Button
          variant="secondary"
          onClick={() => {
            setStalled(false);
            setSubscription((current) => current + 1);
          }}
        >
          {t.analysisDetail.pendingRetry}
        </Button>
      </div>
    );
  }

  const stage = progress?.stage ?? "queued";
  const coldStart = stage === "queued" && ai === "waking";
  const index = ANALYSIS_STAGES.indexOf(stage);
  const fraction = stage === "extracting_pose" && progress?.frames_total ? progress.frames_processed / progress.frames_total : 0;
  const stageNames = Object.fromEntries(
    ANALYSIS_STAGES.map((name) => [RING_STAGE[name], name === "queued" && coldStart ? p.waking : p.stages[name]]),
  ) as Record<RingStage, string>;

  return (
    <section className="kin-card grid items-center gap-6 p-5 sm:grid-cols-[minmax(0,13rem)_1fr] sm:p-6" aria-labelledby="analysis-pending-title">
      <ProgressRing stage={index} fraction={fraction} labels={{ title: p.label, stage: p.stage, stageNames, done: p.done }} />
      <div className="grid content-start gap-3">
        <h2 id="analysis-pending-title" className="font-display text-xl font-semibold text-ink">{t.analysisDetail.pendingTitle}</h2>
        {/* Solo el nombre de la etapa va en la región viva: el conteo de cuadros cambia demasiado seguido */}
        <p className="font-display text-2xl font-bold text-accent" role="status">{stageNames[RING_STAGE[stage]]}</p>
        {stage === "extracting_pose" && progress?.frames_total ? (
          <p className="text-sm text-ink-muted [font-variant-numeric:tabular-nums]">{format(p.frames, { done: progress.frames_processed, total: progress.frames_total })}</p>
        ) : null}
        {coldStart && <Notice tone="info">{p.coldStart}</Notice>}
        <p className="text-sm text-ink-muted">{t.analysisDetail.pendingBody}</p>
      </div>
    </section>
  );
}
