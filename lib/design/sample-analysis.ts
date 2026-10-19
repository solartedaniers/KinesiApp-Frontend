// Análisis de ejemplo para la guía de estilo: una sentadilla de 40 s a 30 fps con la forma de los
// datos reales (flexión de rodilla e inclinación del tronco por frame, repeticiones con su puntaje).
// Es determinista (semilla fija) para que el render del servidor y el del cliente coincidan.
import type { RiskLevel } from "./risk";

export type SampleJoint = "knee" | "trunk";
export type AngleSample = { ms: number; degrees: number };
export type SampleRepetition = { startMs: number; endMs: number; score: number; level: RiskLevel; peakKnee: number };
export type SampleSession = { date: string; score: number; level: RiskLevel };

export const SAMPLE_FPS = 30;
export const SAMPLE_DURATION_MS = 40_000;
const REPETITIONS = 10;

/** Generador pseudoaleatorio con semilla (mulberry32). */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Mismos cortes que usa la guía para mostrar la escala; los reales los decide el backend
export function levelFor(score: number): RiskLevel {
  return score < 0.34 ? "low" : score < 0.67 ? "moderate" : "high";
}

function buildSample() {
  const next = random(20261019);
  const repLength = SAMPLE_DURATION_MS / REPETITIONS;
  // Profundidad de cada repetición: el cansancio la reduce hacia el final
  const depths = Array.from({ length: REPETITIONS }, (_, i) => 108 - i * 2.6 + (next() - 0.5) * 8);
  const knee: AngleSample[] = [];
  const trunk: AngleSample[] = [];
  for (let frame = 0; frame * (1000 / SAMPLE_FPS) < SAMPLE_DURATION_MS; frame++) {
    const ms = Math.round(frame * (1000 / SAMPLE_FPS));
    const rep = Math.min(REPETITIONS - 1, Math.floor(ms / repLength));
    const phase = (ms - rep * repLength) / repLength;
    const descent = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
    knee.push({ ms, degrees: 6 + descent * (depths[rep] - 6) + (next() - 0.5) * 2.4 });
    trunk.push({ ms, degrees: 8 + descent * (34 + rep * 1.4) + (next() - 0.5) * 2 });
  }
  const repetitions: SampleRepetition[] = depths.map((depth, i) => {
    const score = Math.min(0.95, Math.max(0.05, 0.12 + i * 0.065 + (next() - 0.5) * 0.12));
    return { startMs: i * repLength, endMs: (i + 1) * repLength, score, level: levelFor(score), peakKnee: depth };
  });
  const score = repetitions.reduce((sum, rep) => sum + rep.score, 0) / repetitions.length;
  return { knee, trunk, repetitions, score, level: levelFor(score) };
}

export const SAMPLE_ANALYSIS = buildSample();

/** Evolución de un deportista: una sesión cada dos semanas. */
export const SAMPLE_SESSIONS: SampleSession[] = [0.71, 0.64, 0.58, 0.61, 0.47, 0.41, 0.36, 0.29].map((score, i) => ({
  date: new Date(Date.UTC(2026, 5, 1 + i * 14)).toISOString(),
  score,
  level: levelFor(score),
}));

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
