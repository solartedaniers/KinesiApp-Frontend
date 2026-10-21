import { ViewTransition } from "react";

import { CountUp } from "@/components/instrument/CountUp";
import { Dial } from "@/components/instrument/Dial";
import { RiskScale } from "@/components/instrument/Status";
import { countInTarget, repetitionKneePeaks } from "@/lib/analysis-reading";
import { riskLevel } from "@/lib/analysis-stats";
import { getRiskCuts } from "@/lib/data/public";
import { cssVars } from "@/lib/design/css";
import { RISK_FILL, RISK_STEP, RISK_TEXT } from "@/lib/design/risk";
import { SIGNAL_CLASS, ZONE_CLASS, zoneOf } from "@/lib/design/signals";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { valgusSummary } from "@/lib/risk-focus";
import type { JumpAnalysis } from "@/lib/types";

// La inclinación del tronco rara vez pasa de 60°; con 90 la aguja usa bien la esfera
const TRUNK_DIAL_MAX = 90;
// El valgo que preocupa está entre 10° y 25°: con 40 la aguja se lee; lo que se abre hacia afuera queda en 0
const VALGUS_DIAL_MAX = 40;
const VALGUS_LABEL_STEP = 20;

/**
 * Las tres tarjetas del resultado como en la guía: rodilla, tronco y repeticiones con el riesgo. Vista de
 * frente, las dos primeras son el valgo de cada rodilla.
 */
