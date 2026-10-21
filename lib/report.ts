// Contenido del informe en PDF: lógica pura (testeada en report.test.ts). El dibujo lo hace el worker.
import { countInTarget, repetitionKneePeaks } from "./analysis-reading.ts";
import type { AngleSample, Timeline } from "./analysis-timeline.ts";
import { COLORS, type PaletteColor } from "./design/palette.ts";
import { targetText, type Zone, zoneOf, zoneSpans } from "./design/signals.ts";
import type { Formatters } from "./format.ts";
import type { Dictionary } from "./i18n/index.ts";
import { format } from "./i18n/locale.ts";
import type { ChatMessage, JumpAnalysis } from "./types.ts";

type ReportFormat = Pick<Formatters, "degrees" | "percent" | "secondsFromMs" | "dateTime">;
type ReportPair = { label: string; value: string; color: string };
type ReportChart = {
  title: string;
  durationMs: number;
  maxDegrees: number;
  series: { label: string; color: string; points: AngleSample[] }[];
  bands: { from: number; to: number; color: string }[];
  marks: { ms: number; degrees: number; color: string }[];
  xLabels: { ms: number; text: string }[];
  yLabels: { degrees: number; text: string }[];
};

/** Todo lo que el worker necesita para dibujar el PDF, ya traducido, formateado y con sus colores. */
export type ReportModel = {
  brand: string;
  title: string;
  subtitle: string;
  people: ReportPair[];
  figures: ReportPair[];
  chart: ReportChart | null;
  repetitions: { title: string; headers: string[]; rows: { cells: string[]; color: string }[] } | null;
  explanation: { title: string; paragraphs: string[] };
  notes: string[];
  disclaimer: { title: string; body: string };
  pageLabel: string;
  colors: { ink: string; muted: string; line: string; accent: string; panel: string };
};

export type ReportSource = { analysis: JumpAnalysis; athleteName: string; coachName: string | null; explanation: string | null };

// El papel es claro: uso la variante clara de cada color de la paleta
const paper = (color: PaletteColor) => COLORS[color][0];
const ZONE_SOFT: Record<Zone, PaletteColor> = { under: "zone-under-soft", target: "zone-target-soft", over: "zone-over-soft" };
const ZONE_STRONG: Record<Zone, PaletteColor> = { under: "zone-under", target: "zone-target", over: "zone-over" };
const RISK_STRONG = { low: "risk-low", moderate: "risk-moderate", high: "risk-high" } as const;
// Pasos del eje: cada 30° y el primer paso de segundos que deja como mucho ocho marcas
const DEGREE_STEP = 30;
const SECOND_STEPS = [1, 2, 5, 10, 15, 30];
const MAX_TIME_LABELS = 8;

/**
 * Explicación de la IA que va en el informe: la primera respuesta del asistente en el hilo, que es la
 * explicación inicial del resultado (las preguntas posteriores del usuario no van al informe).
 */
export function openingExplanation(messages: ChatMessage[]): string | null {
  return messages.find((message) => message.role === "assistant")?.content ?? null;
}

const BLOCK_START = /^(#{1,6}\s|[-*•]\s|\d+\.\s)/;
const HEADING = /^#{1,6}\s+/;

/** Párrafos sin marcas de Markdown: el PDF no las interpreta y quedarían los asteriscos a la vista. */
export function plainParagraphs(text: string): string[] {
  const blocks: string[] = [];
  let current = "";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if ((!line || BLOCK_START.test(line)) && current) {
      blocks.push(current);
      current = "";
    }
    if (!line) continue;
    current = current ? `${current} ${line}` : line;
    // Un título queda solo en su párrafo, aunque lo siga texto sin línea en blanco
    if (HEADING.test(line)) {
      blocks.push(current);
      current = "";
    }
  }
  if (current) blocks.push(current);
  return blocks.map((block) =>
    block
      .replace(HEADING, "")
      .replace(/^[-*]\s+/, "• ")
      .replace(/\*\*(.+?)\*\*|__(.+?)__|\*(.+?)\*|`(.+?)`/g, (_, ...groups) => groups.find((group) => typeof group === "string") ?? ""),
  );
}

