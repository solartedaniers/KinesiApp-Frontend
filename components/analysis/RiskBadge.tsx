import { riskLevel } from "@/lib/analysis-stats";
import { formatPercent } from "@/lib/format";
import { t } from "@/lib/i18n";

import styles from "./Badge.module.css";

/** Porcentaje y nivel con nombre (corto; el completo va en el title): el color acompaña, no informa solo. */
export function RiskBadge({ score }: { score: number }) {
  const level = riskLevel(score);
  return (
    <span className={`${styles.badge} ${styles[level]}`} title={t.analysis.risk[level]}>
      {formatPercent(score)} · {t.analysis.riskShort[level]}
    </span>
  );
}
