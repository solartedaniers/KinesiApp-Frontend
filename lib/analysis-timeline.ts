// Línea de tiempo del video del análisis: qué ángulo había en cada instante y dónde está el pico de
// cada articulación. Lógica pura (testeada en analysis-timeline.test.ts).
import type { JointAngleMeasurement } from "./types";

export type PeakMoment = { joint: string; ms: number; degrees: number };

/** Instante del ángulo máximo de cada serie (ya ordenada por tiempo); ante empate, el primero. */
export function peakMoments(series: { joint: string; points: JointAngleMeasurement[] }[]): PeakMoment[] {
  return series.flatMap(({ joint, points }) => {
    if (points.length === 0) return [];
    const peak = points.reduce((best, point) => (point.angle_degrees > best.angle_degrees ? point : best));
    return [{ joint, ms: peak.frame_timestamp_ms, degrees: peak.angle_degrees }];
  });
}

/** Medición más cercana a `ms` en una serie ordenada por tiempo (búsqueda binaria), o null si está vacía. */
export function angleAt(points: JointAngleMeasurement[], ms: number): JointAngleMeasurement | null {
  if (points.length === 0) return null;
  let low = 0;
  let high = points.length - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (points[middle].frame_timestamp_ms < ms) low = middle + 1;
    else high = middle;
  }
  const previous = points[low - 1];
  return previous && ms - previous.frame_timestamp_ms <= points[low].frame_timestamp_ms - ms ? previous : points[low];
}

/** Posición horizontal (0-100 %) de un instante en una línea de tiempo de `durationMs`. */
export function timelinePercent(ms: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  return Math.min(100, Math.max(0, (ms / durationMs) * 100));
}
