import { riskLevel } from "@/lib/analysis-stats";
import { formatPercent } from "@/lib/format";
import { t } from "@/lib/i18n";

import styles from "./Badge.module.css";

/**
 * Nivel de riesgo con nombre: el color acompaña, no informa solo. En listas va con el porcentaje
 * y el nombre corto; junto a la cifra grande del detalle, sólo el nombre completo (sin repetir la cifra).
 */
export function RiskBadge({ score, withValue = true }: { score: number; withValue?: boolean }) {
  const level = riskLevel(score);
  return (
    <span className={`${styles.badge} ${styles[level]}`} title={t.analysis.risk[level]}>
      {withValue ? `${formatPercent(score)} · ${t.analysis.riskShort[level]}` : t.analysis.risk[level]}
    </span>
  );
}
