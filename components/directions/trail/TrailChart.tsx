import { chartTicks, PROPOSAL } from "../sample";

import { CANVAS, ChartFrame, linePath, makePlot, percentX, percentY } from "@/components/lab/charts/ChartFrame";
import { getFormat, getT } from "@/lib/i18n/server";

const styles = {
  card: "trail-card mt-5 grid gap-6 rounded-[1.5rem] bg-panel p-5 ring-1 ring-line sm:p-7",
  legend: "flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted",
  swatch: "inline-block h-0.5 w-5 rounded-full align-middle",
  line: "fill-none [vector-effect:non-scaling-stroke] [stroke-linejoin:round]",
  peak: "trail-lit absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-hue-1 text-hue-1",
};

/** Ángulos como trazos de luz: el área bajo la rodilla se desvanece y cada pico es un punto encendido. */
export async function TrailChart() {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const c = t.styleGuide.chart;
  const ticks = chartTicks(f, c.seconds);
  const plot = makePlot([0, PROPOSAL.durationMs], [0, ticks.degrees.at(-1)!.value]);
  const toXY = (s: { ms: number; degrees: number }) => ({ x: s.ms, y: s.degrees });
  const knee = linePath(PROPOSAL.knee.map(toXY), plot);
  const trunk = linePath(PROPOSAL.trunk.map(toXY), plot);
  const lines = (
    <>
      <path d={knee} className={`${styles.line} stroke-hue-1 [stroke-width:2]`} />
      <path d={trunk} className={`${styles.line} stroke-hue-2 [stroke-width:1.75]`} />
    </>
  );
  return (
    <figure id="trail-chart" className={styles.card}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink">{c.title}</h2>
        <ul className={styles.legend}>
          <li><span className={`${styles.swatch} bg-hue-1`} /> {t.joints.knee_flexion}</li>
          <li><span className={`${styles.swatch} bg-hue-2`} /> {t.joints.trunk_inclination}</li>
          <li><span className="trail-lit inline-block size-2 rounded-full bg-hue-1 text-hue-1 align-middle" /> {c.peaks}</li>
        </ul>
      </div>
      <ChartFrame
        plot={plot}
        yTicks={ticks.degrees}
        xTicks={ticks.time}
        height="h-56 sm:h-72"
        label={c.label}
        overlay={
          <>
            {/* El halo va en otro SVG con blur de CSS: dentro del lienzo estirado el blur se deformaría */}
            <svg className="trail-halo pointer-events-none absolute inset-0 size-full" viewBox={`0 0 ${CANVAS} ${CANVAS}`} preserveAspectRatio="none" aria-hidden>
              {lines}
            </svg>
            {PROPOSAL.peaks.map((peak, i) => (
              <span key={peak.ms} className={styles.peak} style={{ left: percentX(plot, peak.ms), top: percentY(plot, peak.degrees) }} title={`${i + 1}: ${f.degrees(peak.degrees)}`} />
            ))}
          </>
        }
      >
        <defs>
          <linearGradient id="trail-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--kin-hue-1)", stopOpacity: 0.26 }} />
            <stop offset="1" style={{ stopColor: "var(--kin-hue-1)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path d={`${knee}L${CANVAS} ${CANVAS}L0 ${CANVAS}Z`} fill="url(#trail-area)" />
        {lines}
      </ChartFrame>
    </figure>
  );
}
