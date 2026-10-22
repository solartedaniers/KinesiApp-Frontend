import { CountUp } from "../CountUp";

import { linear } from "@/lib/charts/scale";
import { cssVars } from "@/lib/design/css";
import { type KneeTarget, ZONE_CLASS, zoneOf, zoneSpans } from "@/lib/design/signals";

export type RangeRow = { label: string; min: number; median: number; max: number };

const COLUMNS = "grid grid-cols-[minmax(5.5rem,8rem)_1fr_3.5rem] items-center gap-3 sm:grid-cols-[10rem_1fr_4.5rem]";

/**
 * Rango y mediana de la flexión máxima por deportista sobre la misma escala. El riel lleva las zonas
 * del objetivo, así se ve de un vistazo quién queda corto y quién se pasa.
 */
export function RangeComparison({ rows, domain, ticks, format, medianLabel, target }: { rows: RangeRow[]; domain: [number, number]; ticks: number[]; format: (value: number) => string; medianLabel: string; target: KneeTarget }) {
  const x = linear(domain, [0, 100]);
  const spans = zoneSpans(domain[1], target).filter((s) => s.to > domain[0]).map((s) => ({ ...s, from: Math.max(s.from, domain[0]) }));
  return (
    <div className="kin-instrument grid gap-1">
      <ul className="grid gap-1">
        {rows.map((row, i) => {
          const zone = zoneOf(row.median, target);
          return (
            <li key={row.label} className={`${COLUMNS} kin-rise py-2`} style={cssVars({ "--i": i })}>
              <span className="truncate text-sm font-semibold text-ink">{row.label}</span>
              <span className="kin-screen h-7" aria-hidden>
                {spans.map((s) => (
                  <span key={s.zone} className={`absolute inset-y-2.5 opacity-30 ${ZONE_CLASS[s.zone].bg}`} style={{ left: `${x(s.from)}%`, width: `${x(s.to) - x(s.from)}%` }} />
                ))}
                <span className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-knee opacity-70 shadow-[0_0_10px_var(--kin-knee)]" style={{ left: `${x(row.min)}%`, width: `${x(row.max) - x(row.min)}%` }} />
                <span className={`kin-signal-glow absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_3px_var(--kin-panel)] ${ZONE_CLASS[zone].bg} ${ZONE_CLASS[zone].text}`} style={{ left: `${x(row.median)}%` }} />
              </span>
              <span className="text-right">
                <span className="visually-hidden">{medianLabel}: </span>
                <CountUp value={row.median} text={format(row.median)} delayMs={i * 90} className="font-display text-lg font-semibold text-ink" />
              </span>
            </li>
          );
        })}
      </ul>
      <div className={COLUMNS} aria-hidden>
        <span />
        <span className="relative h-5 text-xs text-ink-muted [font-variant-numeric:tabular-nums]">
          {/* En el celular las seis marcas no caben: dejo una de cada dos */}
          {ticks.map((tick, i) => <span key={tick} className={`absolute -translate-x-1/2 ${i % 2 ? "max-sm:hidden" : ""}`} style={{ left: `${x(tick)}%` }}>{format(tick)}</span>)}
        </span>
      </div>
    </div>
  );
}
