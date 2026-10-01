import { AnalysisList } from "@/components/analysis/AnalysisList";
import { RiskTrendChart } from "@/components/analysis/RiskTrendChart";
import { StatGrid } from "@/components/analysis/StatGrid";
import { statTiles } from "@/components/analysis/statTiles";
import { Section } from "@/components/app/Section";
import { NAV_BY_ROLE } from "@/lib/access";
import { computeStatistics, riskTrend } from "@/lib/analysis-stats";
import { listAnalysesByAthlete } from "@/lib/data/analyses";
import { getMyAthleteProfile } from "@/lib/data/athletes";
import { t } from "@/lib/i18n";
import type { JumpAnalysis } from "@/lib/types";

import { ProfileMissing } from "./ProfileMissing";

// Async Server Components que cada página envuelve en <Suspense>: el encabezado sale de inmediato
// y estos bloques llegan después, en otro chunk del mismo stream HTTP (SSR streaming, §10.2)

const RECENT_COUNT = 3;
const analysesHref = NAV_BY_ROLE.athlete.find((item) => item.key === "analyses")?.href;

/** Ficha del deportista → sus análisis. Sin ficha no hay análisis que pedir. */
async function myAnalyses(): Promise<JumpAnalysis[] | null> {
  const profile = await getMyAthleteProfile();
  return profile ? listAnalysesByAthlete(profile.id) : null;
}

export async function AthleteOverview() {
  const analyses = await myAnalyses();
  if (!analyses) return <ProfileMissing />;
  const stats = computeStatistics(analyses);

  return (
    <>
      <Section title={t.athleteHome.summary}>
        <StatGrid tiles={statTiles(stats, ["total", "averageRisk", "highestRisk", "lastRecordedAt"])} />
      </Section>
      <Section
        title={t.athleteHome.recent}
        action={analyses.length > RECENT_COUNT && analysesHref ? { href: analysesHref, label: t.athleteHome.seeAll } : undefined}
      >
        <AnalysisList analyses={analyses.slice(0, RECENT_COUNT)} />
      </Section>
    </>
  );
}

export async function AthleteAnalyses() {
  const analyses = await myAnalyses();
  return analyses ? <AnalysisList analyses={analyses} /> : <ProfileMissing />;
}

export async function AthleteStats() {
  const analyses = await myAnalyses();
  if (!analyses) return <ProfileMissing />;
  const stats = computeStatistics(analyses);

  return (
    <>
      <StatGrid
        tiles={statTiles(stats, [
          "total",
          "processed",
          "pending",
          "failed",
          "averageRisk",
          "highestRisk",
          "highRiskCount",
          "lastRecordedAt",
        ])}
      />
      <RiskTrendChart points={riskTrend(analyses)} />
    </>
  );
}
