import { ViewTransition } from "react";

import { ButtonLink } from "@/components/instrument/Button";
import { CountUp } from "@/components/instrument/CountUp";
import { Dial } from "@/components/instrument/Dial";
import { RiskScale, ZoneChip } from "@/components/instrument/Status";
import { repetitionKneePeaks } from "@/lib/analysis-reading";
import { riskLevel } from "@/lib/analysis-stats";
import { RISK_STEP } from "@/lib/design/risk";
import { zoneOf } from "@/lib/design/signals";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { analysisPath } from "@/lib/routes";
import type { JumpAnalysis } from "@/lib/types";

/** Tarjeta del último análisis procesado, como en la guía: medidor de rodilla, zona, repeticiones y riesgo. */
export async function LastAnalysisCard({ analysis }: { analysis: JumpAnalysis }) {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const h = t.athleteHome;
  const knee = analysis.knee_median_peak_degrees;
  const target = analysis.knee_target;
  const peaks = analysis.risk_assessment ? repetitionKneePeaks(analysis.risk_assessment) : [];
  const measured = peaks.filter((peak) => peak !== null);
  const zone = knee !== null && target ? zoneOf(knee, target) : null;
  const level = analysis.risk_level ?? (analysis.risk_score === null ? null : riskLevel(analysis.risk_score));
  return (
    <section aria-labelledby="home-last" className="kin-card kin-tinted grid content-start gap-5 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="home-last" className="font-display text-xl font-semibold text-ink">{h.last}</h2>
        <span className="text-sm text-ink-muted">{`${t.analysis.movement[analysis.movement_type]} · ${f.shortDate(analysis.recorded_at)}`}</span>
      </div>
      {knee !== null && (
        <ViewTransition name="kin-last-analysis" share="kin-morph" default="none">
          <Dial value={knee} peak={measured.length ? Math.max(...measured) : undefined} target={target} labels label={`${t.analysis.kneeMedian}: ${f.degrees(knee)}`} className="mx-auto w-full max-w-[17rem]">
            <CountUp value={knee} text={f.degrees(knee)} className="font-display text-3xl font-bold text-knee" />
          </Dial>
        </ViewTransition>
      )}
      <dl className="grid grid-cols-2 gap-3">
        <div className="kin-well grid gap-1 p-3">
          <dt className="text-xs text-ink-muted">{t.analysis.kneeMedian}</dt>
          <dd>{zone ? <ZoneChip zone={zone} label={t.analysis.kneeZones[analysis.movement_type][zone]} /> : <span className="text-sm text-ink-muted">{t.analysis.noKnee}</span>}</dd>
        </div>
        <div className="kin-well grid gap-1 p-3">
          <dt className="text-xs text-ink-muted">{t.analysis.repetitions}</dt>
          <dd className="font-display text-2xl font-semibold text-ink"><CountUp value={peaks.length} text={String(peaks.length)} /></dd>
        </div>
      </dl>
      {level && analysis.risk_score !== null && (
        <RiskScale level={level} label={t.analysis.risk[level]} steps={format(t.analysis.riskSteps, { step: RISK_STEP[level] })} value={f.percent(analysis.risk_score)} />
      )}
      <ButtonLink href={analysisPath(analysis.id)} variant="secondary" glyph="chevronRight" block>{h.openAnalysis}</ButtonLink>
    </section>
  );
}
