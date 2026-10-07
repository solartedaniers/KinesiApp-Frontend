import Link from "next/link";

import { riskLevel, RISK_THRESHOLDS } from "@/lib/analysis-stats";
import { getFormat, getT } from "@/lib/i18n/server";

import { ChartFigure, ChartNote } from "./LineChart";
import { RISK_FILL } from "./risk-classes";

export type RiskBar = { key: number; label: string; value: number; href: string };

/**
 * Comparar una magnitud entre categorías → barras horizontales de una sola serie, ordenadas de
 * mayor a menor, con el valor escrito en cada fila (no hace falta tooltip ni tabla aparte) y la
 * referencia del umbral de riesgo alto. Cada barra lleva el color de su nivel de riesgo.
 */
export async function RiskBars({ title, subtitle, bars, emptyText }: { title: string; subtitle: string; bars: RiskBar[]; emptyText: string }) {
  const t = await getT();
  const fmt = await getFormat();
  const sorted = [...bars].sort((a, b) => b.value - a.value);
  const threshold = `${RISK_THRESHOLDS.high * 100}%`;
  return (
    <ChartFigure title={title} subtitle={subtitle}>
      {sorted.length === 0 ? (
        <ChartNote>{emptyText}</ChartNote>
      ) : (
        <ul className="grid gap-2.5">
          {sorted.map((bar) => (
            <li key={bar.key} className="grid grid-cols-[minmax(0,9rem)_1fr_3.5rem] items-center gap-3">
              <Link href={bar.href} className="truncate text-sm text-ink">
                {bar.label}
              </Link>
              {/* Pista con la referencia del umbral: una línea vertical punteada */}
              <span className="relative h-3 rounded-[0.1875rem] bg-sunken" aria-hidden>
                <span className={`block h-full rounded-[0.1875rem] ${RISK_FILL[riskLevel(bar.value)]}`} style={{ width: `${bar.value * 100}%` }} />
                <span className="absolute -inset-y-1 border-l border-dashed border-ink-muted" style={{ left: threshold }} />
              </span>
              <span className="text-right text-sm font-semibold tabular-nums">{fmt.percent(bar.value)}</span>
            </li>
          ))}
        </ul>
      )}
      {sorted.length > 0 && (
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <span className="h-3 border-l border-dashed border-ink-muted" aria-hidden />
          {t.riskChart.threshold} ({fmt.percent(RISK_THRESHOLDS.high)})
        </p>
      )}
    </ChartFigure>
  );
}
