// Línea de tiempo del resultado a partir de las muestras de ángulos y del desglose de riesgo.
// Lógica pura (testeada en analysis-timeline.test.ts): el cede-turno se inyecta.
import { lttb } from "./charts/lttb.ts";
import { riskLevel } from "./analysis-stats.ts";
import { repetitionKneePeaks } from "./analysis-reading.ts";
import type { RiskLevel } from "./design/risk.ts";
import { type RiskFocus, repetitionFocus } from "./risk-focus.ts";
import type { CameraView, JointAngleMeasurement, RiskAssessment, RiskCuts } from "./types.ts";

export type AngleSample = { ms: number; degrees: number };
/** `focus` existe cuando la repetición tiene riesgo moderado o alto: qué articulación, de qué lado y cuándo. */
export type TimelineRepetition = { startMs: number; endMs: number; level: RiskLevel; peak: AngleSample; focus?: RiskFocus | null };
/**
 * De lado, `primary` es la flexión de rodilla y `secondary` la inclinación del tronco; de frente, el valgo de
 * la rodilla izquierda y el de la derecha.
 */
export type Timeline = { view: CameraView; primary: AngleSample[]; secondary: AngleSample[]; repetitions: TimelineRepetition[]; durationMs: number };

/** A qué serie va una muestra según la vista; null si esa vista no la dibuja. */
function channelOf(view: CameraView, m: JointAngleMeasurement): "primary" | "secondary" | null {
  if (view === "front") return m.joint_name === "knee_valgus" ? (m.side === "right" ? "secondary" : "primary") : null;
  return m.joint_name === "knee_flexion" ? "primary" : m.joint_name === "trunk_inclination" ? "secondary" : null;
}

// Una gráfica de 1200 px no muestra más de esto; la lectura del instante usa todas las muestras
export const DRAWN_POINTS = 240;
// Muestras por tarea: con ~1300 por articulación en 40 s, el hilo se libera varias veces por pasada
export const CHUNK_SIZE = 400;

/**
 * Cede el hilo principal entre tareas: scheduler.yield() donde existe, scheduler.postTask() como
 * segunda opción y un mensaje de MessageChannel en el resto, que agenda una task nueva sin el retraso
 * mínimo de setTimeout.
 */
export function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void>; postTask?: (task: () => void, options: { priority: string }) => Promise<void> } }).scheduler;
  if (scheduler?.yield) return scheduler.yield();
  if (scheduler?.postTask) return scheduler.postTask(() => undefined, { priority: "user-visible" });
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });
}

/** Recorre `items` por partes y cede el hilo entre cada una. */
export async function forEachInTasks<T>(items: readonly T[], visit: (item: T) => void, pause: () => Promise<void> = yieldToMain): Promise<void> {
  for (let start = 0; start < items.length; start += CHUNK_SIZE) {
    for (let i = start; i < Math.min(start + CHUNK_SIZE, items.length); i++) visit(items[i]);
    if (start + CHUNK_SIZE < items.length) await pause();
  }
}

const decimate = (samples: AngleSample[]) => lttb(samples.map((s) => ({ ...s, x: s.ms, y: s.degrees })), DRAWN_POINTS).map(({ ms, degrees }) => ({ ms, degrees }));

/** Valor de una serie en un instante: la muestra más cercana anterior (búsqueda binaria). */
export function valueAt(samples: readonly AngleSample[], ms: number): number | null {
  if (samples.length === 0 || ms < samples[0].ms) return null;
  let low = 0;
  let high = samples.length - 1;
  while (low < high) {
    const middle = (low + high + 1) >> 1;
    if (samples[middle].ms <= ms) low = middle;
    else high = middle - 1;
  }
  return samples[low].degrees;
}

/**
 * Arma la línea de tiempo en tasks: separa y ordena las muestras según la vista, reduce lo que se
 * dibuja y ubica el pico de cada repetición (de lado, el de la rodilla; de frente, el del valgo mayor).
 * El nivel de cada repetición sale del patrón que más puntuó en ella. Devuelve también las series
 * completas para leer el instante exacto.
 */
export async function buildTimeline(
  measurements: readonly JointAngleMeasurement[],
  assessment: RiskAssessment | null,
  cuts: RiskCuts,
  pause: () => Promise<void> = yieldToMain,
): Promise<Timeline & { fullPrimary: AngleSample[]; fullSecondary: AngleSample[] }> {
  const view = assessment?.camera_view ?? "side";
  const full = { primary: [] as AngleSample[], secondary: [] as AngleSample[] };
  await forEachInTasks(measurements, (m) => {
    const channel = channelOf(view, m);
    if (channel) full[channel].push({ ms: m.frame_timestamp_ms, degrees: m.angle_degrees });
  }, pause);
  full.primary.sort((a, b) => a.ms - b.ms);
  full.secondary.sort((a, b) => a.ms - b.ms);
  await pause();

  const peaks = assessment && view !== "front" ? repetitionKneePeaks(assessment) : [];
  // De frente la marca va en la rodilla que más se fue hacia adentro; de lado, en la flexión
  const peakSeries = view === "front" ? [...full.primary, ...full.secondary] : full.primary;
  const repetitions = (assessment?.repetitions ?? []).map((rep, i) => {
    let top: AngleSample | null = null;
    for (const sample of peakSeries) if (sample.ms >= rep.start_ms && sample.ms < rep.end_ms && sample.degrees > (top?.degrees ?? -Infinity)) top = sample;
    const worst = Math.max(0, ...rep.pattern_scores.map((score) => score.score ?? 0));
    const level = riskLevel(worst, cuts);
    // El ángulo es el que midió la IA; la muestra solo ubica el instante en la gráfica
    const peak = { ms: top?.ms ?? rep.start_ms, degrees: peaks[i] ?? top?.degrees ?? 0 };
    return { startMs: rep.start_ms, endMs: rep.end_ms, level, peak, focus: level === "low" ? null : repetitionFocus(assessment!, rep) };
  });
  await pause();

  const durationMs = Math.max(full.primary.at(-1)?.ms ?? 0, full.secondary.at(-1)?.ms ?? 0, ...repetitions.map((rep) => rep.endMs));
  return {
    view,
    primary: decimate(full.primary),
    secondary: decimate(full.secondary),
    repetitions,
    durationMs,
    fullPrimary: full.primary,
    fullSecondary: full.secondary,
  };
}
