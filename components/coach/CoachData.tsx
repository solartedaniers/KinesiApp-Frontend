import { AnalysisList } from "@/components/analysis/AnalysisList";
import { RiskBars } from "@/components/analysis/RiskBars";
import { RiskTrendChart } from "@/components/analysis/RiskTrendChart";
import { StatGrid } from "@/components/analysis/StatGrid";
import { statTiles } from "@/components/analysis/statTiles";
import { Section } from "@/components/app/Section";
import { computeStatistics, riskTrend, statsByAthlete } from "@/lib/analysis-stats";
import { listAnalysesByAthlete } from "@/lib/data/analyses";
import { listMyAthletes, listTeamAnalyses } from "@/lib/data/coach";
import { t } from "@/lib/i18n";
import { coachAthletePath } from "@/lib/routes";

import { AthleteRoster } from "./AthleteRoster";

// Async Server Components que cada página del coach envuelve en <Suspense> (SSR streaming, §3)

/** Ambas peticiones salen en el mismo tick y se esperan juntas (§10.2): no una detrás de otra. */
async function teamData() {
  const [athletes, analyses] = await Promise.all([listMyAthletes(), listTeamAnalyses()]);
  return { athletes, analyses };
}

export async function CoachOverview() {
  const { athletes, analyses } = await teamData();
  const stats = computeStatistics(analyses);
  return (
    <>
      <Section title={t.coach.teamSummary}>
        <StatGrid
          tiles={[
            { label: t.coach.athletesCount, value: String(athletes.length) },
            ...statTiles(stats, ["total", "averageRisk", "highRiskCount"]),
          ]}
        />
      </Section>
      <Section title={t.coach.athletes}>
        <AthleteRoster athletes={athletes} summaries={statsByAthlete(analyses)} />
      </Section>
    </>
  );
}

export async function TeamAnalyses() {
  const { athletes, analyses } = await teamData();
  const names = new Map(athletes.map((athlete) => [athlete.id, athlete.display_name]));
  return <AnalysisList analyses={analyses} subtitleFor={(analysis) => names.get(analysis.athlete_id)} />;
}

export async function TeamStats() {
  const { athletes, analyses } = await teamData();
  const summaries = statsByAthlete(analyses);
  return (
    <>
      <StatGrid
        tiles={[
          { label: t.coach.athletesCount, value: String(athletes.length) },
          ...statTiles(computeStatistics(analyses), ["total", "processed", "pending", "averageRisk", "highestRisk", "highRiskCount", "lastRecordedAt"]),
        ]}
      />
      <RiskBars
        title={t.coach.byAthleteTitle}
        subtitle={t.coach.byAthleteSubtitle}
        bars={athletes.flatMap((athlete) => {
          const average = summaries.get(athlete.id)?.stats.averageRisk;
          return average == null ? [] : [{ key: athlete.id, label: athlete.display_name, value: average, href: coachAthletePath(athlete.id) }];
        })}
      />
    </>
  );
}

/** Cifras, evolución y grabaciones de un deportista del coach (la ficha ya se validó en la página). */
export async function CoachAthleteRecordings({ athleteId }: { athleteId: number }) {
  const analyses = await listAnalysesByAthlete(athleteId);
  return (
    <>
      <StatGrid tiles={statTiles(computeStatistics(analyses), ["total", "averageRisk", "highestRisk", "lastRecordedAt"])} />
      <RiskTrendChart points={riskTrend(analyses)} />
      <Section title={t.coach.recordingsTitle}>
        <AnalysisList analyses={analyses} />
      </Section>
    </>
  );
}
