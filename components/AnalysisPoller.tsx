"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { watchAnalysis } from "@/lib/actions/analyses";
import { useT } from "@/lib/i18n/client";
import type { AnalysisProgress } from "@/lib/types";

const styles = {
  poller: "flex flex-wrap items-center gap-4 rounded-panel border border-accent bg-accent-soft px-5 py-4 text-ink [&_p]:text-sm [&_strong]:font-semibold",
  spinner: "size-5 flex-none animate-spin rounded-full border-[3px] border-accent border-r-transparent motion-reduce:[animation-duration:3s]",
};

/**
 * Isla CSR del detalle: se suscribe a WatchAnalysis por una Server Action que devuelve un stream.
 * Cuando llega el resultado, router.refresh() vuelve a renderizar la página en el servidor.
 */
export function AnalysisPoller({ analysisId }: { analysisId: string }) {
  const t = useT();
  const router = useRouter();
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [stalled, setStalled] = useState(false);
  const [subscription, setSubscription] = useState(0);

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

  const percent = progress?.frames_total ? Math.round((progress.frames_processed / progress.frames_total) * 100) : null;

  return (
    <div className={styles.poller} role="status">
      {stalled ? (
        <>
          <p>{t.analysisDetail.pendingStalled}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setStalled(false);
              setSubscription((current) => current + 1);
            }}
          >
            {t.analysisDetail.pendingRetry}
          </Button>
        </>
      ) : (
        <>
          <span className={styles.spinner} aria-hidden />
          <div>
            <strong>{t.analysisDetail.pendingTitle}</strong>
            <p>{percent === null ? t.analysisDetail.pendingBody : `${t.analysisDetail.pendingBody} ${percent} %`}</p>
          </div>
        </>
      )}
    </div>
  );
}
