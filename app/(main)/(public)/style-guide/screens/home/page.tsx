import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";

import { ButtonLink } from "@/components/instrument/Button";
import { RiskTrend } from "@/components/instrument/charts/RiskTrend";
import { CountUp } from "@/components/instrument/CountUp";
import { Dial } from "@/components/instrument/Dial";
import { Glyph } from "@/components/instrument/Glyph";
import { ScreenShell } from "@/components/instrument/ScreenShell";
import { AiStatus, RiskScale, ZoneChip } from "@/components/instrument/Status";
import { cssVars } from "@/lib/design/css";
import { GUIDE_SAMPLE, RECENT_ANALYSES, trendData } from "@/lib/design/guide-sample";
import { RISK_STEP } from "@/lib/design/risk";
import { TARGET_KNEE, zoneOf } from "@/lib/design/signals";
import { firstName } from "@/lib/format";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: `${t.styleGuide.screens.home.name} · ${t.styleGuide.metaTitle}`, robots: { index: false, follow: false } };
}

export default async function HomeScreen() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const s = t.styleGuide.screens;
  const h = s.home;
  const last = RECENT_ANALYSES[0];
  const trend = trendData(f, t.styleGuide.charts.trendLast);
  const analysisHref = ROUTES.styleGuideScreen("analysis");
  const inTarget = GUIDE_SAMPLE.timeline.filter((rep) => zoneOf(rep.peak.degrees) === "target").length;
  return (
    <ScreenShell active="home">
      <section aria-labelledby="home-title" className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 id="home-title" className="font-display text-hero font-bold tracking-tight text-ink">{format(h.greeting, { name: firstName(GUIDE_SAMPLE.athlete) })}</h1>
          <p className="max-w-prose text-lg text-ink-muted">{format(h.lead, { count: inTarget, total: GUIDE_SAMPLE.timeline.length })}</p>
          <span className="sm:hidden"><AiStatus state="ready" label={t.styleGuide.components.aiReady} /></span>
        </div>
        <ButtonLink href={ROUTES.styleGuideScreen("capture")} glyph="capture" className="max-sm:w-full">{h.newAnalysis}</ButtonLink>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-labelledby="home-last" className="kin-card kin-tinted grid content-start gap-5 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 id="home-last" className="font-display text-xl font-semibold text-ink">{h.last}</h2>
            <span className="text-sm text-ink-muted">{f.shortDate(last.date)}</span>
          </div>
          <ViewTransition name="kin-last-analysis" share="kin-morph" default="none">
            <Dial value={last.peak} peak={last.peak} target={TARGET_KNEE} labels label={`${s.analysis.peakKnee}: ${f.degrees(last.peak)}`} className="mx-auto w-full max-w-[17rem]">
              <CountUp value={last.peak} text={f.degrees(last.peak)} className="font-display text-3xl font-bold text-knee" />
            </Dial>
          </ViewTransition>
          <dl className="grid grid-cols-2 gap-3">
            <div className="kin-well grid gap-1 p-3">
              <dt className="text-xs text-ink-muted">{t.joints.knee_flexion}</dt>
              <dd><ZoneChip zone={zoneOf(last.peak)} label={t.styleGuide.color.names[zoneOf(last.peak)]} /></dd>
            </div>
            <div className="kin-well grid gap-1 p-3">
              <dt className="text-xs text-ink-muted">{s.analysis.repetitions}</dt>
              <dd className="font-display text-2xl font-semibold text-ink"><CountUp value={GUIDE_SAMPLE.repetitions.length} text={String(GUIDE_SAMPLE.repetitions.length)} /></dd>
            </div>
          </dl>
          <RiskScale level={last.level} label={t.analysis.risk[last.level]} steps={format(s.analysis.riskSteps, { step: RISK_STEP[last.level] })} value={f.percent(last.score)} />
          <ButtonLink href={analysisHref} variant="secondary" glyph="chevronRight" block>{h.openAnalysis}</ButtonLink>
        </section>

        <section aria-labelledby="home-trend" className="kin-card grid content-start gap-5 p-5 sm:p-6" style={cssVars({ "--tint": "var(--kin-risk-low)" })}>
          <h2 id="home-trend" className="font-display text-xl font-semibold text-ink">{h.trend}</h2>
          <RiskTrend {...trend} height="h-56 sm:h-64 lg:h-[24rem]" label={format(t.styleGuide.charts.trendLabel, { first: f.percent(trend.points[0].score), last: f.percent(trend.points.at(-1)!.score) })} bandLabels={t.analysis.riskShort} />
        </section>
      </div>

      <section aria-labelledby="home-recent" className="grid gap-3">
        <h2 id="home-recent" className="font-display text-xl font-semibold text-ink">{h.recent}</h2>
        <ul className="kin-card divide-y divide-line overflow-hidden">
          {RECENT_ANALYSES.map((item, i) => (
            <li key={item.id} className="kin-rise" style={cssVars({ "--i": i })}>
              <Link href={analysisHref} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-accent-soft sm:grid-cols-[3.5rem_1fr_auto_auto] sm:px-5">
                <Dial value={item.peak} target={TARGET_KNEE} ticks={false} delayMs={i * 120 + 300} label={f.degrees(item.peak)} className="w-14" />
                <span className="grid min-w-0 gap-0.5">
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    <Glyph name={item.movement} size={18} className="text-ink-muted" />
                    {t.analysis.movement[item.movement]}
                  </span>
                  <span className="text-sm text-ink-muted">{f.dateTime(item.date)}</span>
                </span>
                <span className="font-display text-xl font-semibold text-knee [font-variant-numeric:tabular-nums]">{f.degrees(item.peak)}</span>
                <span className="max-sm:hidden"><ZoneChip zone={zoneOf(item.peak)} label={t.styleGuide.color.names[zoneOf(item.peak)]} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </ScreenShell>
  );
}
