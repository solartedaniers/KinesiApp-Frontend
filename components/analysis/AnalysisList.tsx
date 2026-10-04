import Link from "next/link";

import { EmptyState } from "@/components/app/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { analysisPath } from "@/lib/routes";
import type { JumpAnalysis } from "@/lib/types";

import styles from "./AnalysisList.module.css";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";

/** Lista de grabaciones (ya ordenada por quien la pide). `subtitleFor` agrega contexto, p. ej. el deportista. */
export async function AnalysisList({
  analyses,
  subtitleFor,
}: {
  analyses: JumpAnalysis[];
  subtitleFor?: (analysis: JumpAnalysis) => string | undefined;
}) {
  const t = await getT();
  const fmt = await getFormat();
  if (analyses.length === 0) {
    return <EmptyState icon="video" title={t.analysis.listEmpty} body={t.analysis.listEmptyHint} />;
  }

  return (
    <ul className={styles.list}>
      {analyses.map((analysis) => {
        const date = fmt.dateTime(analysis.recorded_at);
        const subtitle = subtitleFor?.(analysis);
        return (
          <li key={analysis.id} className={styles.item}>
            <Link href={analysisPath(analysis.id)} className={styles.link} aria-label={format(t.analysis.open, { date })}>
              <span className={styles.icon}>
                <Icon name="video" />
              </span>
              <span className={styles.text}>
                <span className={styles.title}>{t.analysis.movement[analysis.movement_type]}</span>
                <span className={styles.meta}>{subtitle ? `${subtitle} · ${date}` : date}</span>
              </span>
              <span className={styles.badges}>
                {analysis.risk_score !== null && <RiskBadge score={analysis.risk_score} />}
                {analysis.status !== "processed" && <StatusBadge status={analysis.status} />}
              </span>
              <span className={styles.chevron}>
                <Icon name="chevronRight" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
