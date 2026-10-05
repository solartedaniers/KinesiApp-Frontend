import { anglesByJoint, type JointSeries } from "@/lib/analysis-stats";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";
import type { JointAngleMeasurement } from "@/lib/types";

import styles from "./AngleCharts.module.css";
import { ChartFigure, ChartNote, ChartTable, LineChart } from "./LineChart";

// Escala en pasos de 30°: el eje termina en el primer múltiplo que contiene el pico
const DEGREE_STEP = 30;

/** Un gráfico pequeño por articulación (small multiples), no varias series de colores en uno. */
export async function AngleCharts({ measurements, tablesOpen = false }: { measurements: JointAngleMeasurement[]; tablesOpen?: boolean }) {
  const t = await getT();
  const series = anglesByJoint(measurements);
  if (series.length === 0) return <ChartNote>{t.analysisDetail.anglesEmpty}</ChartNote>;
  return (
    <div className={styles.grid}>
      {series.map((joint) => (
        <JointChart key={joint.joint} series={joint} tableOpen={tablesOpen} />
      ))}
    </div>
  );
}

async function JointChart({ series, tableOpen }: { series: JointSeries; tableOpen: boolean }) {
  const t = await getT();
  const fmt = await getFormat();
  const max = Math.max(DEGREE_STEP, Math.ceil(series.peak / DEGREE_STEP) * DEGREE_STEP);
  const title = t.joints[series.joint] ?? series.joint;
  const first = series.points[0];
  const last = series.points[series.points.length - 1];

  return (
    <ChartFigure title={title} subtitle={format(t.analysisDetail.peak, { value: fmt.degrees(series.peak) })}>
      {series.points.length < 2 ? (
        <ChartNote>{t.angleChart.notEnough}</ChartNote>
      ) : (
        <LineChart
          points={series.points.map((point) => ({
            key: point.id,
            x: point.frame_timestamp_ms,
            y: point.angle_degrees,
            label: format(t.angleChart.pointLabel, {
              time: fmt.secondsFromMs(point.frame_timestamp_ms),
              value: fmt.degrees(point.angle_degrees),
            }),
          }))}
          yAxis={{ min: 0, max, ticks: [0, max / 2, max], format: fmt.degrees }}
          xLabels={[fmt.secondsFromMs(first.frame_timestamp_ms), fmt.secondsFromMs(last.frame_timestamp_ms)]}
        />
      )}
      <ChartTable
        open={tableOpen}
        toggle={t.angleChart.tableToggle}
        headers={[t.angleChart.time, t.angleChart.angle]}
        rows={series.points.map((point) => ({
          key: point.id,
          cells: [fmt.secondsFromMs(point.frame_timestamp_ms), fmt.degrees(point.angle_degrees)],
        }))}
      />
    </ChartFigure>
  );
}
