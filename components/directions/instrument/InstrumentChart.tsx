import { chartTicks, PROPOSAL, TARGET_KNEE } from "../sample";

import { CANVAS, ChartFrame, linePath, makePlot, percentX, percentY } from "@/components/lab/charts/ChartFrame";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";

const styles = {
  card: "instrument-layer mt-5 grid gap-6 rounded-[1.25rem] bg-panel p-5 sm:p-6",
  legend: "flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted",
  line: "fill-none [vector-effect:non-scaling-stroke] [stroke-linejoin:round]",
  marker: "absolute h-2 w-px -translate-x-1/2 -translate-y-[calc(100%+3px)] bg-ink",
  value: "absolute -translate-x-1/2 -translate-y-[calc(100%+14px)] text-xs font-semibold text-ink [font-variant-numeric:tabular-nums] max-sm:hidden",
};

/** Gráfica de Instrumento: la rodilla en el color de la medida, el tronco en gris y el rango objetivo como franja. */
export async function InstrumentChart() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const c = t.styleGuide.chart;
  const ticks = chartTicks(f, c.seconds);
  const plot = makePlot([0, PROPOSAL.durationMs], [0, ticks.degrees.at(-1)!.value]);
  const toXY = (s: { ms: number; degrees: number }) => ({ x: s.ms, y: s.degrees });
  return (
    <figure id="instrument-chart" className={styles.card}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink [font-stretch:92%]">{c.title}</h2>
        <ul className={styles.legend}>
          <li className="flex items-center gap-2"><span className="h-0.5 w-5 bg-hue-1" />{t.joints.knee_flexion}</li>
          <li className="flex items-center gap-2"><span className="h-0 w-5 border-t-2 border-dashed border-hue-2" />{t.joints.trunk_inclination}</li>
          <li className="flex items-center gap-2"><span className="h-3 w-5 rounded-sm bg-accent-soft" />{c.target}</li>
        </ul>
      </div>
      <ChartFrame
        plot={plot}
        yTicks={ticks.degrees}
        xTicks={ticks.time}
        height="h-56 sm:h-72"
        label={c.label}
        overlay={PROPOSAL.peaks.map((peak, i) => {
          const at = { left: percentX(plot, peak.ms), top: percentY(plot, peak.degrees) };
          return (
            <span key={peak.ms} title={format(c.repetition, { index: i + 1 })}>
              <span className={styles.marker} style={at} />
              <span className={styles.value} style={at}>{Math.round(peak.degrees)}</span>
            </span>
          );
        })}
      >
        <rect x={0} width={CANVAS} y={plot.y(TARGET_KNEE[1])} height={plot.y(TARGET_KNEE[0]) - plot.y(TARGET_KNEE[1])} className="fill-accent-soft" />
        <path d={linePath(PROPOSAL.trunk.map(toXY), plot)} className={`${styles.line} stroke-hue-2 [stroke-dasharray:5_4] [stroke-width:1.5]`} />
        <path d={linePath(PROPOSAL.knee.map(toXY), plot)} className={`${styles.line} stroke-hue-1 [stroke-width:2]`} />
      </ChartFrame>
    </figure>
  );
}
