import { RangeComparison } from "@/components/instrument/charts/RangeComparison";
import { RiskTrend } from "@/components/instrument/charts/RiskTrend";
import { CountUp } from "@/components/instrument/CountUp";
import { EmptyState } from "@/components/instrument/States";
import { computeStatistics, riskLevel } from "@/lib/analysis-stats";
import { getRiskCuts } from "@/lib/data/public";
import { niceTicks } from "@/lib/charts/scale";
import { riskSessions, riskTrendData } from "@/lib/charts/trend";
import { cssVars } from "@/lib/design/css";
import { RISK_DIAL_MAX, RISK_FILL, RISK_TONE } from "@/lib/design/risk";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { type AnalysisSummary, MOVEMENT_TYPES } from "@/lib/types";

import { RiskDial } from "./RiskDial";

const card = "kin-card grid content-start gap-5 p-5 sm:p-6";

type Count = { label: string; value: number };

/**
 * Estadísticas con instrumentos: medidores de riesgo, contadores en pozos, sesiones que se encienden y
 * gráficas en su carcasa. `voice` elige los textos: "self" le habla al deportista; "group" describe a
 * un deportista o un equipo desde el coach. `leading` agrega contadores al principio (p. ej. deportistas).
 */
export async function RiskInstruments({ analyses, voice, leading = [] }: { analyses: AnalysisSummary[]; voice: "self" | "group"; leading?: Count[] }) {
  const [t, f, cuts] = await Promise.all([getT(), getFormat(), getRiskCuts()]);
  const s = t.stats;
  const copy = voice === "self"
    ? { emptyBody: s.emptyBody, trendLabel: t.athleteHome.trendLabel, trendEmptyBody: t.athleteHome.trendEmptyBody, kneeTitle: s.kneeTitle, kneeLead: s.kneeLead }
    : s.group;
  const stats = computeStatistics(analyses, cuts);
  const sessions = riskSessions(analyses);
  if (stats.averageRisk === null || stats.highestRisk === null) return <EmptyState title={t.athleteHome.emptyTitle} body={copy.emptyBody} />;

  const gauges = [
    { id: "average", label: s.averageRisk, score: stats.averageRisk },
    { id: "highest", label: s.highestRisk, score: stats.highestRisk },
  ];
  const counts: Count[] = [
    ...leading,
    { label: s.recordings, value: stats.total },
    { label: s.processed, value: stats.processed },
    { label: s.pending, value: stats.pending },
    { label: s.failed, value: stats.failed },
    { label: s.highRiskCount, value: stats.highRiskCount },
  ];
  // Una fila por movimiento con la mediana de picos de cada sesión, sobre el rango de su análisis más reciente
  const knee = MOVEMENT_TYPES.flatMap((movement) => {
    const own = analyses.filter((a) => a.movement_type === movement && a.knee_median_peak_degrees !== null);
    const values = own.map((a) => a.knee_median_peak_degrees!).sort((a, b) => a - b);
    const target = own.find((a) => a.knee_target)?.knee_target;
    return values.length && target ? [{ movement, target, row: { label: t.analysis.movement[movement], min: values[0], median: values[Math.floor(values.length / 2)], max: values.at(-1)! } }] : [];
  });
  const kneeTicks = niceTicks(0, Math.max(...knee.map((k) => k.row.max), ...knee.map((k) => k.target.high ?? k.target.low ?? 0)), 5);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {gauges.map((gauge, i) => {
          const level = riskLevel(gauge.score, cuts);
          return (
            <section key={gauge.id} aria-labelledby={`stats-${gauge.id}`} className={`${card} kin-tinted`} style={cssVars({ "--tint": RISK_TONE[level].tint })}>
              <h2 id={`stats-${gauge.id}`} className="font-display text-xl font-semibold text-ink">{gauge.label}</h2>
              <RiskDial
                score={gauge.score}
                cuts={cuts}
                delayMs={i * 150}
                label={`${gauge.label}: ${f.percent(gauge.score)}, ${t.analysis.risk[level]}`}
                className="mx-auto w-full max-w-[17rem]"
              >
                <CountUp value={gauge.score * RISK_DIAL_MAX} text={f.percent(gauge.score)} delayMs={i * 150} className={`font-display text-3xl font-bold ${RISK_TONE[level].text}`} />
                <span className="text-sm font-semibold text-ink-muted">{t.analysis.riskShort[level]}</span>
              </RiskDial>
            </section>
          );
        })}
      </div>

      <section aria-labelledby="stats-counts" className={card}>
        <h2 id="stats-counts" className="visually-hidden">{s.recordings}</h2>
        <dl className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${counts.length > 5 ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}>
          {counts.map((count, i) => (
            <div key={count.label} className="kin-well grid gap-1 p-3">
              <dt className="text-xs text-ink-muted">{count.label}</dt>
              <dd className="font-display text-3xl font-semibold text-ink"><CountUp value={count.value} text={String(count.value)} delayMs={i * 90} /></dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-2">
          <p className="text-sm text-ink-muted">{s.sessions}</p>
          <ol className="flex flex-wrap gap-1.5">
            {sessions.map((session, i) => (
              <li key={i} className={`kin-light h-6 w-3 rounded-full ${RISK_FILL[session.level]}`} style={cssVars({ "--i": i })}>
                <span className="visually-hidden">{`${f.shortDate(session.date)}: ${f.percent(session.score)}, ${t.analysis.risk[session.level]}`}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="stats-trend" className={card} style={cssVars({ "--tint": "var(--kin-risk-low)" })}>
        <h2 id="stats-trend" className="font-display text-xl font-semibold text-ink">{s.trend}</h2>
        {sessions.length >= 2 ? (
          <RiskTrend
            {...riskTrendData(sessions, f, t.athleteHome.trendLast)}
            height="h-60 sm:h-72"
            label={format(copy.trendLabel, { count: sessions.length, first: f.percent(sessions[0].score), last: f.percent(sessions.at(-1)!.score) })}
            bandLabels={t.analysis.riskShort}
          />
        ) : (
          <EmptyState title={t.athleteHome.trendEmptyTitle} body={copy.trendEmptyBody} />
        )}
      </section>

      {knee.length > 0 && (
        <section aria-labelledby="stats-knee" className={card} style={cssVars({ "--tint": "var(--kin-knee)" })}>
          <div className="grid gap-1">
            <h2 id="stats-knee" className="font-display text-xl font-semibold text-ink">{copy.kneeTitle}</h2>
            <p className="text-sm text-ink-muted">{copy.kneeLead}</p>
          </div>
          {knee.map(({ movement, target, row }) => (
            <RangeComparison key={movement} rows={[row]} target={target} domain={[0, kneeTicks.at(-1)!]} ticks={kneeTicks} format={f.degrees} medianLabel={t.styleGuide.charts.median} />
          ))}
          <p className="text-xs text-ink-muted">{t.analysis.rangesNote}</p>
        </section>
      )}
    </>
  );
}
