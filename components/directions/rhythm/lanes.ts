// Las bandas de Ritmo no son ondas inventadas: son la curva de una repetición real repetida en bucle.
import { PROPOSAL } from "../sample";

import { lttb } from "@/lib/charts/lttb";
import { centerOfMass, type Point, smoothPath, squatPoseAt } from "@/lib/design/pose";
import { SAMPLE_ANALYSIS } from "@/lib/design/sample-analysis";

// Con 12 puntos por repetición la curva conserva su forma sin el ruido de cada frame
const POINTS = 12;
const repMs = PROPOSAL.repetitions[0].endMs;

type Curve = { at: number; value: number }[];

function normalize(samples: { ms: number; value: number }[]): Curve {
  const reduced = lttb(samples.map((s) => ({ ...s, x: s.ms, y: s.value })), POINTS);
  const [min, max] = [Math.min(...reduced.map((s) => s.value)), Math.max(...reduced.map((s) => s.value))];
  return reduced.map((s) => ({ at: s.ms / repMs, value: (s.value - min) / (max - min) }));
}

const knee = PROPOSAL.firstRepetition;
const standing = centerOfMass(squatPoseAt(0)).y;

export const LANE_CURVES = {
  knee: normalize(knee.map((s) => ({ ms: s.ms, value: s.degrees }))),
  trunk: normalize(SAMPLE_ANALYSIS.trunk.filter((s) => s.ms < repMs).map((s) => ({ ms: s.ms, value: s.degrees }))),
  // El centro de gravedad baja cuando la rodilla se flexiona: su banda va en sentido contrario
  center: normalize(knee.map((s) => ({ ms: s.ms, value: standing - centerOfMass(squatPoseAt(s.degrees)).y }))),
};

export type LaneKey = keyof typeof LANE_CURVES;

/** Banda de `copies` repeticiones seguidas, de `period` de ancho cada una, oscilando sobre `baseline`. */
export function lanePath(curve: Curve, { period, amplitude, baseline, copies }: { period: number; amplitude: number; baseline: number; copies: number }): string {
  const points: Point[] = Array.from({ length: copies }, (_, copy) =>
    curve.slice(copy ? 1 : 0).map((s) => ({ x: (copy + s.at) * period, y: baseline - s.value * amplitude })),
  ).flat();
  return smoothPath(points);
}
