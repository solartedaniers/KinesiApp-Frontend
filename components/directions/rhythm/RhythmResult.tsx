import { LANE_CURVES, lanePath } from "./lanes";
import { PROPOSAL } from "../sample";

import { LabIcon } from "@/components/lab/LabIcon";
import { RISK_LEVELS, RISK_SOFT, RISK_STEP, RISK_TEXT } from "@/lib/design/risk";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";

const styles = {
  card: "rhythm-card overflow-hidden rounded-[2rem] bg-panel ring-1 ring-line",
  body: "grid gap-6 p-6 sm:p-7",
  title: "font-sans text-sm font-semibold text-ink-muted",
  metric: "block font-display text-[clamp(3.5rem,12vw,5rem)] leading-none font-semibold tracking-[-0.04em] [font-variant-numeric:tabular-nums]",
  label: "text-sm text-ink-muted",
  action: "inline-flex min-h-11 items-center gap-2 justify-self-start rounded-full bg-accent px-5 font-semibold text-on-accent hover:bg-accent-hover hover:no-underline",
};

// Alto de cada cápsula proporcional a su profundidad: la serie se lee como un ecualizador
const deepest = Math.max(...PROPOSAL.repetitions.map((rep) => rep.peakKnee));

/** Franja superior: las tres curvas de una repetición, quietas, como firma de la ficha. */
function Ribbon() {
  const lanes = [
    { curve: LANE_CURVES.knee, tone: "stroke-hue-1", baseline: 46, amplitude: 30 },
    { curve: LANE_CURVES.trunk, tone: "stroke-hue-2", baseline: 60, amplitude: 22 },
    { curve: LANE_CURVES.center, tone: "stroke-hue-3", baseline: 72, amplitude: 16 },
  ];
  return (
    <svg viewBox="0 0 360 84" preserveAspectRatio="none" className="block h-20 w-full bg-sunken" aria-hidden>
      {lanes.map(({ curve, tone, baseline, amplitude }) => (
        <path key={tone} d={lanePath(curve, { period: 120, amplitude, baseline, copies: 3 })} className={`${tone} fill-none`} strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

export async function RhythmResult() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const r = t.styleGuide.result;
  const step = RISK_STEP[PROPOSAL.level];
  return (
    <article className={styles.card} aria-labelledby="rhythm-result-title">
      <Ribbon />
      <div className={styles.body}>
        <div>
          <h2 id="rhythm-result-title" className={styles.title}>{r.title}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-ink">
            <LabIcon name="squat" size={18} />
            <span className="font-semibold">{t.analysis.movement.squat}</span>
            <span className="text-ink-muted">{r.athlete} · {f.dateTime(PROPOSAL.date)}</span>
          </p>
        </div>
        <p>
          <span className={styles.metric}>{f.degrees(PROPOSAL.peakKnee)}</span>
          <span className="mt-2 block text-ink-muted">{r.peakKnee}</span>
        </p>
        <dl className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <dt className={styles.label}>{r.repetitions}</dt>
            <dd className="flex items-end gap-3">
              <span className="font-display text-3xl leading-none font-semibold">{PROPOSAL.repetitions.length}</span>
              <span role="img" aria-label={r.depths} className="flex h-10 items-end gap-1">
                {PROPOSAL.repetitions.map((rep) => (
                  <span key={rep.startMs} className="w-1.5 rounded-full bg-hue-1" style={{ height: `${(rep.peakKnee / deepest) * 100}%` }} />
                ))}
              </span>
            </dd>
          </div>
          <div className="grid gap-2">
            <dt className={styles.label}>{r.risk}</dt>
            <dd className={`flex min-h-10 flex-wrap items-center gap-2 justify-self-start rounded-full px-3 ${RISK_SOFT[PROPOSAL.level]} ${RISK_TEXT[PROPOSAL.level]}`}>
              <span role="img" aria-label={format(r.riskSteps, { step })} className="flex h-4 items-end gap-0.5">
                {RISK_LEVELS.map((level, i) => (
                  <span key={level} className={`w-1 rounded-full ${i < step ? "bg-current" : "bg-current opacity-25"}`} style={{ height: `${(i + 1) * 33}%` }} />
                ))}
              </span>
              <span className="font-semibold">{t.analysis.riskShort[PROPOSAL.level]}</span>
              <span className="text-sm [font-variant-numeric:tabular-nums]">{f.percent(PROPOSAL.score)}</span>
            </dd>
          </div>
        </dl>
        <a href="#rhythm-chart" className={styles.action}>
          {r.open}
          <LabIcon name="chevronRight" size={18} />
        </a>
      </div>
    </article>
  );
}
