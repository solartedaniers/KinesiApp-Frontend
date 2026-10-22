// Lectura de la rodilla por repetición desde el desglose de riesgo: lógica pura (analysis-reading.test.ts).
import { type KneeTarget, zoneOf } from "./design/signals.ts";
import type { RiskAssessment } from "./types.ts";

/** Pico de flexión de rodilla de cada repetición tal como lo midió la IA; null si no pudo medirlo. */
export function repetitionKneePeaks(assessment: RiskAssessment): (number | null)[] {
  const knee = new Set(assessment.patterns.flatMap((pattern) => pattern.signals.filter((s) => s.joint === "knee_flexion").map((s) => s.code)));
  return assessment.repetitions.map(
    (repetition) => repetition.signal_scores.find((score) => knee.has(score.code) && score.measured_degrees !== null)?.measured_degrees ?? null,
  );
}

/** Repeticiones medidas que quedaron dentro del rango sin riesgo. */
export function countInTarget(peaks: (number | null)[], target: KneeTarget): number {
  return peaks.filter((peak) => peak !== null && zoneOf(peak, target) === "target").length;
}
