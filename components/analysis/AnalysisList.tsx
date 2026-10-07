import Link from "next/link";

import { EmptyState } from "@/components/app/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { analysisPath } from "@/lib/routes";
import type { JumpAnalysis } from "@/lib/types";

import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";

// Grabaciones en una lista continua (no tarjetas sueltas): movimiento, deportista y fecha, riesgo a la derecha
const styles = {
  list: "divide-y divide-line overflow-hidden rounded-panel border border-line bg-panel",
  item: "",
  link: "group flex items-center gap-3 px-4 py-3 text-ink transition-colors duration-fast hover:bg-sunken hover:no-underline",
  icon: "grid size-10 flex-none place-items-center rounded-control bg-sunken text-ink-muted group-hover:text-accent",
  text: "grid min-w-0 flex-1",
  title: "font-semibold",
  meta: "flex flex-wrap gap-x-3 text-sm text-ink-muted",
  badges: "flex flex-wrap justify-end gap-1.5",
  chevron: "hidden text-line-strong group-hover:text-accent sm:block",
};

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
                <span className={styles.meta}>
                  {subtitle && <span className="font-medium text-ink">{subtitle}</span>}
                  <span>{date}</span>
                </span>
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
