import { AnalysisList } from "@/components/analysis/AnalysisList";
import { RiskBars } from "@/components/analysis/RiskBars";
import { RiskTrendChart } from "@/components/analysis/RiskTrendChart";
import { StatGrid } from "@/components/analysis/StatGrid";
import { statTiles } from "@/components/analysis/statTiles";
import pageStyles from "@/components/app/Page.module.css";
import { Section } from "@/components/app/Section";
import { TeamFilter } from "@/components/teams/TeamFilter";
import { computeStatistics, riskTrend, statsByAthlete } from "@/lib/analysis-stats";
import { listAnalysesByAthlete } from "@/lib/data/analyses";
import { listMyAthletes, listTeamAnalyses } from "@/lib/data/coach";
import { listTeams } from "@/lib/data/teams";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { coachAthletePath, teamStatsPath } from "@/lib/routes";
import { findTeam, scopeToTeam, statsByTeam } from "@/lib/team-stats";

import { AthleteRoster } from "./AthleteRoster";

// Async Server Components que cada página del coach envuelve en <Suspense> (SSR streaming, §3)

/** Ambas peticiones salen en el mismo tick y se esperan juntas (§10.2): no una detrás de otra. */
async function teamData() {
  const [athletes, analyses] = await Promise.all([listMyAthletes(), listTeamAnalyses()]);
  return { athletes, analyses };
}

export async function CoachOverview() {
  const fmt = await getFormat();
  const t = await getT();
  const { athletes, analyses } = await teamData();
  const stats = computeStatistics(analyses);
  return (
    <>
      <Section title={t.coach.teamSummary}>
        <StatGrid
          tiles={[
            { label: t.coach.athletesCount, value: String(athletes.length) },
            ...statTiles(t, fmt, stats, ["total", "averageRisk", "highRiskCount"]),
          ]}
        />
      </Section>
      <Section title={t.coach.athletes}>
        <AthleteRoster athletes={athletes} summaries={statsByAthlete(analyses)} />
      </Section>
    </>
  );
}

/** Todos los deportistas del coach con su último riesgo (página Deportistas). */
export async function CoachAthletesList() {
  const { athletes, analyses } = await teamData();
  return <AthleteRoster athletes={athletes} summaries={statsByAthlete(analyses)} />;
}

export async function TeamAnalyses() {
  const { athletes, analyses } = await teamData();
  const names = new Map(athletes.map((athlete) => [athlete.id, athlete.display_name]));
  return <AnalysisList analyses={analyses} subtitleFor={(analysis) => names.get(analysis.athlete_id)} />;
}

/** Estadísticas del coach, de todos sus deportistas o de un equipo (`?team=`). */
export async function TeamStats({ teamParam }: { teamParam?: string | string[] }) {
  const fmt = await getFormat();
  const t = await getT();
  const [{ athletes: allAthletes, analyses: allAnalyses }, teams] = await Promise.all([teamData(), listTeams()]);
  const team = findTeam(teams, teamParam);
  const { athletes, analyses } = scopeToTeam(allAthletes, allAnalyses, team);
  const summaries = statsByAthlete(analyses);
  return (
    <>
      {teams.length > 0 && <TeamFilter teams={teams} selectedId={team?.id} />}
      {team && <p className={pageStyles.subtitle}>{format(t.teams.showingTeam, { name: team.name })}</p>}
      <StatGrid
        tiles={[
          { label: t.coach.athletesCount, value: String(athletes.length) },
          ...statTiles(t, fmt, computeStatistics(analyses), ["total", "processed", "pending", "averageRisk", "highestRisk", "highRiskCount", "lastRecordedAt"]),
        ]}
      />
      <RiskBars
        title={t.coach.byAthleteTitle}
        subtitle={t.coach.byAthleteSubtitle}
        emptyText={t.coach.byAthleteEmpty}
        bars={athletes.flatMap((athlete) => {
          const average = summaries.get(athlete.id)?.stats.averageRisk;
          return average == null ? [] : [{ key: athlete.id, label: athlete.display_name, value: average, href: coachAthletePath(athlete.id) }];
        })}
      />
      {/* Sin filtro, además, la comparación entre equipos */}
      {!team && teams.length > 0 && (
        <RiskBars
          title={t.teams.byTeamTitle}
          subtitle={t.teams.byTeamSubtitle}
          emptyText={t.teams.byTeamEmpty}
          bars={statsByTeam(teams, allAnalyses).flatMap(({ team: group, stats }) =>
            stats.averageRisk == null ? [] : [{ key: group.id, label: group.name, value: stats.averageRisk, href: teamStatsPath(group.id) }],
          )}
        />
      )}
    </>
  );
}

/** Cifras, evolución y grabaciones de un deportista del coach (la ficha ya se validó en la página). */
export async function CoachAthleteRecordings({ athleteId }: { athleteId: number }) {
  const fmt = await getFormat();
  const t = await getT();
  const analyses = await listAnalysesByAthlete(athleteId);
  return (
    <>
      <StatGrid tiles={statTiles(t, fmt, computeStatistics(analyses), ["total", "averageRisk", "highestRisk", "lastRecordedAt"])} />
      <RiskTrendChart points={riskTrend(analyses)} />
      <Section title={t.coach.recordingsTitle}>
        <AnalysisList analyses={analyses} />
      </Section>
    </>
  );
}
