// Datos de ejemplo que comparten la guía y sus pantallas: la misma sentadilla en todas partes.
import type { Formatters } from "@/lib/format";
import { format } from "@/lib/i18n";
import { lttb } from "@/lib/charts/lttb";
import type { RiskLevel } from "@/lib/design/risk";
import type { KneeTarget } from "@/lib/design/signals";
import { type AngleSample, levelFor, SAMPLE_ANALYSIS, SAMPLE_DURATION_MS, SAMPLE_SESSIONS } from "@/lib/design/sample-analysis";

// 240 puntos por serie bastan para el ancho máximo de la gráfica y alivianan el HTML
const DRAWN_POINTS = 240;

const decimate = (samples: AngleSample[]) =>
  lttb(samples.map((s) => ({ ...s, x: s.ms, y: s.degrees })), DRAWN_POINTS).map(({ ms, degrees }) => ({ ms, degrees }));

const { knee, trunk, repetitions, score, level } = SAMPLE_ANALYSIS;

const peakIn = (samples: AngleSample[], from: number, to: number) =>
  samples.filter((s) => s.ms >= from && s.ms < to).reduce((best, s) => (s.degrees > best.degrees ? s : best));

// Lo que traería el resumen de esta sentadilla con los umbrales por defecto de la IA: solo límite inferior
const SAMPLE_KNEE_TARGET: KneeTarget = { low: 90, high: null };

export const GUIDE_SAMPLE = {
  movement: "squat" as const,
  kneeTarget: SAMPLE_KNEE_TARGET,
  date: "2026-10-14T15:20:00Z",
  athlete: "Valentina Ríos",
  durationMs: SAMPLE_DURATION_MS,
  knee: decimate(knee),
  trunk: decimate(trunk),
  repetitions,
  score,
  level,
  peakKnee: Math.max(...repetitions.map((rep) => rep.peakKnee)),
  peakTrunk: Math.max(...trunk.map((s) => s.degrees)),
  // El pico real de cada repetición sale de todas las muestras, no de las reducidas
  timeline: repetitions.map((rep) => ({ startMs: rep.startMs, endMs: rep.endMs, level: rep.level, peak: peakIn(knee, rep.startMs, rep.endMs) })),
  firstRepetition: knee.filter((s) => s.ms < repetitions[0].endMs),
  sessions: SAMPLE_SESSIONS,
};

/** Grabaciones anteriores del deportista para la pantalla de inicio. */
export const RECENT_ANALYSES: { id: string; movement: "jump" | "squat"; date: string; peak: number; score: number; level: RiskLevel }[] = [
  { id: "a-14", movement: "squat", date: GUIDE_SAMPLE.date, peak: GUIDE_SAMPLE.peakKnee, score, level },
  { id: "a-09", movement: "jump", date: "2026-10-09T13:10:00Z", peak: 96, score: 0.29, level: levelFor(0.29) },
  { id: "a-02", movement: "squat", date: "2026-10-02T14:05:00Z", peak: 104, score: 0.36, level: levelFor(0.36) },
];

/** Rango y mediana de la flexión máxima de cada deportista del equipo. */
export const TEAM_RANGES = [
  { label: "Valentina Ríos", min: 96, median: 104, max: 112 },
  { label: "Samuel Ortiz", min: 78, median: 86, max: 101 },
  { label: "Lucía Herrera", min: 104, median: 123, max: 131 },
  { label: "Mateo Quintero", min: 84, median: 92, max: 97 },
];

/** Sesiones de ejemplo como puntos de la tendencia; también las usa el inicio del deportista. */
export function trendData(f: Formatters, lastTemplate: string) {
  const points = GUIDE_SAMPLE.sessions.map((s, i) => ({ x: i, score: s.score, level: s.level, label: `${f.shortDate(s.date)}: ${f.percent(s.score)}` }));
  return {
    points,
    yTicks: [0, 0.25, 0.5, 0.75, 1].map((value) => ({ value, label: f.percent(value) })),
    // Una fecha de por medio: ocho rótulos no caben en el celular
    xTicks: GUIDE_SAMPLE.sessions.map((s, i) => ({ value: i, label: f.shortDate(s.date) })).filter((_, i) => i % 2 === 0),
    lastLabel: format(lastTemplate, { score: f.percent(points.at(-1)!.score) }),
  };
}
