import type { ReactNode } from "react";

import { linear, type Linear } from "@/lib/charts/scale";

// Las marcas viven en un lienzo de 1000×1000 que se estira al contenedor (preserveAspectRatio="none")
// con trazos que no se deforman; las etiquetas son HTML ubicado en %. Así la misma gráfica se lee
// a 360 px y a 1200 px sin medir el contenedor con JavaScript.
export const CANVAS = 1000;

export type Tick = { value: number; label: string };
export type Plot = { x: Linear; y: Linear };

export function makePlot(xDomain: [number, number], yDomain: [number, number]): Plot {
  return { x: linear(xDomain, [0, CANVAS]), y: linear(yDomain, [CANVAS, 0]) };
}

/** Polilínea en coordenadas del lienzo; segmentos rectos para no inventar valores entre muestras. */
export function linePath(points: readonly { x: number; y: number }[], plot: Plot): string {
  return points.map((p, i) => `${i ? "L" : "M"}${plot.x(p.x).toFixed(1)} ${plot.y(p.y).toFixed(1)}`).join("");
}

/** Posición en % de un valor del eje, para ubicar HTML sobre el lienzo. */
export const percentX = (plot: Plot, value: number) => `${(plot.x(value) / CANVAS) * 100}%`;
export const percentY = (plot: Plot, value: number) => `${(plot.y(value) / CANVAS) * 100}%`;

const styles = {
  frame: "grid grid-cols-[2.75rem_1fr] grid-rows-[1fr_1.75rem]",
  yAxis: "relative",
  yLabel: "absolute right-2 -translate-y-1/2 text-xs text-ink-muted [font-variant-numeric:tabular-nums]",
  plot: "relative",
  svg: "absolute inset-0 size-full overflow-visible",
  grid: "stroke-line [stroke-width:1] [vector-effect:non-scaling-stroke]",
  baseline: "stroke-line-strong [stroke-width:1.5] [vector-effect:non-scaling-stroke]",
  xAxis: "relative col-start-2",
  xLabel: "absolute top-1.5 -translate-x-1/2 text-xs whitespace-nowrap text-ink-muted [font-variant-numeric:tabular-nums] first:translate-x-0 last:-translate-x-full max-sm:even:not-last:hidden",
};

export function ChartFrame({
  plot, yTicks, xTicks, height, label, children, overlay,
}: {
  plot: Plot;
  yTicks: Tick[];
  xTicks: Tick[];
  /** Alto del área de trazado, como clase de Tailwind (p. ej. "h-56"). */
  height: string;
  label: string;
  children: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <div className={styles.frame}>
      <div className={`${styles.yAxis} ${height}`} aria-hidden>
        {yTicks.map((tick) => (
          <span key={tick.value} className={styles.yLabel} style={{ top: percentY(plot, tick.value) }}>{tick.label}</span>
        ))}
      </div>
      <div className={`${styles.plot} ${height}`}>
        <svg className={styles.svg} viewBox={`0 0 ${CANVAS} ${CANVAS}`} preserveAspectRatio="none" role="img" aria-label={label}>
          {yTicks.map((tick, i) => (
            <line key={tick.value} className={i === 0 ? styles.baseline : styles.grid} x1={0} x2={CANVAS} y1={plot.y(tick.value)} y2={plot.y(tick.value)} />
          ))}
          {children}
        </svg>
        {overlay}
      </div>
      <div className={styles.xAxis} aria-hidden>
        {xTicks.map((tick) => (
          <span key={tick.value} className={styles.xLabel} style={{ left: percentX(plot, tick.value) }}>{tick.label}</span>
        ))}
      </div>
    </div>
  );
}
