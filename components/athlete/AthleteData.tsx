import Link from "next/link";
import { redirect } from "next/navigation";

import { AnalysisList } from "@/components/analysis/AnalysisList";
import { RiskTrend } from "@/components/instrument/charts/RiskTrend";
import { EmptyState } from "@/components/instrument/States";
import { NAV_BY_ROLE } from "@/lib/access";
import { countInTarget, repetitionKneePeaks } from "@/lib/analysis-reading";
import { riskSessions, riskTrendData } from "@/lib/charts/trend";
import { cssVars } from "@/lib/design/css";
import { getAnalysis, listAnalysesByAthlete } from "@/lib/data/analyses";
import { getMyAthleteProfile } from "@/lib/data/athletes";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";
import type { AnalysisSummary } from "@/lib/types";

import { LastAnalysisCard } from "./LastAnalysisCard";

// Async Server Components que cada página envuelve en <Suspense>: el encabezado sale de inmediato
// y estos bloques llegan después, en otro chunk del mismo stream HTTP

const RECENT_COUNT = 3;
const analysesHref = NAV_BY_ROLE.athlete.find((item) => item.key === "analyses")?.href;

/** Ficha del deportista → sus análisis. El layout ya exige la ficha: sin ella, al alta obligatoria. */
export async function myAnalyses(): Promise<AnalysisSummary[]> {
  const profile = await getMyAthleteProfile();
  if (!profile) redirect(ROUTES.onboarding);
  return listAnalysesByAthlete(profile.id);
}

const lastProcessed = (analyses: AnalysisSummary[]) => analyses.find((a) => a.status === "processed");

/** Frase de bienvenida según el último análisis: cuántas repeticiones quedaron en el rango, o su riesgo. */
export async function AthleteLead() {
  const t = await getT();
  const l = t.athleteHome.lead;
  const analyses = await myAnalyses();
  const last = lastProcessed(analyses);
  let text = analyses.length === 0 ? l.empty : l.pending;
  if (last) {
    // getAnalysis está en caché por request: la tarjeta del último análisis reutiliza esta misma lectura
    const detail = await getAnalysis(last.id);
    const peaks = detail.risk_assessment ? repetitionKneePeaks(detail.risk_assessment) : [];
    if (detail.knee_target && peaks.length) text = format(l[detail.movement_type], { count: countInTarget(peaks, detail.knee_target), total: peaks.length });
    else if (detail.risk_level) text = format(l.risk, { risk: t.analysis.risk[detail.risk_level].toLowerCase() });
  }
  return <p className="max-w-prose text-lg text-ink-muted">{text}</p>;
}

export async function AthleteOverview() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const h = t.athleteHome;
  const analyses = await myAnalyses();
  const last = lastProcessed(analyses);
  const sessions = riskSessions(analyses);
  const trend = sessions.length >= 2 ? riskTrendData(sessions, f, h.trendLast) : null;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {last ? <LastAnalysisCard analysis={await getAnalysis(last.id)} /> : <EmptyState title={h.emptyTitle} body={h.lead.empty} />}
        <section aria-labelledby="home-trend" className="kin-card grid content-start gap-5 p-5 sm:p-6" style={cssVars({ "--tint": "var(--kin-risk-low)" })}>
          <h2 id="home-trend" className="font-display text-xl font-semibold text-ink">{h.trend}</h2>
          {trend ? (
            <RiskTrend
              {...trend}
              height="h-56 sm:h-64 lg:h-[24rem]"
              label={format(h.trendLabel, { count: sessions.length, first: f.percent(sessions[0].score), last: f.percent(sessions.at(-1)!.score) })}
              bandLabels={t.analysis.riskShort}
            />
          ) : (
            <EmptyState title={h.trendEmptyTitle} body={h.trendEmptyBody} />
          )}
        </section>
      </div>

      <section aria-labelledby="home-recent" className="grid gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h2 id="home-recent" className="font-display text-xl font-semibold text-ink">{h.recent}</h2>
          {analyses.length > RECENT_COUNT && analysesHref && <Link href={analysesHref} className="text-sm font-semibold">{h.seeAll}</Link>}
        </div>
        <AnalysisList analyses={analyses.slice(0, RECENT_COUNT)} />
      </section>
    </>
  );
}

export async function AthleteAnalyses() {
  return <AnalysisList analyses={await myAnalyses()} />;
}
