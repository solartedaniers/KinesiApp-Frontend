import Link from "next/link";
import type { ReactNode } from "react";

import { RiskDial } from "@/components/analysis/RiskDial";
import { Avatar } from "@/components/app/Avatar";
import { RiskScale } from "@/components/instrument/Status";
import { ageOn, type AthleteSummary, riskLevel } from "@/lib/analysis-stats";
import { cssVars } from "@/lib/design/css";
import { RISK_STEP, RISK_TEXT } from "@/lib/design/risk";
import { todayInAppTimeZone } from "@/lib/format";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { coachAthletePath } from "@/lib/routes";
import type { AthleteProfile } from "@/lib/types";

const styles = {
  list: "kin-card divide-y divide-line overflow-hidden",
  row: "relative grid grid-cols-[3.5rem_1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-accent-soft sm:px-5",
  withScale: "lg:grid-cols-[3.5rem_1fr_auto_10rem]",
  withActions: "sm:grid-cols-[3.5rem_1fr_auto_auto]",
  value: "font-display text-xl font-semibold [font-variant-numeric:tabular-nums]",
  // El enlace del nombre cubre toda la fila; las acciones van encima para seguir siendo clicables
  link: "font-semibold text-ink after:absolute after:inset-0 hover:no-underline",
  actions: "relative col-span-full flex flex-wrap gap-2 sm:col-span-1 sm:justify-end",
};

/**
 * Deportistas con lo último de cada uno: mini medidor y escala de su último riesgo, cuenta y grabaciones.
 * Sin `summaries` (el admin no lee análisis) la fila lleva la foto en lugar del medidor y sin enlace.
 */
export async function AthleteRoster({
  athletes,
  summaries,
  empty,
  actions,
}: {
  athletes: AthleteProfile[];
  summaries?: Map<string, AthleteSummary>;
  empty: ReactNode;
  /** Botones propios de la fila (p. ej. grabar o quitar del equipo). */
  actions?: (athlete: AthleteProfile) => ReactNode;
}) {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  if (athletes.length === 0) return empty;
  const today = todayInAppTimeZone();

  return (
    <ul className={styles.list}>
      {athletes.map((athlete, i) => {
        const summary = summaries?.get(athlete.id);
        const score = summary?.latestScore ?? null;
        const level = score === null ? null : riskLevel(score);
        const delay = Math.min(i, 8);
        return (
          <li key={athlete.id} className={`kin-rise ${styles.row} ${actions ? styles.withActions : styles.withScale}`} style={cssVars({ "--i": delay })}>
            {!summaries ? (
              <span className="grid place-items-center"><Avatar name={athlete.display_name} imageUrl={athlete.display_avatar} /></span>
            ) : (
            <RiskDial
              mini
              score={score}
              delayMs={delay * 120 + 300}
              label={score === null ? format(t.coach.noRiskLabel, { name: athlete.display_name }) : format(t.coach.latestRiskLabel, { name: athlete.display_name, value: f.percent(score) })}
              className="w-14"
            />
            )}
            <span className="grid min-w-0 gap-0.5">
              {summaries ? <Link href={coachAthletePath(athlete.id)} className={styles.link}>{athlete.display_name}</Link> : <span className="font-semibold text-ink">{athlete.display_name}</span>}
              <span className="flex flex-wrap gap-x-3 text-sm text-ink-muted">
                <span>{athlete.is_managed ? t.athleteProfile.managed : t.athleteProfile.withAccount}</span>
                <span>{format(t.athleteProfile.ageValue, { years: ageOn(athlete.birth_date, today) })}</span>
                {summaries && <span>{summary ? format(t.coach.recordings, { count: summary.stats.total }) : t.coach.noRecordings}</span>}
              </span>
            </span>
            {!summaries ? (
              <span />
            ) : score !== null && level ? (
              <span className={`${styles.value} ${RISK_TEXT[level]}`}>{f.percent(score)}</span>
            ) : (
              <span className="text-sm text-ink-muted">{t.coach.noRisk}</span>
            )}
            {actions ? (
              <span className={styles.actions}>{actions(athlete)}</span>
            ) : (
              <span className="max-lg:hidden">
                {level && <RiskScale compact level={level} label={t.analysis.riskShort[level]} steps={format(t.analysis.riskSteps, { step: RISK_STEP[level] })} />}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
