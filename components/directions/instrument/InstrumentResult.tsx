import { Dial } from "./Dial";
import { PROPOSAL, TARGET_KNEE } from "../sample";

import { LabIcon } from "@/components/lab/LabIcon";
import { RISK_FILL, RISK_LEVELS, RISK_STEP, RISK_TEXT } from "@/lib/design/risk";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";

const styles = {
  card: "instrument-layer grid content-start gap-5 rounded-[1.25rem] bg-panel p-5 sm:p-6",
  title: "font-sans text-sm font-semibold text-ink-muted [font-stretch:normal]",
  metric: "block font-display text-[clamp(3.25rem,10vw,4.5rem)] leading-none font-semibold tracking-[-0.02em] [font-stretch:92%] [font-variant-numeric:tabular-nums]",
  readouts: "instrument-inset grid grid-cols-3 divide-x divide-line rounded-[1rem] bg-sunken",
  cell: "grid content-start gap-1 px-3 py-3 sm:px-4",
  label: "text-xs text-ink-muted",
  value: "font-display text-2xl leading-tight font-semibold [font-stretch:92%] [font-variant-numeric:tabular-nums]",
  action: "inline-flex min-h-11 items-center gap-2 justify-self-start rounded-[0.75rem] bg-accent px-4 font-semibold text-on-accent hover:bg-accent-hover hover:no-underline",
};

export async function InstrumentResult() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const r = t.styleGuide.result;
  const step = RISK_STEP[PROPOSAL.level];
  return (
    <article className={styles.card} aria-labelledby="instrument-result-title">
      <div>
        <h2 id="instrument-result-title" className={styles.title}>{r.title}</h2>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-ink">
          <LabIcon name="squat" size={18} />
          <span className="font-semibold">{t.analysis.movement.squat}</span>
          <span className="text-ink-muted">{r.athlete} · {f.dateTime(PROPOSAL.date)}</span>
        </p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-end gap-4">
        <Dial value={PROPOSAL.peakKnee} target={TARGET_KNEE} className="w-full" />
        <p>
          <span className={styles.metric}>{f.degrees(PROPOSAL.peakKnee)}</span>
          <span className="mt-1 block text-sm text-ink-muted">{r.peakKnee}</span>
        </p>
      </div>
      <dl className={styles.readouts}>
        <div className={styles.cell}>
          <dt className={styles.label}>{r.repetitions}</dt>
          <dd className={styles.value}>{PROPOSAL.repetitions.length}</dd>
        </div>
        <div className={styles.cell}>
          <dt className={styles.label}>{r.risk}</dt>
          <dd className={`grid gap-1.5 ${RISK_TEXT[PROPOSAL.level]}`}>
            <span className="font-semibold">{t.analysis.riskShort[PROPOSAL.level]}</span>
            <span role="img" aria-label={format(r.riskSteps, { step })} className="flex gap-0.5">
              {RISK_LEVELS.map((level, i) => (
                <span key={level} className={`h-1 flex-1 rounded-full ${i < step ? RISK_FILL[PROPOSAL.level] : "bg-line"}`} />
              ))}
            </span>
          </dd>
        </div>
        <div className={styles.cell}>
          <dt className={styles.label}>{r.score}</dt>
          <dd className={styles.value}>{f.percent(PROPOSAL.score)}</dd>
        </div>
      </dl>
      <a href="#instrument-chart" className={styles.action}>
        {r.open}
        <LabIcon name="chevronRight" size={18} />
      </a>
    </article>
  );
}
