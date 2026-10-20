import { chartTicks, PROPOSAL } from "../sample";

import { CANVAS, ChartFrame, linePath, makePlot, percentX } from "@/components/lab/charts/ChartFrame";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";

const styles = {
  card: "rhythm-card mt-5 grid gap-6 rounded-[2rem] bg-panel p-5 ring-1 ring-line sm:p-7",
  legend: "flex flex-wrap gap-2 text-sm font-medium text-ink",
  chip: "inline-flex min-h-8 items-center gap-2 rounded-full bg-sunken px-3",
  dot: "size-2.5 rounded-full",
  line: "fill-none [stroke-linecap:round] [stroke-linejoin:round] [vector-effect:non-scaling-stroke]",
  badge: "absolute top-1 grid size-6 -translate-x-1/2 place-items-center rounded-full bg-sunken text-xs font-semibold text-ink-muted [font-variant-numeric:tabular-nums]",
};

/** Gráfica de Ritmo: trazos gruesos y redondos, y cada repetición como un compás numerado. */
export async function RhythmChart() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const c = t.styleGuide.chart;
  const ticks = chartTicks(f, c.seconds);
  const plot = makePlot([0, PROPOSAL.durationMs], [0, ticks.degrees.at(-1)!.value]);
  const toXY = (s: { ms: number; degrees: number }) => ({ x: s.ms, y: s.degrees });
  return (
    <figure id="rhythm-chart" className={styles.card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{c.title}</h2>
        <ul className={styles.legend}>
          <li className={styles.chip}><span className={`${styles.dot} bg-hue-1`} />{t.joints.knee_flexion}</li>
          <li className={styles.chip}><span className={`${styles.dot} bg-hue-2`} />{t.joints.trunk_inclination}</li>
        </ul>
      </div>
      <ChartFrame
        plot={plot}
        yTicks={ticks.degrees}
        xTicks={ticks.time}
        height="h-60 sm:h-72"
        label={c.label}
        overlay={PROPOSAL.repetitions.map((rep, i) => (
          <span key={rep.startMs} className={styles.badge} style={{ left: percentX(plot, (rep.startMs + rep.endMs) / 2) }} title={format(c.repetition, { index: i + 1 })}>
            {i + 1}
          </span>
        ))}
      >
        {PROPOSAL.repetitions.map((rep, i) => i % 2 === 1 && (
          <rect key={rep.startMs} x={plot.x(rep.startMs)} width={plot.x(rep.endMs) - plot.x(rep.startMs)} y={0} height={CANVAS} className="fill-sunken" />
        ))}
        <path d={linePath(PROPOSAL.trunk.map(toXY), plot)} className={`${styles.line} stroke-hue-2 [stroke-width:3]`} />
        <path d={linePath(PROPOSAL.knee.map(toXY), plot)} className={`${styles.line} stroke-hue-1 [stroke-width:3.5]`} />
      </ChartFrame>
    </figure>
  );
}
