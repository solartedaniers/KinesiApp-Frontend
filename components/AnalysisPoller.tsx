"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { API_PATHS } from "@/lib/api-paths";
import { ANALYSIS_POLLING } from "@/lib/config";
import { useT } from "@/lib/i18n/client";
import { proxyUrl } from "@/lib/proxy-allowlist";
import type { JumpAnalysis } from "@/lib/types";

const styles = {
  poller: "flex flex-wrap items-center gap-4 rounded-panel border border-accent bg-accent-soft px-5 py-4 text-ink [&_p]:text-sm [&_strong]:font-semibold",
  spinner: "size-5 flex-none animate-spin rounded-full border-[3px] border-accent border-r-transparent motion-reduce:[animation-duration:3s]",
};

/**
 * Isla CSR del detalle (§3): mientras el análisis está en proceso consulta su estado con backoff
 * (2 s, 4 s, 8 s… hasta 30 s). Al cambiar, router.refresh() vuelve a renderizar la página en el
 * servidor con el resultado. Con la pestaña oculta no consulta.
 */
export function AnalysisPoller({ analysisId }: { analysisId: number }) {
  const t = useT();
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const stalled = attempt >= ANALYSIS_POLLING.maxAttempts;

  useEffect(() => {
    if (stalled) return;
    const delay = Math.min(ANALYSIS_POLLING.initialDelayMs * 2 ** attempt, ANALYSIS_POLLING.maxDelayMs);
    const timer = setTimeout(async () => {
      if (document.visibilityState === "visible") {
        try {
          const response = await fetch(proxyUrl(API_PATHS.analysis(analysisId)), { cache: "no-store" });
          if (response.ok && ((await response.json()) as JumpAnalysis).status !== "pending") {
            router.refresh();
            return;
          }
        } catch {
          // Red caída: se reintenta en la siguiente vuelta
        }
      }
      setAttempt((current) => current + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [analysisId, attempt, stalled, router]);

  return (
    <div className={styles.poller} role="status">
      {stalled ? (
        <>
          <p>{t.analysisDetail.pendingStalled}</p>
          <Button variant="secondary" onClick={() => setAttempt(0)}>
            {t.analysisDetail.pendingRetry}
          </Button>
        </>
      ) : (
        <>
          <span className={styles.spinner} aria-hidden />
          <div>
            <strong>{t.analysisDetail.pendingTitle}</strong>
            <p>{t.analysisDetail.pendingBody}</p>
          </div>
        </>
      )}
    </div>
  );
}
