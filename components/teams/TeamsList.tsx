import Link from "next/link";

import { Glyph } from "@/components/instrument/Glyph";
import { EmptyState } from "@/components/instrument/States";
import { RiskScale } from "@/components/instrument/Status";
import { type AnalysisStatistics, riskLevel } from "@/lib/analysis-stats";
import { cssVars } from "@/lib/design/css";
import { RISK_STEP, RISK_TEXT } from "@/lib/design/risk";
import { format, plural } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { teamPath } from "@/lib/routes";
import type { Team } from "@/lib/types";

import { TeamEmblem } from "./TeamEmblem";

const styles = {
  list: "kin-card divide-y divide-line overflow-hidden",
  link: "grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 px-4 py-3 text-ink transition-colors hover:bg-accent-soft hover:no-underline sm:px-5 lg:grid-cols-[3.5rem_1fr_auto_10rem_1.25rem]",
  value: "font-display text-xl font-semibold [font-variant-numeric:tabular-nums]",
};

/**
 * Equipos con su emblema o logo y cuántos deportistas tienen. El coach ve además el riesgo promedio
 * de cada uno (`stats`); el admin, de quién es cada equipo (`ownerNames`).
 */
export async function TeamsList({
  teams,
  section,
  stats,
  ownerNames,
}: {
  teams: Team[];
  section: "coach" | "admin";
  stats?: Map<string, AnalysisStatistics>;
  ownerNames?: Map<string, string>;
}) {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  if (teams.length === 0) return <EmptyState title={t.teams.empty} body={t.teams.emptyHint} />;

  return (
    <ul className={styles.list}>
      {teams.map((team, i) => {
        const average = stats?.get(team.id)?.averageRisk ?? null;
        const level = average === null ? null : riskLevel(average);
        return (
          <li key={team.id} className="kin-rise" style={cssVars({ "--i": Math.min(i, 8) })}>
            <Link href={teamPath(section, team.id)} className={styles.link}>
              <TeamEmblem team={team} />
              <span className="grid min-w-0 gap-0.5">
                <span className="font-display text-lg font-semibold [overflow-wrap:anywhere]">{team.name}</span>
                <span className="flex flex-wrap gap-x-3 text-sm text-ink-muted">
                  <span>{plural(t.teams.members, team.athlete_ids.length)}</span>
                  {ownerNames && <span>{format(t.teams.ownedBy, { name: ownerNames.get(team.owner_id) ?? t.teams.unknownOwner })}</span>}
                </span>
              </span>
              {level && average !== null ? (
                <span className={`${styles.value} ${RISK_TEXT[level]}`}>{f.percent(average)}</span>
              ) : (
                <span className="text-sm text-ink-muted">{stats ? t.coach.noRisk : ""}</span>
              )}
              <span className="max-lg:hidden">
                {level && <RiskScale compact level={level} label={t.analysis.riskShort[level]} steps={format(t.analysis.riskSteps, { step: RISK_STEP[level] })} />}
              </span>
              <Glyph name="chevronRight" size={18} className="text-ink-muted max-lg:hidden" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
