import { Caption, GuideSection, panel, subtitle } from "./GuideSection";
import { AngleTimeline } from "../lab/charts/AngleTimeline";
import { RangeComparison } from "../lab/charts/RangeComparison";
import { RiskTrend } from "../lab/charts/RiskTrend";

import { lttb } from "@/lib/charts/lttb";
import { niceTicks } from "@/lib/charts/scale";
import { SAMPLE_ANALYSIS, SAMPLE_DURATION_MS, SAMPLE_SESSIONS } from "@/lib/design/sample-analysis";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";

// 300 puntos por serie bastan para 1200 px; el cliente recibe 600 en vez de 2400 muestras
const DRAWN_POINTS = 300;

// Mediana y rango de flexión máxima de cada deportista: datos de ejemplo
const COMPARISON = [
  { min: 96, median: 104, max: 112 },
  { min: 78, median: 88, max: 101 },
  { min: 101, median: 109, max: 118 },
  { min: 84, median: 92, max: 97 },
];

const styles = {
  wide: `${panel} grid gap-6`,
  pair: "grid gap-4 lg:grid-cols-2",
  block: `${panel} grid content-start gap-6`,
};

const decimate = (samples: typeof SAMPLE_ANALYSIS.knee) =>
  lttb(samples.map((s) => ({ x: s.ms, y: s.degrees, ...s })), DRAWN_POINTS).map(({ ms, degrees }) => ({ ms, degrees }));

export async function ChartsSection() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const ch = t.styleGuide.charts;
  const knee = decimate(SAMPLE_ANALYSIS.knee);
  const trunk = decimate(SAMPLE_ANALYSIS.trunk);
  const maxAngle = Math.max(...knee.map((s) => s.degrees), ...trunk.map((s) => s.degrees));
  const degreeTicks = niceTicks(0, maxAngle, 4).map((value) => ({ value, label: f.degrees(value) }));
  const secondTicks = niceTicks(0, SAMPLE_DURATION_MS, 8)
    .filter((ms) => ms <= SAMPLE_DURATION_MS)
    .map((value) => ({ value, label: `${value / 1000} ${ch.seconds}` }));
  const sessions = SAMPLE_SESSIONS.map((session, i) => ({ x: i, score: session.score, level: session.level, label: f.shortDate(session.date) }));

  return (
    <GuideSection id="charts" title={t.styleGuide.sections.charts} intro={ch.intro}>
      <figure className={styles.wide}>
        <h3 className={subtitle}>{ch.angleTitle}</h3>
        <AngleTimeline
          series={[
            { key: "knee", label: t.joints.knee_flexion, samples: knee, tone: "accent" },
            { key: "trunk", label: t.joints.trunk_inclination, samples: trunk, tone: "alt" },
          ]}
          repetitions={SAMPLE_ANALYSIS.repetitions.map((rep, i) => ({
            ...rep,
            label: `${format(ch.repetition, { index: i + 1 })}: ${t.analysis.risk[rep.level]}`,
          }))}
          durationMs={SAMPLE_DURATION_MS}
          yTicks={degreeTicks}
          xTicks={secondTicks}
          labels={{ chart: ch.angleTitle, playhead: ch.playhead, play: ch.play, pause: ch.pause, repetitions: ch.repetitionsLabel, seconds: ch.seconds, degrees: ch.degrees }}
        />
        <Caption>{ch.angleCaption}</Caption>
      </figure>
      <div className={styles.pair}>
        <figure className={styles.block}>
          <h3 className={subtitle}>{ch.trendTitle}</h3>
          <RiskTrend
            points={sessions}
            yTicks={[0, 0.25, 0.5, 0.75, 1].map((value) => ({ value, label: f.percent(value) }))}
            xTicks={sessions.filter((_, i) => i % 2 === 0 || i === sessions.length - 1).map((s) => ({ value: s.x, label: s.label }))}
            label={ch.trendTitle}
            lastLabel={f.percent(sessions.at(-1)!.score)}
          />
          <Caption>{ch.trendCaption}</Caption>
        </figure>
        <figure className={styles.block}>
          <h3 className={subtitle}>{ch.compareTitle}</h3>
          <RangeComparison
            rows={COMPARISON.map((row, i) => ({ ...row, label: ch.athletes[i] }))}
            domain={[70, 125]}
            ticks={[70, 85, 100, 115]}
            format={f.degrees}
          />
          <Caption>{ch.compareCaption}</Caption>
        </figure>
      </div>
    </GuideSection>
  );
}
