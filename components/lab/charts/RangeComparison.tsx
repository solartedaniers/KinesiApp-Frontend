import { linear } from "@/lib/charts/scale";

export type RangeRow = { label: string; min: number; median: number; max: number };

const styles = {
  list: "grid gap-1",
  row: "grid grid-cols-[minmax(6rem,9rem)_1fr_4.5rem] items-center gap-3 py-2 sm:grid-cols-[10rem_1fr_5rem]",
  name: "truncate text-sm font-semibold text-ink",
  track: "relative h-6",
  rail: "absolute inset-x-0 top-1/2 h-px bg-line",
  range: "absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent-soft shadow-[inset_0_0_0_1px_var(--kin-accent)]",
  median: "absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_3px_var(--kin-panel)]",
  value: "text-right font-mono text-sm font-medium text-ink [font-variant-numeric:tabular-nums]",
  axis: "grid grid-cols-[minmax(6rem,9rem)_1fr_4.5rem] gap-3 sm:grid-cols-[10rem_1fr_5rem]",
  axisTrack: "relative h-5 text-xs text-ink-muted [font-variant-numeric:tabular-nums]",
  tick: "absolute -translate-x-1/2",
};

/** Rango y mediana de una medida por persona, en filas sobre una misma escala para comparar. */
export function RangeComparison({ rows, domain, ticks, format }: { rows: RangeRow[]; domain: [number, number]; ticks: number[]; format: (value: number) => string }) {
  const x = linear(domain, [0, 100]);
  return (
    <div>
      <ul className={styles.list}>
        {rows.map((row) => (
          <li key={row.label} className={styles.row}>
            <span className={styles.name}>{row.label}</span>
            <span className={styles.track} aria-hidden>
              <span className={styles.rail} />
              <span className={styles.range} style={{ left: `${x(row.min)}%`, width: `${x(row.max) - x(row.min)}%` }} />
              <span className={styles.median} style={{ left: `${x(row.median)}%` }} />
            </span>
            <span className={styles.value}>{format(row.median)}</span>
          </li>
        ))}
      </ul>
      <div className={styles.axis} aria-hidden>
        <span />
        <span className={styles.axisTrack}>
          {ticks.map((tick) => <span key={tick} className={styles.tick} style={{ left: `${x(tick)}%` }}>{format(tick)}</span>)}
        </span>
      </div>
    </div>
  );
}
