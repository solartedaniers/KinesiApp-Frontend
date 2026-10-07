import Link from "next/link";

import { RISK_THRESHOLDS, type RiskPoint } from "@/lib/analysis-stats";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import { analysisPath } from "@/lib/routes";

import { ChartFigure, ChartNote, ChartTable, LineChart } from "./LineChart";

const Y_TICKS = [0, 0.5, 1];

/**
 * Una sola serie en el tiempo → línea sin leyenda (el título la nombra), con la referencia del
 * umbral de riesgo alto. Cada punto enlaza a su grabación; la tabla es la vista accesible.
 */
export async function RiskTrendChart({ points }: { points: RiskPoint[] }) {
  const t = await getT();
  const fmt = await getFormat();
  return (
    <ChartFigure title={t.riskChart.title} subtitle={t.riskChart.subtitle}>
      {points.length < 2 ? (
        <ChartNote>{t.riskChart.notEnough}</ChartNote>
      ) : (
        <LineChart
          points={points.map((point) => ({
            key: point.analysisId,
            x: Date.parse(point.recordedAt),
            y: point.score,
            label: format(t.riskChart.pointLabel, { date: fmt.dateTime(point.recordedAt), value: fmt.percent(point.score) }),
            href: analysisPath(point.analysisId),
          }))}
          yAxis={{ min: 0, max: 1, ticks: Y_TICKS, format: fmt.percent }}
          xLabels={[fmt.shortDate(points[0].recordedAt), fmt.shortDate(points[points.length - 1].recordedAt)]}
          reference={{ value: RISK_THRESHOLDS.high, label: `${t.riskChart.threshold} (${fmt.percent(RISK_THRESHOLDS.high)})` }}
        />
      )}
      {points.length > 0 && (
        <ChartTable
          toggle={t.riskChart.tableToggle}
          headers={[t.riskChart.date, t.riskChart.score]}
          rows={points.map((point) => ({
            key: point.analysisId,
            cells: [<Link key="date" href={analysisPath(point.analysisId)}>{fmt.dateTime(point.recordedAt)}</Link>, fmt.percent(point.score)],
          }))}
        />
      )}
    </ChartFigure>
  );
}
