import { badgeStyles as styles } from "@/components/ui/badge-classes";
import { riskLevel } from "@/lib/analysis-stats";
import { getFormat, getT } from "@/lib/i18n/server";

/**
 * Nivel de riesgo con nombre: el color acompaña, no informa solo. En listas va con el porcentaje
 * y el nombre corto; junto a la cifra grande del detalle, sólo el nombre completo (sin repetir la cifra).
 */
export async function RiskBadge({ score, withValue = true }: { score: number; withValue?: boolean }) {
  const t = await getT();
  const fmt = await getFormat();
  const level = riskLevel(score);
  return (
    <span className={`${styles.badge} ${styles[level]}`} title={t.analysis.risk[level]}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {withValue ? (
        <>
          <span className="tabular-nums">{fmt.percent(score)}</span>
          <span className="font-medium">{t.analysis.riskShort[level]}</span>
        </>
      ) : (
        t.analysis.risk[level]
      )}
    </span>
  );
}
