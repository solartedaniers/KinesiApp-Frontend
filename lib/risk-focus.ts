// Qué articulación, de qué lado y en qué instante está el riesgo de cada repetición: lógica pura
// (risk-focus.test.ts). Sale del desglose de la IA, sin umbrales propios.
import type { BodyLandmark, Joint, JointAngleMeasurement, PoseKeyframe, Repetition, RiskAssessment, Side } from "./types.ts";

export type RiskFocus = {
  joint: Joint;
  side: Side | null;
  /** Instante del pico de la señal; sin él, el inicio de la repetición. */
  ms: number;
  degrees: number | null;
  /** Puntaje de la señal en la repetición, de 0 a 1. */
  score: number;
  keyframe: PoseKeyframe | null;
};

/**
 * El foco de una repetición: dentro del patrón que más puntuó en ella, la señal con más puntaje. null si
 * ningún patrón se disparó (puntaje 0) o si el patrón no trae señales medidas.
 */
export function repetitionFocus(assessment: RiskAssessment, repetition: Repetition): RiskFocus | null {
  let worst: { code: string; score: number } | null = null;
  for (const pattern of repetition.pattern_scores) {
    if ((pattern.score ?? 0) > (worst?.score ?? 0)) worst = { code: pattern.code, score: pattern.score ?? 0 };
  }
  const definition = worst && assessment.patterns.find((pattern) => pattern.code === worst.code);
  if (!definition) return null;
  let focus: RiskFocus | null = null;
  for (const signal of definition.signals) {
    const measured = repetition.signal_scores.find((score) => score.code === signal.code);
    if (!signal.joint || !measured || measured.score === null || (focus && measured.score <= focus.score)) continue;
    focus = {
      joint: signal.joint,
      side: measured.side ?? signal.side,
      ms: measured.peak_ms ?? repetition.start_ms,
      degrees: measured.measured_degrees,
      score: measured.score,
      keyframe: repetition.keyframes.find((frame) => frame.ms === measured.peak_ms) ?? null,
    };
  }
  return focus;
}

/**
 * La repetición cuyo foco (con pose) está más cerca del instante `ms`, si está a menos de `windowMs`: es la
 * que se dibuja sobre el video.
 */
export function focusNear<T extends { focus?: RiskFocus | null }>(items: readonly T[], ms: number, windowMs: number): T | null {
  let nearest: T | null = null;
  const distance = (item: T) => Math.abs(item.focus!.ms - ms);
  for (const item of items) {
    if (item.focus?.keyframe && distance(item) <= windowMs && (!nearest || distance(item) < distance(nearest))) nearest = item;
  }
  return nearest;
}

/** Pico de valgo de cada pierna por repetición, medido en las muestras; null si esa pierna no se midió ahí. */
export function legValgusPeaks(measurements: readonly JointAngleMeasurement[], repetitions: readonly Repetition[]): Record<Side, (number | null)[]> {
  const peaks = { left: repetitions.map(() => null as number | null), right: repetitions.map(() => null as number | null) };
  for (const sample of measurements) {
    if (sample.joint_name !== "knee_valgus" || !sample.side) continue;
    repetitions.forEach((rep, i) => {
      const inside = sample.frame_timestamp_ms >= rep.start_ms && sample.frame_timestamp_ms <= rep.end_ms;
      if (inside && sample.angle_degrees > (peaks[sample.side!][i] ?? -Infinity)) peaks[sample.side!][i] = sample.angle_degrees;
    });
  }
  return peaks;
}

/** Mediana del pico de valgo de cada pierna y de la diferencia entre ambas, repetición a repetición. */
export function valgusSummary(measurements: readonly JointAngleMeasurement[], repetitions: readonly Repetition[]): { left: number | null; right: number | null; asymmetry: number | null } {
  const peaks = legValgusPeaks(measurements, repetitions);
  const gaps = peaks.left.map((left, i) => {
    const right = peaks.right[i];
    return left === null || right === null ? null : Math.abs(left - right);
  });
  return { left: median(peaks.left), right: median(peaks.right), asymmetry: median(gaps) };
}

export function median(values: readonly (number | null)[]): number | null {
  const known = values.filter((value) => value !== null).sort((a, b) => a - b);
  if (known.length === 0) return null;
  const middle = known.length >> 1;
  return known.length % 2 ? known[middle] : (known[middle - 1] + known[middle]) / 2;
}

/** Huesos del esqueleto que se dibuja sobre el video, entre puntos del cuerpo. */
export const BONES: readonly (readonly [BodyLandmark, BodyLandmark])[] = [
  ["left_shoulder", "right_shoulder"],
  ["left_hip", "right_hip"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["left_ankle", "left_heel"],
  ["left_heel", "left_foot_index"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
  ["right_ankle", "right_heel"],
  ["right_heel", "right_foot_index"],
];

type FocusText = { riskJoint: Record<Joint, string>; riskJointBoth: Record<Joint, string>; sides: Record<Side, string> };

/** "Rodilla izquierda hacia adentro", "Inclinación del tronco"... con la primera letra en mayúscula. */
export function focusJointText({ joint, side }: Pick<RiskFocus, "joint" | "side">, text: FocusText): string {
  const phrase = side ? text.riskJoint[joint].replace("{side}", text.sides[side]) : text.riskJointBoth[joint];
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

/** Huesos y punto del foco: la pierna en la rodilla y el tronco entre los hombros y la cadera. */
export function focusBones(focus: RiskFocus): { bones: (readonly [BodyLandmark, BodyLandmark])[]; joint: BodyLandmark[] } {
  if (focus.joint === "trunk_inclination") {
    return { bones: [["left_shoulder", "left_hip"], ["right_shoulder", "right_hip"]], joint: ["left_hip", "right_hip"] };
  }
  const sides: Side[] = focus.side ? [focus.side] : ["left", "right"];
  return {
    bones: sides.flatMap((side) => [[`${side}_hip`, `${side}_knee`], [`${side}_knee`, `${side}_ankle`]] as const),
    joint: sides.map((side) => `${side}_knee` as const),
  };
}
