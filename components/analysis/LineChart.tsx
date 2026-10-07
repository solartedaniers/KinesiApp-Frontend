import Link from "next/link";
import type { ReactNode } from "react";

const styles = {
  figure: "m-0 grid gap-4 rounded-panel border border-line bg-panel p-5",
  caption: "grid gap-1",
  title: "font-semibold text-ink",
  subtitle: "text-sm text-ink-muted",
  plot: "grid grid-cols-[auto_1fr] gap-2",
  yAxis: "relative w-[3.2em] text-xs tabular-nums text-ink-muted",
  yTick: "absolute right-0 -translate-y-1/2",
  area: "relative h-56",
  svg: "absolute inset-0 size-full overflow-visible",
  grid: "stroke-line [stroke-width:1]",
  threshold: "stroke-ink-muted [stroke-dasharray:4_4] [stroke-width:1]",
  line: "fill-none stroke-accent [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2]",
  thresholdLabel: "absolute right-0 -translate-y-[120%] text-xs text-ink-muted",
  point: "group absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full",
  dot: "size-2.5 rounded-full bg-accent ring-2 ring-panel transition-transform duration-fast group-hover:scale-125 group-focus-visible:scale-125",
  tooltip: "pointer-events-none absolute bottom-[calc(100%+0.25rem)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-tag bg-ink px-2 py-1 text-xs font-medium text-canvas opacity-0 transition-opacity duration-fast group-hover:opacity-100 group-focus-visible:opacity-100",
  xAxis: "col-start-2 flex justify-between text-xs tabular-nums text-ink-muted",
  table: "text-sm [&_summary]:cursor-pointer [&_summary]:font-medium [&_summary]:text-accent [&_table]:mt-3 [&_table]:w-full [&_table]:border-collapse [&_table]:tabular-nums [&_td]:border-b [&_td]:border-line [&_td]:py-2 [&_td]:text-left [&_td:last-child]:text-right [&_th]:border-b [&_th]:border-line [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-ink-muted [&_th:last-child]:text-right",
  notEnough: "text-sm text-ink-muted",
};

export type ChartPoint = {
  key: string | number;
  x: number;
  y: number;
  /** Texto del tooltip (y de la tabla accesible que arma quien usa el gráfico). */
  label: string;
  href?: string;
};

type Axis = { min: number; max: number; ticks: number[]; format: (value: number) => string };

// Margen horizontal (en % del ancho) para que el primer y el último punto no queden cortados
const X_PADDING = 3;
// Con más puntos que esto (ángulos frame a frame) la línea sola se lee mejor que cientos de puntos;
// los valores siguen en la tabla de datos
const MAX_MARKED_POINTS = 40;

/**
 * Línea de una sola serie, sin JavaScript. El SVG traza grilla y línea (vector-effect: el trazo no
 * se deforma al escalar); ejes, etiquetas y puntos son HTML para que el texto conserve su tamaño
 * y cada punto tenga su tooltip CSS (:hover / :focus-visible) y, si hay href, su enlace.
 */
export function LineChart({
  points,
  yAxis,
  xLabels,
  reference,
}: {
  points: ChartPoint[];
  yAxis: Axis;
  xLabels: [ReactNode, ReactNode];
  reference?: { value: number; label: string };
}) {
  const xs = points.map((point) => point.x);
  const [first, last] = [Math.min(...xs), Math.max(...xs)];
  const x = (value: number) => X_PADDING + ((value - first) / (last - first || 1)) * (100 - 2 * X_PADDING);
  const y = (value: number) => 100 - ((value - yAxis.min) / (yAxis.max - yAxis.min || 1)) * 100;
  const path = points.map((point) => `${x(point.x)},${y(point.y)}`).join(" ");

  return (
    <div className={styles.plot} aria-hidden>
      <div className={styles.yAxis}>
        {yAxis.ticks.map((tick) => (
          <span key={tick} className={styles.yTick} style={{ top: `${y(tick)}%` }}>
            {yAxis.format(tick)}
          </span>
        ))}
      </div>
      <div className={styles.area}>
        <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none">
          {yAxis.ticks.map((tick) => (
            <line key={tick} className={styles.grid} x1="0" x2="100" y1={y(tick)} y2={y(tick)} vectorEffect="non-scaling-stroke" />
          ))}
          {reference && (
            <line
              className={styles.threshold}
              x1="0"
              x2="100"
              y1={y(reference.value)}
              y2={y(reference.value)}
              vectorEffect="non-scaling-stroke"
            />
          )}
          <polyline className={styles.line} points={path} vectorEffect="non-scaling-stroke" />
        </svg>
        {reference && (
          <span className={styles.thresholdLabel} style={{ top: `${y(reference.value)}%` }}>
            {reference.label}
          </span>
        )}
        {points.length <= MAX_MARKED_POINTS && points.map((point) => {
          const position = { left: `${x(point.x)}%`, top: `${y(point.y)}%` };
          const content = (
            <>
              <span className={styles.dot} />
              <span className={styles.tooltip}>{point.label}</span>
            </>
          );
          // Fuera del orden de tabulación: la tabla de datos es la vista navegable con teclado
          return point.href ? (
            <Link key={point.key} href={point.href} className={styles.point} style={position} tabIndex={-1}>
              {content}
            </Link>
          ) : (
            <span key={point.key} className={styles.point} style={position}>
              {content}
            </span>
          );
        })}
      </div>
      <div className={styles.xAxis}>
        <span>{xLabels[0]}</span>
        <span>{xLabels[1]}</span>
      </div>
    </div>
  );
}

/** Vista accesible de los datos de un gráfico, plegada por defecto. */
export function ChartTable({
  toggle,
  headers,
  rows,
  open = false,
}: {
  toggle: string;
  headers: [string, string];
  rows: { key: string | number; cells: [ReactNode, ReactNode] }[];
  /** Abierta de entrada: el informe imprimible muestra la tabla además del gráfico. */
  open?: boolean;
}) {
  return (
    <details className={styles.table} open={open}>
      <summary>{toggle}</summary>
      <table>
        <thead>
          <tr>
            <th scope="col">{headers[0]}</th>
            <th scope="col">{headers[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.cells[0]}</td>
              <td>{row.cells[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

/** Marco común: título, subtítulo y contenido. */
export function ChartFigure({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </figcaption>
      {children}
    </figure>
  );
}

export function ChartNote({ children }: { children: ReactNode }) {
  return <p className={styles.notEnough}>{children}</p>;
}
