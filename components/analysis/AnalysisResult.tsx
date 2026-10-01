import pageStyles from "@/components/app/Page.module.css";
import { riskLevel } from "@/lib/analysis-stats";
import { formatDateTime, formatPercent } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { JumpAnalysis } from "@/lib/types";

import styles from "./AnalysisDetail.module.css";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";

/** Puntaje de riesgo (la cifra principal de la pantalla) y los datos de la grabación. */
export function AnalysisResult({ analysis }: { analysis: JumpAnalysis }) {
  const score = analysis.risk_score;
  return (
    <section className={`${pageStyles.card} ${styles.result}`} aria-labelledby="result-title">
      <h2 id="result-title" className={pageStyles.sectionTitle}>
        {t.analysisDetail.result}
      </h2>
      {score !== null && (
        <div className={styles.score}>
          <span className={styles.scoreLabel}>{t.analysisDetail.riskScore}</span>
          <span className={styles.scoreValue}>
            {formatPercent(score)}
            <RiskBadge score={score} withValue={false} />
          </span>
          <p className={styles.explanation}>{t.analysisDetail.riskExplanation[riskLevel(score)]}</p>
        </div>
      )}
      <dl className={styles.meta}>
        <div>
          <dt>{t.analysisDetail.movement}</dt>
          <dd>{t.analysis.movement[analysis.movement_type]}</dd>
        </div>
        <div>
          <dt>{t.analysisDetail.recordedAt}</dt>
          <dd>{formatDateTime(analysis.recorded_at)}</dd>
        </div>
        <div>
          <dt>{t.analysisDetail.status}</dt>
          <dd>
            <StatusBadge status={analysis.status} />
          </dd>
        </div>
      </dl>
    </section>
  );
}
