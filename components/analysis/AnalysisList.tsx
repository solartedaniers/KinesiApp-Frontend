import Link from "next/link";

import { Dial } from "@/components/instrument/Dial";
import { Glyph } from "@/components/instrument/Glyph";
import { EmptyState } from "@/components/instrument/States";
import { RiskScale, ZoneChip } from "@/components/instrument/Status";
import { riskLevel } from "@/lib/analysis-stats";
import { cssVars } from "@/lib/design/css";
import { RISK_STEP, RISK_TEXT } from "@/lib/design/risk";
import { zoneOf } from "@/lib/design/signals";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { analysisPath } from "@/lib/routes";
import type { AnalysisSummary } from "@/lib/types";

const styles = {
  list: "kin-card divide-y divide-line overflow-hidden",
  link: "grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-accent-soft sm:grid-cols-[3.5rem_1fr_auto_8.5rem] sm:px-5 lg:grid-cols-[3.5rem_1fr_auto_8.5rem_10rem]",
  value: "font-display text-xl font-semibold [font-variant-numeric:tabular-nums]",
};

/**
 * Grabaciones como en la guía: un medidor miniatura con la mediana de los picos de rodilla y su zona,
 * más el riesgo. Las que siguen en proceso o fallaron muestran la esfera en reposo con su estado.
 */
export async function AnalysisList({ analyses, subtitleFor }: { analyses: AnalysisSummary[]; subtitleFor?: (analysis: AnalysisSummary) => string | undefined }) {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  if (analyses.length === 0) return <EmptyState title={t.analysis.listEmpty} body={t.analysis.listEmptyHint} />;

  return (
    <ul className={styles.list}>
      {analyses.map((analysis, i) => {
        const knee = analysis.knee_median_peak_degrees;
        const target = analysis.knee_target;
        const zone = knee !== null && target ? zoneOf(knee, target) : null;
        const level = analysis.risk_level ?? (analysis.risk_score === null ? null : riskLevel(analysis.risk_score));
        const subtitle = subtitleFor?.(analysis);
        return (
          <li key={analysis.id} className="kin-rise" style={cssVars({ "--i": Math.min(i, 8) })}>
            <Link href={analysisPath(analysis.id)} className={styles.link}>
              <Dial
                value={knee ?? 0}
                target={target}
                ticks={false}
                sweep={knee !== null}
                delayMs={Math.min(i, 8) * 120 + 300}
                label={knee === null ? t.analysis.status[analysis.status] : `${t.analysis.kneeMedian}: ${f.degrees(knee)}`}
                className="w-14"
              >
                {analysis.status === "pending" && <span className="kin-waking mb-1 size-2 rounded-full bg-trunk text-trunk" aria-hidden />}
                {analysis.status === "failed" && <Glyph name="alert" size={14} className="mb-0.5 text-risk-high" />}
              </Dial>
              <span className="grid min-w-0 gap-0.5">
                <span className="flex items-center gap-2 font-semibold text-ink">
                  <Glyph name={analysis.movement_type} size={18} className="flex-none text-ink-muted" />
                  {t.analysis.movement[analysis.movement_type]}
                </span>
                <span className="flex flex-wrap gap-x-3 text-sm text-ink-muted">
                  {subtitle && <span className="font-semibold text-ink">{subtitle}</span>}
                  <span>{f.dateTime(analysis.recorded_at)}</span>
                </span>
              </span>
              {knee !== null ? (
                <span className={`${styles.value} text-knee`}>{f.degrees(knee)}</span>
              ) : analysis.status === "processed" && analysis.risk_score !== null && level ? (
                <span className={`${styles.value} ${RISK_TEXT[level]}`}>{f.percent(analysis.risk_score)}</span>
              ) : (
                <span className={`text-sm font-semibold ${analysis.status === "failed" ? "text-risk-high" : "text-ink-muted"}`}>{t.analysis.status[analysis.status]}</span>
              )}
              <span className="max-sm:hidden">
                {zone && target ? <ZoneChip zone={zone} label={t.analysis.kneeZones[analysis.movement_type][zone]} /> : analysis.status === "processed" && <span className="text-xs text-ink-muted">{t.analysis.noKnee}</span>}
              </span>
              <span className="max-lg:hidden">
                {level && <RiskScale compact level={level} label={t.analysis.riskShort[level]} steps={format(t.analysis.riskSteps, { step: RISK_STEP[level] })} />}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
