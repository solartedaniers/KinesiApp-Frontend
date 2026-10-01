import Link from "next/link";

import { RISK_THRESHOLDS, type RiskPoint } from "@/lib/analysis-stats";
import { formatDateTime, formatPercent, formatShortDate } from "@/lib/format";
import { format, t } from "@/lib/i18n";
import { analysisPath } from "@/lib/routes";

import styles from "./RiskTrendChart.module.css";

const Y_TICKS = [0, 0.5, 1];
// Margen horizontal (en % del ancho) para que el primer y el último punto no queden cortados
const X_PADDING = 3;

/**
 * Una sola serie en el tiempo → gráfico de línea, sin leyenda (el título la nombra), con línea de
 * referencia del umbral de riesgo alto. Server Component sin JS: el tooltip es CSS (:hover y
 * :focus-visible) y cada punto es un enlace a su grabación. La tabla es la vista accesible.
 */
export function RiskTrendChart({ points }: { points: RiskPoint[] }) {
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        <span className={styles.title}>{t.riskChart.title}</span>
        <span className={styles.subtitle}>{t.riskChart.subtitle}</span>
      </figcaption>
      {points.length < 2 ? <p className={styles.notEnough}>{t.riskChart.notEnough}</p> : <Plot points={points} />}
      {points.length > 0 && <DataTable points={points} />}
    </figure>
  );
}

function Plot({ points }: { points: RiskPoint[] }) {
  const times = points.map((point) => Date.parse(point.recordedAt));
  const [first, last] = [Math.min(...times), Math.max(...times)];
  const x = (time: number) => X_PADDING + ((time - first) / (last - first || 1)) * (100 - 2 * X_PADDING);
  const y = (score: number) => (1 - score) * 100;
  const path = points.map((point, index) => `${x(times[index])},${y(point.score)}`).join(" ");

  return (
    <div className={styles.plot} aria-hidden>
      <div className={styles.yAxis}>
        {Y_TICKS.map((tick) => (
          <span key={tick} className={styles.yTick} style={{ top: `${y(tick)}%` }}>
            {formatPercent(tick)}
          </span>
        ))}
      </div>
      <div className={styles.area}>
        <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none">
          {Y_TICKS.map((tick) => (
            <line key={tick} className={styles.grid} x1="0" x2="100" y1={y(tick)} y2={y(tick)} vectorEffect="non-scaling-stroke" />
          ))}
          <line
            className={styles.threshold}
            x1="0"
            x2="100"
            y1={y(RISK_THRESHOLDS.high)}
            y2={y(RISK_THRESHOLDS.high)}
            vectorEffect="non-scaling-stroke"
          />
          <polyline className={styles.line} points={path} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className={styles.thresholdLabel} style={{ top: `${y(RISK_THRESHOLDS.high)}%` }}>
          {t.riskChart.threshold} · {formatPercent(RISK_THRESHOLDS.high)}
        </span>
        {points.map((point, index) => {
          const label = format(t.riskChart.pointLabel, {
            date: formatDateTime(point.recordedAt),
            value: formatPercent(point.score),
          });
          return (
            <Link
              key={point.analysisId}
              href={analysisPath(point.analysisId)}
              className={styles.point}
              style={{ left: `${x(times[index])}%`, top: `${y(point.score)}%` }}
              tabIndex={-1}
            >
              <span className={styles.dot} />
              <span className={styles.tooltip}>{label}</span>
            </Link>
          );
        })}
      </div>
      <div className={styles.xAxis}>
        <span>{formatShortDate(points[0].recordedAt)}</span>
        <span>{formatShortDate(points[points.length - 1].recordedAt)}</span>
      </div>
    </div>
  );
}

function DataTable({ points }: { points: RiskPoint[] }) {
  return (
    <details className={styles.table}>
      <summary>{t.riskChart.tableToggle}</summary>
      <table>
        <thead>
          <tr>
            <th scope="col">{t.riskChart.date}</th>
            <th scope="col">{t.riskChart.score}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.analysisId}>
              <td>
                <Link href={analysisPath(point.analysisId)}>{formatDateTime(point.recordedAt)}</Link>
              </td>
              <td>{formatPercent(point.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
