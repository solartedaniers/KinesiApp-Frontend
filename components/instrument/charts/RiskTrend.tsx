import { useId } from "react";

import { CANVAS, ChartFrame, linePath, makePlot, percentX, percentY, type Tick } from "./ChartFrame";

import { cssVars } from "@/lib/design/css";
import { RISK_FILL, RISK_LEVELS, RISK_TEXT, type RiskLevel } from "@/lib/design/risk";

export type TrendPoint = { x: number; score: number; level: RiskLevel; label: string };

// Cortes de las bandas de cada nivel; son sólo para dibujar la escala, los reales los decide el backend
const BANDS: Record<RiskLevel, [number, number]> = { low: [0, 0.34], moderate: [0.34, 0.67], high: [0.67, 1] };
const BAND_FILL: Record<RiskLevel, string> = { low: "fill-risk-low-soft", moderate: "fill-risk-moderate-soft", high: "fill-risk-high-soft" };

/** Puntaje de riesgo por sesión sobre las bandas de nivel, rotuladas con su palabra; la última cifra va escrita. */
export function RiskTrend({ points, yTicks, xTicks, label, lastLabel, bandLabels, height = "h-52 sm:h-60" }: { points: TrendPoint[]; yTicks: Tick[]; xTicks: Tick[]; label: string; lastLabel: string; bandLabels: Record<RiskLevel, string>; height?: string }) {
  const area = useId();
  const plot = makePlot([points[0].x, points.at(-1)!.x], [0, 1]);
  const last = points.at(-1)!;
  const path = linePath(points.map((p) => ({ x: p.x, y: p.score })), plot);
  return (
    <ChartFrame
      plot={plot}
      yTicks={yTicks}
      xTicks={xTicks}
      height={height}
      label={label}
      overlay={
        <>
          {RISK_LEVELS.map((level) => (
            <span key={level} className={`absolute left-2 -translate-y-1/2 text-xs font-semibold ${RISK_TEXT[level]}`} style={{ top: percentY(plot, (BANDS[level][0] + BANDS[level][1]) / 2) }} aria-hidden>
              {bandLabels[level]}
            </span>
          ))}
          {points.map((point, i) => (
            <span
              key={point.x}
              className={`kin-light absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_3px_var(--kin-panel)] ${RISK_FILL[point.level]} ${RISK_TEXT[point.level]}`}
              style={{ ...cssVars({ "--i": i }), left: percentX(plot, point.x), top: percentY(plot, point.score) }}
              title={point.label}
            />
          ))}
          <span className="absolute -translate-x-full -translate-y-[170%] rounded-control bg-panel px-1.5 whitespace-nowrap font-display text-sm font-semibold text-ink [font-variant-numeric:tabular-nums]" style={{ left: percentX(plot, last.x), top: percentY(plot, last.score) }}>
            {lastLabel}
          </span>
        </>
      }
    >
      <defs>
        <linearGradient id={area} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--kin-accent)", stopOpacity: 0.28 }} />
          <stop offset="1" style={{ stopColor: "var(--kin-accent)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      {RISK_LEVELS.map((level) => (
        <rect key={level} className={`${BAND_FILL[level]} opacity-80`} x={0} width={CANVAS} y={plot.y(BANDS[level][1])} height={plot.y(BANDS[level][0]) - plot.y(BANDS[level][1])} />
      ))}
      <g className="kin-draw">
        <path d={`${path}L${CANVAS} ${CANVAS}L0 ${CANVAS}Z`} fill={`url(#${area})`} />
        <path className="kin-signal-glow fill-none stroke-accent text-accent [stroke-width:2.5] [vector-effect:non-scaling-stroke]" d={path} />
      </g>
    </ChartFrame>
  );
}
