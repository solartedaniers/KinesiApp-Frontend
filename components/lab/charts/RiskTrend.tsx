import { ChartFrame, linePath, makePlot, percentX, percentY, type Tick } from "./ChartFrame";
import { riskPatternId } from "../Risk";

import { RISK_LEVELS, type RiskLevel } from "@/lib/design/risk";

export type TrendPoint = { x: number; score: number; level: RiskLevel; label: string };

// Bandas de fondo de cada nivel, con la trama del nivel; los cortes son sólo para dibujar la escala
const BANDS: Record<RiskLevel, [number, number]> = { low: [0, 0.34], moderate: [0.34, 0.67], high: [0.67, 1] };

const styles = {
  band: "opacity-[0.22]",
  line: "lab-glow fill-none stroke-accent [stroke-width:2] [vector-effect:non-scaling-stroke]",
  point: "absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_3px_var(--kin-panel)]",
  last: "absolute -translate-x-full -translate-y-[160%] font-mono text-sm font-medium text-ink [font-variant-numeric:tabular-nums]",
};

/** Puntaje de riesgo por sesión sobre las bandas de los tres niveles; la última cifra va rotulada. */
export function RiskTrend({ points, yTicks, xTicks, label, lastLabel }: { points: TrendPoint[]; yTicks: Tick[]; xTicks: Tick[]; label: string; lastLabel: string }) {
  const plot = makePlot([points[0].x, points.at(-1)!.x], [0, 1]);
  const last = points.at(-1)!;
  return (
    <ChartFrame
      plot={plot}
      yTicks={yTicks}
      xTicks={xTicks}
      height="h-48 sm:h-56"
      label={label}
      overlay={
        <>
          {points.map((point) => (
            <span key={point.x} className={styles.point} style={{ left: percentX(plot, point.x), top: percentY(plot, point.score) }} title={point.label} />
          ))}
          <span className={styles.last} style={{ left: percentX(plot, last.x), top: percentY(plot, last.score) }}>{lastLabel}</span>
        </>
      }
    >
      {RISK_LEVELS.map((level) => (
        <rect key={level} className={styles.band} x={0} width={1000} y={plot.y(BANDS[level][1])} height={plot.y(BANDS[level][0]) - plot.y(BANDS[level][1])} fill={`url(#${riskPatternId(level)})`} />
      ))}
      <path className={styles.line} d={linePath(points.map((p) => ({ x: p.x, y: p.score })), plot)} />
    </ChartFrame>
  );
}
