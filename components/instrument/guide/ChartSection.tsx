import Link from "next/link";

import { GuideSection, Specimen } from "./GuideSection";
import { AngleTimeline } from "../charts/AngleTimeline";
import { RangeComparison } from "../charts/RangeComparison";
import { RiskTrend } from "../charts/RiskTrend";
import { Glyph } from "../Glyph";
import { SimulatedAnalysis } from "../SimulatedAnalysis";

import { cssVars } from "@/lib/design/css";
import { GUIDE_SAMPLE, TEAM_RANGES, trendData } from "@/lib/design/guide-sample";
import type { GlyphName } from "@/lib/design/icons";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { ROUTES } from "@/lib/routes";

const card = "kin-card grid content-start gap-5 p-5 sm:p-6";
const COMPARISON_DOMAIN: [number, number] = [70, 140];
const COMPARISON_TICKS = [70, 90, 120, 140];

export async function ChartSection() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const c = t.styleGuide.charts;
  const trend = trendData(f, c.trendLast);
  const sessions = GUIDE_SAMPLE.sessions;
  return (
    <GuideSection id="charts" title={t.styleGuide.sections.charts} lead={c.lead} tint="var(--kin-center)">
      <Specimen title={c.timeline} lead={c.timelineLead} className={card}>
        <AngleTimeline knee={GUIDE_SAMPLE.knee} trunk={GUIDE_SAMPLE.trunk} repetitions={GUIDE_SAMPLE.timeline} durationMs={GUIDE_SAMPLE.durationMs} target={GUIDE_SAMPLE.kneeTarget} zoneNames={t.analysis.kneeZones[GUIDE_SAMPLE.movement]} />
      </Specimen>
      <div className="grid gap-5 lg:grid-cols-2">
        <Specimen title={c.trend} lead={c.trendLead} className={card}>
          <RiskTrend {...trend} label={format(c.trendLabel, { first: f.percent(sessions[0].score), last: f.percent(sessions.at(-1)!.score) })} bandLabels={t.analysis.riskShort} />
        </Specimen>
        <Specimen title={c.comparison} lead={c.comparisonLead} className={card}>
          <RangeComparison rows={TEAM_RANGES} domain={COMPARISON_DOMAIN} ticks={COMPARISON_TICKS} format={f.degrees} medianLabel={c.median} target={GUIDE_SAMPLE.kneeTarget} />
        </Specimen>
      </div>
    </GuideSection>
  );
}

export async function ProgressSection() {
  const t = await getT();
  return (
    <GuideSection id="progress" title={t.styleGuide.sections.progress} lead={t.styleGuide.progress.lead} tint="var(--kin-hip)">
      {/* Como la lectura en vivo, el progreso va en cabina oscura: el anillo de colores es lo que debe brillar */}
      <div data-theme="dark" className="kin-card kin-tinted p-5 sm:p-8" style={cssVars({ "--tint": "var(--kin-hip)" })}>
        <SimulatedAnalysis />
      </div>
    </GuideSection>
  );
}

const SCREENS: { id: "home" | "analysis" | "capture"; glyph: GlyphName; tint: string }[] = [
  { id: "home", glyph: "overview", tint: "var(--kin-knee)" },
  { id: "analysis", glyph: "angle", tint: "var(--kin-center)" },
  { id: "capture", glyph: "capture", tint: "var(--kin-trunk)" },
];

export async function ScreensSection() {
  const t = await getT();
  const s = t.styleGuide.screens;
  return (
    <GuideSection id="screens" title={t.styleGuide.sections.screens} lead={s.lead} tint="var(--kin-trunk)">
      <ol className="grid gap-3">
        {SCREENS.map((screen, i) => (
          <li key={screen.id}>
            <Link href={ROUTES.styleGuideScreen(screen.id)} className="kin-card kin-lift kin-tinted grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 sm:p-5" style={cssVars({ "--tint": screen.tint })}>
              <span className="font-display text-3xl font-bold text-ink-muted [font-variant-numeric:tabular-nums]" aria-hidden>{`0${i + 1}`}</span>
              <span className="grid gap-0.5">
                <span className="font-display text-xl font-semibold text-ink">{s[screen.id].name}</span>
                <span className="text-sm text-ink-muted">{s[screen.id].summary}</span>
              </span>
              <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent"><Glyph name={screen.glyph} size={20} /></span>
            </Link>
          </li>
        ))}
      </ol>
    </GuideSection>
  );
}
