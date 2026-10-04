import { AnalysisList } from "@/components/analysis/AnalysisList";
import { RiskTrendChart } from "@/components/analysis/RiskTrendChart";
import { StatGrid } from "@/components/analysis/StatGrid";
import { statTiles } from "@/components/analysis/statTiles";
import { Section } from "@/components/app/Section";
import { NAV_BY_ROLE } from "@/lib/access";
import { computeStatistics, riskTrend } from "@/lib/analysis-stats";
import { redirect } from "next/navigation";

import { listAnalysesByAthlete } from "@/lib/data/analyses";
import { getMyAthleteProfile } from "@/lib/data/athletes";
import { getFormat, getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";
import type { JumpAnalysis } from "@/lib/types";

// Async Server Components que cada página envuelve en <Suspense>: el encabezado sale de inmediato
// y estos bloques llegan después, en otro chunk del mismo stream HTTP (SSR streaming, §10.2)

const RECENT_COUNT = 3;
const analysesHref = NAV_BY_ROLE.athlete.find((item) => item.key === "analyses")?.href;

/** Ficha del deportista → sus análisis. El layout ya exige la ficha: sin ella, al alta obligatoria. */
async function myAnalyses(): Promise<JumpAnalysis[]> {
  const profile = await getMyAthleteProfile();
  if (!profile) redirect(ROUTES.onboarding);
  return listAnalysesByAthlete(profile.id);
}

export async function AthleteOverview() {
  const fmt = await getFormat();
  const t = await getT();
  const analyses = await myAnalyses();
  const stats = computeStatistics(analyses);

  return (
    <>
      <Section title={t.athleteHome.summary}>
        <StatGrid tiles={statTiles(t, fmt, stats, ["total", "averageRisk", "highestRisk", "lastRecordedAt"])} />
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
  return <AnalysisList analyses={analyses} />;
}

export async function AthleteStats() {
  const t = await getT();
  const fmt = await getFormat();
  const analyses = await myAnalyses();
  const stats = computeStatistics(analyses);

  return (
    <>
      <StatGrid
        tiles={statTiles(t, fmt, stats, [
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
