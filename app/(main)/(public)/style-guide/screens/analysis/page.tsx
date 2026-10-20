import type { Metadata } from "next";
import { ViewTransition } from "react";

import { Button } from "@/components/instrument/Button";
import { AngleTimeline } from "@/components/instrument/charts/AngleTimeline";
import { CountUp } from "@/components/instrument/CountUp";
import { Dial } from "@/components/instrument/Dial";
import { ConfirmDialog } from "@/components/instrument/Dialog";
import { ScreenShell } from "@/components/instrument/ScreenShell";
import { RiskScale } from "@/components/instrument/Status";
import { cssVars } from "@/lib/design/css";
import { GUIDE_SAMPLE } from "@/lib/design/guide-sample";
import { RISK_STEP } from "@/lib/design/risk";
import { TARGET_KNEE, ZONE_CLASS, zoneOf } from "@/lib/design/signals";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";

// La inclinación del tronco en una sentadilla rara vez pasa de 60°; con 90 la aguja usa bien la esfera
const TRUNK_DIAL_MAX = 90;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: `${t.styleGuide.screens.analysis.name} · ${t.styleGuide.metaTitle}`, robots: { index: false, follow: false } };
}

export default async function AnalysisScreen() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const a = t.styleGuide.screens.analysis;
  const c = t.styleGuide.components;
  const sample = GUIDE_SAMPLE;
  const inTarget = sample.timeline.filter((rep) => zoneOf(rep.peak.degrees) === "target").length;
  return (
    <ScreenShell active="analysis">
      <section aria-labelledby="analysis-title" className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <p className="text-sm font-semibold text-ink-muted">{sample.athlete}</p>
          <h1 id="analysis-title" className="font-display text-3xl font-bold tracking-tight text-ink sm:text-hero">{format(a.title, { date: f.shortDate(sample.date) })}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button glyph="chat">{a.chat}</Button>
          <ConfirmDialog labels={{ open: a.delete, title: c.dialogTitle, body: c.dialogBody, confirm: c.dialogConfirm, cancel: c.dialogCancel }} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="kin-card kin-tinted grid content-start gap-3 p-5" aria-labelledby="analysis-knee">
          <h2 id="analysis-knee" className="text-sm font-semibold text-ink-muted">{a.peakKnee}</h2>
          <ViewTransition name="kin-last-analysis" share="kin-morph" default="none">
            <Dial value={sample.peakKnee} peak={sample.peakKnee} target={TARGET_KNEE} labels label={`${a.peakKnee}: ${f.degrees(sample.peakKnee)}`} className="mx-auto w-full max-w-[15rem]">
              <CountUp value={sample.peakKnee} text={f.degrees(sample.peakKnee)} className="font-display text-3xl font-bold text-knee" />
            </Dial>
          </ViewTransition>
        </article>
        <article className="kin-card kin-tinted grid content-start gap-3 p-5" style={cssVars({ "--tint": "var(--kin-trunk)" })} aria-labelledby="analysis-trunk">
          <h2 id="analysis-trunk" className="text-sm font-semibold text-ink-muted">{a.peakTrunk}</h2>
          <Dial value={sample.peakTrunk} peak={sample.peakTrunk} signal="trunk" max={TRUNK_DIAL_MAX} labels delayMs={150} label={`${a.peakTrunk}: ${f.degrees(sample.peakTrunk)}`} className="mx-auto w-full max-w-[15rem]">
            <CountUp value={sample.peakTrunk} text={f.degrees(sample.peakTrunk)} delayMs={150} className="font-display text-3xl font-bold text-trunk" />
          </Dial>
        </article>
        <article className="kin-card kin-tinted grid content-start gap-4 p-5" style={cssVars({ "--tint": "var(--kin-zone-target)" })} aria-labelledby="analysis-reps">
          <h2 id="analysis-reps" className="text-sm font-semibold text-ink-muted">{a.repetitions}</h2>
          <p className="font-display text-score font-bold text-ink"><CountUp value={sample.timeline.length} text={String(sample.timeline.length)} delayMs={300} /></p>
          <ol className="flex gap-1.5" aria-label={format(a.inTarget, { count: inTarget, total: sample.timeline.length })}>
            {sample.timeline.map((rep, i) => (
              <li key={rep.startMs} className={`kin-light h-8 flex-1 rounded-full ${ZONE_CLASS[zoneOf(rep.peak.degrees)].bg} ${ZONE_CLASS[zoneOf(rep.peak.degrees)].text}`} style={cssVars({ "--i": i })} />
            ))}
          </ol>
          <p className="text-sm text-ink">{format(a.inTarget, { count: inTarget, total: sample.timeline.length })}</p>
          <div className="grid gap-1.5">
            <span className="text-xs text-ink-muted">{a.risk}</span>
            <RiskScale level={sample.level} label={t.analysis.risk[sample.level]} steps={format(a.riskSteps, { step: RISK_STEP[sample.level] })} value={f.percent(sample.score)} />
          </div>
        </article>
      </div>

      <section aria-labelledby="analysis-timeline" className="kin-card grid gap-5 p-5 sm:p-6" style={cssVars({ "--tint": "var(--kin-center)" })}>
        <div className="grid gap-1">
          <h2 id="analysis-timeline" className="font-display text-xl font-semibold text-ink">{t.styleGuide.charts.timeline}</h2>
          <p className="text-sm text-ink-muted">{t.styleGuide.charts.timelineLead}</p>
        </div>
        <AngleTimeline knee={sample.knee} trunk={sample.trunk} repetitions={sample.timeline} durationMs={sample.durationMs} />
      </section>
    </ScreenShell>
  );
}