export async function ResultGauges({ analysis }: { analysis: JumpAnalysis }) {
  const [t, f, cuts] = await Promise.all([getT(), getFormat(), getRiskCuts()]);
  const d = t.analysisDetail;
  const knee = analysis.knee_median_peak_degrees;
  const front = analysis.risk_assessment?.camera_view === "front";
  const target = front ? null : analysis.knee_target;
  const trunk = analysis.angle_measurements.filter((m) => m.joint_name === "trunk_inclination").map((m) => m.angle_degrees);
  const trunkPeak = trunk.length ? Math.max(...trunk) : null;
  const peaks = analysis.risk_assessment ? repetitionKneePeaks(analysis.risk_assessment) : [];
  const measured = peaks.filter((peak) => peak !== null);
  const inTarget = target ? countInTarget(peaks, target) : null;
  const level = analysis.risk_level;
  // Sin rango, cada repetición se pinta con su riesgo: el patrón que más puntuó en ella
  const repColor = (i: number) => {
    const peak = peaks[i];
    if (target && peak !== null) return ZONE_CLASS[zoneOf(peak, target)];
    const worst = Math.max(0, ...(analysis.risk_assessment?.repetitions[i].pattern_scores.map((s) => s.score ?? 0) ?? []));
    const level = riskLevel(worst, cuts);
    return { bg: RISK_FILL[level], text: RISK_TEXT[level] };
  };

  const valgus = front ? valgusSummary(analysis.angle_measurements, analysis.risk_assessment?.repetitions ?? []) : null;
  const valgusCard = (side: "left" | "right", signal: "knee" | "center", delayMs: number) => {
    const value = valgus?.[side] ?? null;
    const title = t.analysis.valgus[side];
    return (
      <article className="kin-card kin-tinted grid content-start gap-3 p-5" style={cssVars({ "--tint": `var(--kin-${signal})` })} aria-labelledby={`result-valgus-${side}`}>
        <h2 id={`result-valgus-${side}`} className="text-sm font-semibold text-ink-muted">{title}</h2>
        {value === null ? (
          <p className="text-sm text-ink-muted">{t.analysis.noKnee}</p>
        ) : (
          <Dial value={Math.max(0, value)} signal={signal} max={VALGUS_DIAL_MAX} labelStep={VALGUS_LABEL_STEP} labels delayMs={delayMs} label={`${title}: ${f.degrees(value)}`} className="mx-auto w-full max-w-[15rem]">
            <CountUp value={value} text={f.degrees(value)} delayMs={delayMs} className={`font-display text-3xl font-bold ${SIGNAL_CLASS[signal].text}`} />
          </Dial>
        )}
        {side === "right" && valgus?.asymmetry != null && (
          <p className="text-sm text-ink">{t.analysis.valgusAsymmetry}: <span className="font-semibold [font-variant-numeric:tabular-nums]">{f.degrees(valgus.asymmetry)}</span></p>
        )}
      </article>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {front ? (
        <>
          {valgusCard("left", "knee", 0)}
          {valgusCard("right", "center", 150)}
        </>
      ) : (
      <>
      <article className="kin-card kin-tinted grid content-start gap-3 p-5" aria-labelledby="result-knee">
        <h2 id="result-knee" className="text-sm font-semibold text-ink-muted">{t.analysis.kneeMedian}</h2>
        {knee !== null ? (
          <ViewTransition name="kin-last-analysis" share="kin-morph" default="none">
            <Dial value={knee} peak={measured.length ? Math.max(...measured) : undefined} target={target} labels label={`${t.analysis.kneeMedian}: ${f.degrees(knee)}`} className="mx-auto w-full max-w-[15rem]">
              <CountUp value={knee} text={f.degrees(knee)} className="font-display text-3xl font-bold text-knee" />
            </Dial>
          </ViewTransition>
        ) : (
          <p className="text-sm text-ink-muted">{t.analysis.noKnee}</p>
        )}
      </article>
      <article className="kin-card kin-tinted grid content-start gap-3 p-5" style={cssVars({ "--tint": "var(--kin-trunk)" })} aria-labelledby="result-trunk">
        <h2 id="result-trunk" className="text-sm font-semibold text-ink-muted">{d.peakTrunk}</h2>
        {trunkPeak !== null && (
          <Dial value={trunkPeak} peak={trunkPeak} signal="trunk" max={TRUNK_DIAL_MAX} labels delayMs={150} label={`${d.peakTrunk}: ${f.degrees(trunkPeak)}`} className="mx-auto w-full max-w-[15rem]">
            <CountUp value={trunkPeak} text={f.degrees(trunkPeak)} delayMs={150} className="font-display text-3xl font-bold text-trunk" />
          </Dial>
        )}
      </article>
      </>
      )}
      <article className="kin-card kin-tinted grid content-start gap-4 p-5" style={cssVars({ "--tint": "var(--kin-zone-target)" })} aria-labelledby="result-reps">
        <h2 id="result-reps" className="text-sm font-semibold text-ink-muted">{t.analysis.repetitions}</h2>
        <p className="font-display text-score font-bold text-ink"><CountUp value={peaks.length} text={String(peaks.length)} delayMs={300} /></p>
        {peaks.length > 0 && (
          <ol className="flex gap-1.5" aria-label={inTarget === null ? t.analysis.repetitions : format(d.inTarget, { count: inTarget, total: peaks.length })}>
            {peaks.map((_, i) => (
              <li key={i} className={`kin-light h-8 flex-1 rounded-full ${repColor(i).bg} ${repColor(i).text}`} style={cssVars({ "--i": i })} />
            ))}
          </ol>
        )}
        {inTarget !== null && <p className="text-sm text-ink">{format(d.inTarget, { count: inTarget, total: peaks.length })}</p>}
        {level && analysis.risk_score !== null && (
          <div className="grid gap-1.5">
            <span className="text-xs text-ink-muted">{d.risk}</span>
            <RiskScale level={level} label={t.analysis.risk[level]} steps={format(t.analysis.riskSteps, { step: RISK_STEP[level] })} value={f.percent(analysis.risk_score)} />
            <p className="text-sm text-ink-muted">{d.riskExplanation[level]}</p>
          </div>
        )}
      </article>
      {front && <p className="text-sm text-ink-muted md:col-span-3">{t.analysis.valgusNote}</p>}
    </div>
  );
}
