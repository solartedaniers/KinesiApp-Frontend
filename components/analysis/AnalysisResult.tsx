import { pageStyles } from "@/components/app/page-classes";
import { riskLevel } from "@/lib/analysis-stats";
import { getFormat, getT } from "@/lib/i18n/server";
import type { JumpAnalysis } from "@/lib/types";

import { RiskBadge } from "./RiskBadge";
import { RISK_TEXT } from "./risk-classes";
import { StatusBadge } from "./StatusBadge";

/** Puntaje de riesgo (la cifra principal, en el color de su nivel) y los datos de la grabación. */
export async function AnalysisResult({ analysis }: { analysis: JumpAnalysis }) {
  const t = await getT();
  const fmt = await getFormat();
  const score = analysis.risk_score;
  return (
    <section className={`${pageStyles.card} gap-5`} aria-labelledby="result-title">
      <h2 id="result-title" className={pageStyles.sectionTitle}>
        {t.analysisDetail.result}
      </h2>
      {score !== null && (
        <div className="grid gap-3">
          <p className="text-sm text-ink-muted">{t.analysisDetail.riskScore}</p>
          <p className={`font-display text-score font-semibold tabular-nums [font-stretch:112%] ${RISK_TEXT[riskLevel(score)]}`}>
            {fmt.percent(score)}
          </p>
          <span>
            <RiskBadge score={score} withValue={false} />
          </span>
          <p className="text-ink-muted">{t.analysisDetail.riskExplanation[riskLevel(score)]}</p>
        </div>
      )}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 text-sm [&_dd]:mt-0.5 [&_dd]:font-medium [&_dt]:text-ink-muted">
        <div>
          <dt>{t.analysisDetail.movement}</dt>
          <dd>{t.analysis.movement[analysis.movement_type]}</dd>
        </div>
        <div>
          <dt>{t.analysisDetail.status}</dt>
          <dd>
            <StatusBadge status={analysis.status} />
          </dd>
        </div>
        <div className="col-span-2">
          <dt>{t.analysisDetail.recordedAt}</dt>
          <dd>{fmt.dateTime(analysis.recorded_at)}</dd>
        </div>
      </dl>
    </section>
  );
}
