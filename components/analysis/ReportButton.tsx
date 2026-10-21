"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/instrument/Button";
import { getReportSource } from "@/lib/actions/analyses";
import { buildTimeline } from "@/lib/analysis-timeline";
import { format } from "@/lib/i18n";
import { useFormat, useT } from "@/lib/i18n/client";
import { buildReportModel } from "@/lib/report";
import { renderReportInWorker, saveFile } from "@/lib/report-download";

/**
 * Informe en PDF al pedirlo: trae los datos por RPC, arma la línea de tiempo por tasks y deja el
 * dibujo al worker, así la página sigue respondiendo mientras se genera.
 */
export function ReportButton({ analysisId }: { analysisId: string }) {
  const t = useT();
  const f = useFormat();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function download() {
    setError(null);
    startTransition(async () => {
      const result = await getReportSource(analysisId);
      if ("error" in result) return setError(result.error);
      const { analysis } = result.source;
      const timeline = await buildTimeline(analysis.angle_measurements, analysis.risk_assessment);
      const bytes = await renderReportInWorker(buildReportModel({ source: result.source, timeline, t, f }));
      if (!bytes) return setError(t.report.failed);
      saveFile(bytes, `${format(t.report.fileTitle, { date: f.shortDate(analysis.recorded_at) })}.pdf`, "application/pdf");
    });
  }

  return (
    <>
      <Button variant="secondary" glyph="download" pending={pending} onClick={download}>
        {pending ? t.report.generating : t.report.download}
      </Button>
      {error && <p role="alert" className="basis-full text-sm text-risk-high">{error}</p>}
    </>
  );
}
