// Datos de ejemplo comunes a las tres direcciones: la misma sentadilla para comparar sólo el diseño.
import type { Tick } from "@/components/lab/charts/ChartFrame";
import { NAV_BY_ROLE } from "@/lib/access";
import { lttb } from "@/lib/charts/lttb";
import { niceTicks } from "@/lib/charts/scale";
import type { LabIconName } from "@/lib/design/icons";
import { type AngleSample, SAMPLE_ANALYSIS, SAMPLE_DURATION_MS } from "@/lib/design/sample-analysis";
import type { Formatters } from "@/lib/format";

// 240 puntos por serie bastan para el ancho máximo de la gráfica y alivianan el HTML
const DRAWN_POINTS = 240;

const decimate = (samples: AngleSample[]) =>
  lttb(samples.map((s) => ({ ...s, x: s.ms, y: s.degrees })), DRAWN_POINTS).map(({ ms, degrees }) => ({ ms, degrees }));

const { knee, trunk, repetitions, score, level } = SAMPLE_ANALYSIS;

export const PROPOSAL = {
  date: "2026-10-14T15:20:00Z",
  durationMs: SAMPLE_DURATION_MS,
  knee: decimate(knee),
  trunk: decimate(trunk),
  repetitions,
  score,
  level,
  peakKnee: Math.max(...repetitions.map((rep) => rep.peakKnee)),
  // El pico real de cada repetición sale de todas las muestras, no de las reducidas
  peaks: repetitions.map((rep) =>
    knee.filter((s) => s.ms >= rep.startMs && s.ms < rep.endMs).reduce((best, s) => (s.degrees > best.degrees ? s : best)),
  ),
  firstRepetition: knee.filter((s) => s.ms < repetitions[0].endMs),
};

/** Rango de flexión de rodilla que la ficha y la gráfica marcan como objetivo en la sentadilla. */
export const TARGET_KNEE: [number, number] = [90, 120];

export function chartTicks(f: Formatters, seconds: string): { degrees: Tick[]; time: Tick[]; maxAngle: number } {
  const maxAngle = Math.max(...PROPOSAL.knee.map((s) => s.degrees), TARGET_KNEE[1]);
  return {
    maxAngle,
    degrees: niceTicks(0, maxAngle, 4).map((value) => ({ value, label: f.degrees(value) })),
    time: niceTicks(0, PROPOSAL.durationMs, 8)
      .filter((ms) => ms <= PROPOSAL.durationMs)
      .map((value) => ({ value, label: `${value / 1000} ${seconds}` })),
  };
}

// La navegación es la del deportista; sólo cambia el ícono, que en el rediseño sale del set nuevo
const NAV_ICONS: Record<string, LabIconName> = { home: "overview", video: "history", chart: "trend", user: "profile" };
export const PROPOSAL_NAV = NAV_BY_ROLE.athlete.map((item) => ({ ...item, labIcon: NAV_ICONS[item.icon] }));