function chartOf({ analysis, timeline, t, f }: { analysis: JumpAnalysis; timeline: Timeline; t: Dictionary; f: ReportFormat }): ReportChart | null {
  if (timeline.knee.length === 0 && timeline.trunk.length === 0) return null;
  const target = analysis.knee_target;
  const highest = Math.max(...timeline.knee.map((s) => s.degrees), ...timeline.trunk.map((s) => s.degrees), target?.low ?? 0, target?.high ?? 0);
  const maxDegrees = Math.ceil((highest + 1) / DEGREE_STEP) * DEGREE_STEP;
  const seconds = SECOND_STEPS.find((step) => timeline.durationMs / (step * 1000) <= MAX_TIME_LABELS) ?? SECOND_STEPS.at(-1)!;
  const peaks = analysis.risk_assessment ? repetitionKneePeaks(analysis.risk_assessment) : [];
  return {
    title: t.report.charts,
    durationMs: timeline.durationMs,
    maxDegrees,
    series: [
      { label: t.joints.knee_flexion, color: paper("knee"), points: timeline.knee },
      { label: t.joints.trunk_inclination, color: paper("trunk"), points: timeline.trunk },
    ].filter((series) => series.points.length > 0),
    bands: target ? zoneSpans(maxDegrees, target).map(({ zone, from, to }) => ({ from, to, color: paper(ZONE_SOFT[zone]) })) : [],
    marks: timeline.repetitions.map((rep, i) => {
      const peak = peaks[i];
      return { ...rep.peak, color: paper(target && peak !== null ? ZONE_STRONG[zoneOf(peak, target)] : RISK_STRONG[rep.level]) };
    }),
    xLabels: Array.from({ length: Math.floor(timeline.durationMs / (seconds * 1000)) + 1 }, (_, i) => ({ ms: i * seconds * 1000, text: f.secondsFromMs(i * seconds * 1000) })),
    yLabels: Array.from({ length: maxDegrees / DEGREE_STEP + 1 }, (_, i) => ({ degrees: i * DEGREE_STEP, text: f.degrees(i * DEGREE_STEP) })),
  };
}

/** Arma el informe con los mismos datos y textos que muestra la pantalla del resultado. */
export function buildReportModel({ source, timeline, t, f }: { source: ReportSource; timeline: Timeline; t: Dictionary; f: ReportFormat }): ReportModel {
  const { analysis } = source;
  const r = t.report;
  const target = analysis.knee_target;
  const knee = analysis.knee_median_peak_degrees;
  const peaks = analysis.risk_assessment ? repetitionKneePeaks(analysis.risk_assessment) : [];
  const trunkPeak = timeline.trunk.length ? Math.max(...timeline.trunk.map((s) => s.degrees)) : null;
  const level = analysis.risk_level;
  const zones = t.analysis.kneeZones[analysis.movement_type];
  const ink = paper("ink");

  const figures: ReportPair[] = [
    { label: t.analysis.kneeMedian, value: knee === null ? t.analysis.noKnee : f.degrees(knee), color: paper("knee") },
    ...(target ? [{ label: r.target, value: targetText(target, f.degrees, t.analysis.kneeTarget), color: paper("zone-target") }] : []),
    ...(trunkPeak === null ? [] : [{ label: t.analysisDetail.peakTrunk, value: f.degrees(trunkPeak), color: paper("trunk") }]),
    {
      label: t.analysis.repetitions,
      value: target ? format(t.analysisDetail.inTarget, { count: countInTarget(peaks, target), total: peaks.length }) : String(peaks.length),
      color: ink,
    },
    ...(level && analysis.risk_score !== null ? [{ label: t.analysisDetail.risk, value: `${t.analysis.risk[level]} · ${f.percent(analysis.risk_score)}`, color: paper(RISK_STRONG[level]) }] : []),
  ];

  return {
    brand: t.app.name,
    title: r.title,
    subtitle: format(r.subtitle, { movement: t.analysis.movement[analysis.movement_type], date: f.dateTime(analysis.recorded_at) }),
    people: [
      { label: r.athlete, value: source.athleteName, color: ink },
      { label: r.coach, value: source.coachName ?? r.noCoach, color: ink },
    ],
    figures,
    chart: chartOf({ analysis, timeline, t, f }),
    repetitions: timeline.repetitions.length
      ? {
          title: t.analysis.repetitions,
          headers: [r.repetition, r.kneePeak, r.zone, r.risk],
          rows: timeline.repetitions.map((rep, i) => {
            const peak = peaks[i];
            const zone = target && peak !== null ? zoneOf(peak, target) : null;
            return {
              cells: [String(i + 1), peak === null ? r.empty : f.degrees(peak), zone ? zones[zone] : r.empty, t.analysis.riskShort[rep.level]],
              color: paper(zone ? ZONE_STRONG[zone] : RISK_STRONG[rep.level]),
            };
          }),
        }
      : null,
    explanation: { title: r.explanation, paragraphs: source.explanation ? plainParagraphs(source.explanation) : [r.noExplanation] },
    notes: target ? [t.analysis.rangesNote] : [],
    disclaimer: { title: r.disclaimerTitle, body: r.disclaimer },
    pageLabel: r.page,
    colors: { ink, muted: paper("ink-muted"), line: paper("line"), accent: paper("accent"), panel: paper("raised") },
  };
}
