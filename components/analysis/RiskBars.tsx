import Link from "next/link";
import type { CSSProperties } from "react";

import { RISK_THRESHOLDS } from "@/lib/analysis-stats";
import { getFormat, getT } from "@/lib/i18n/server";

import { ChartFigure, ChartNote } from "./LineChart";
import styles from "./RiskBars.module.css";

export type RiskBar = { key: number; label: string; value: number; href: string };

/**
 * Comparar una magnitud entre categorías → barras horizontales de una sola serie, ordenadas de
 * mayor a menor, con el valor escrito en cada fila (no hace falta tooltip ni tabla aparte) y la
 * referencia del umbral de riesgo alto.
 */
export async function RiskBars({ title, subtitle, bars, emptyText }: { title: string; subtitle: string; bars: RiskBar[]; emptyText: string }) {
  const t = await getT();
  const fmt = await getFormat();
  const sorted = [...bars].sort((a, b) => b.value - a.value);
  return (
    <ChartFigure title={title} subtitle={subtitle}>
      {sorted.length === 0 ? (
        <ChartNote>{emptyText}</ChartNote>
      ) : (
        <ul className={styles.list} style={{ "--threshold": `${RISK_THRESHOLDS.high * 100}%` } as CSSProperties}>
          {sorted.map((bar) => (
            <li key={bar.key} className={styles.row}>
              <Link href={bar.href} className={styles.label}>
                {bar.label}
              </Link>
              <span className={styles.track} aria-hidden>
                <span className={styles.fill} style={{ width: `${bar.value * 100}%` }} />
              </span>
              <span className={styles.value}>{fmt.percent(bar.value)}</span>
            </li>
          ))}
        </ul>
      )}
      {sorted.length > 0 && (
        <p className={styles.legend}>
          <span className={styles.legendMark} aria-hidden /> {t.riskChart.threshold} · {fmt.percent(RISK_THRESHOLDS.high)}
        </p>
      )}
    </ChartFigure>
  );
}
