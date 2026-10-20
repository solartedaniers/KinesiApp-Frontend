import { PROPOSAL } from "../sample";

import { LabIcon } from "@/components/lab/LabIcon";
import { RISK_LEVELS, RISK_STEP, RISK_TEXT } from "@/lib/design/risk";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";

const styles = {
  card: "trail-card relative isolate overflow-hidden rounded-[1.5rem] bg-panel p-6 ring-1 ring-line sm:p-7",
  title: "font-sans text-sm font-semibold text-ink-muted [font-stretch:normal]",
  movement: "mt-1 flex flex-wrap items-center gap-x-2 text-ink",
  metric: "block font-display text-[clamp(4rem,14vw,6rem)] leading-none font-semibold tracking-[-0.03em] [font-stretch:125%] [font-variant-numeric:tabular-nums]",
  stats: "mt-7 grid grid-cols-2 gap-5 border-t border-line pt-5",
  label: "text-sm text-ink-muted",
  count: "font-display text-3xl font-semibold [font-variant-numeric:tabular-nums]",
  action: "mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 font-semibold text-on-accent hover:bg-accent-hover hover:no-underline",
};

/** Arco decorativo detrás de la cifra: el mismo trazo de luz de la marca, en grande. */
function Streak() {
  return (
    <svg className="absolute -right-10 bottom-0 -z-10 h-44 w-80" viewBox="0 0 320 176" fill="none" strokeLinecap="round" aria-hidden>
      <defs>
        <linearGradient id="trail-card-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <mask id="trail-card-mask"><rect width="320" height="176" fill="url(#trail-card-fade)" /></mask>
      </defs>
      <g mask="url(#trail-card-mask)" strokeWidth="2">
        <path className="stroke-hue-3" d="M10 170C120 160 210 120 270 40" />
        <path className="stroke-hue-2" d="M10 150C125 140 220 100 290 24" />
        <path className="stroke-hue-1" d="M10 130C130 120 230 80 310 8" />
      </g>
    </svg>
  );
}

/** Nivel de riesgo como tres puntos de luz: los encendidos dicen el nivel sin depender del color. */
function LightSteps({ step, label }: { step: number; label: string }) {
  return (
    <span role="img" aria-label={label} className="inline-flex gap-1">
      {RISK_LEVELS.map((level, i) => (
        <span key={level} className={`size-2 rounded-full ${i < step ? "trail-lit bg-current" : "bg-line"}`} />
      ))}
    </span>
  );
}

export async function TrailResult() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const r = t.styleGuide.result;
  const step = RISK_STEP[PROPOSAL.level];
  return (
    <article className={styles.card} aria-labelledby="trail-result-title">
      <Streak />
      <h2 id="trail-result-title" className={styles.title}>{r.title}</h2>
      <p className={styles.movement}>
        <LabIcon name="squat" size={18} />
        <span className="font-semibold">{t.analysis.movement.squat}</span>
        <span className="text-ink-muted">{r.athlete} · {f.dateTime(PROPOSAL.date)}</span>
      </p>
      <p className="mt-8">
        <span className={styles.metric}>{f.degrees(PROPOSAL.peakKnee)}</span>
        <span className="mt-2 block text-ink-muted">{r.peakKnee}</span>
      </p>
      <dl className={styles.stats}>
        <div>
          <dt className={styles.label}>{r.repetitions}</dt>
          <dd className={styles.count}>{PROPOSAL.repetitions.length}</dd>
        </div>
        <div>
          <dt className={styles.label}>{r.risk}</dt>
          <dd className={`mt-1.5 flex flex-wrap items-center gap-x-2.5 ${RISK_TEXT[PROPOSAL.level]}`}>
            <span className="text-lg font-semibold">{t.analysis.riskShort[PROPOSAL.level]}</span>
            <LightSteps step={step} label={format(r.riskSteps, { step })} />
            <span className="text-sm text-ink-muted [font-variant-numeric:tabular-nums]">{f.percent(PROPOSAL.score)}</span>
          </dd>
        </div>
      </dl>
      <a href="#trail-chart" className={styles.action}>
        {r.open}
        <LabIcon name="chevronRight" size={18} />
      </a>
    </article>
  );
}
