// Informe en PDF: el modelo y el dibujo del worker. Correr con: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// El mismo código que corre en el navegador (allowJs); pdf-lib lo deja ahí `npm run vendor`
import { PDFDocument } from "../public/vendor/pdf-lib.esm.min.js";
import { isReportModel, renderReport } from "../public/workers/report-worker.js";
import { buildTimeline } from "./analysis-timeline.ts";
import { COLORS } from "./design/palette.ts";
import type { Dictionary } from "./i18n/index.ts";
import { buildReportModel, openingExplanation, plainParagraphs } from "./report.ts";
import type { ChatMessage, JointAngleMeasurement, JumpAnalysis, RiskSignal } from "./types.ts";

const t = JSON.parse(readFileSync(new URL("./i18n/es.json", import.meta.url), "utf-8")) as Dictionary;
const f = { degrees: (v: number) => `${Math.round(v)}°`, percent: (v: number) => `${Math.round(v * 100)} %`, secondsFromMs: (ms: number) => `${ms / 1000} s`, dateTime: () => "5 oct 2026" };
const message = (id: number, role: ChatMessage["role"], content: string): ChatMessage => ({ id: String(id), role, content, created_at: "2026-10-05T10:00:00Z" });
const signal = (code: string, direction: RiskSignal["direction"], onset: number): RiskSignal => ({
  code, joint: "knee_flexion", direction, onset_degrees: onset, saturation_degrees: onset, measured: { median: 70, min: 50, max: 95 }, score_median: 0.2, side: null,
});
const measurements: JointAngleMeasurement[] = Array.from({ length: 90 }, (_, i) => [
  { id: i * 2, joint_name: "knee_flexion" as const, side: null, frame_timestamp_ms: i * 100, angle_degrees: 40 + 50 * Math.abs(Math.sin(i / 10)) },
  { id: i * 2 + 1, joint_name: "trunk_inclination" as const, side: null, frame_timestamp_ms: i * 100, angle_degrees: 15 + 10 * Math.abs(Math.sin(i / 10)) },
]).flat();
const analysis: JumpAnalysis = {
  id: "a1", athlete_id: "p1", movement_type: "jump", status: "processed", recorded_at: "2026-10-05T10:00:00Z",
  risk_score: 0.4, risk_level: "moderate", dominant_risk_pattern: "knee_rigid", failure_reason: null,
  knee_median_peak_degrees: 72, knee_target: { low: 60, high: 80 },
  angle_measurements: measurements,
  risk_assessment: {
    risk_score: 0.4, risk_level: "moderate", dominant_pattern: "knee_rigid", camera_view: "side", warnings: [],
    patterns: [{ code: "knee_rigid", score: 0.4, repetitions_triggered: 1, signals: [signal("rigid", "lower_is_riskier", 60), signal("deep", "higher_is_riskier", 80)] }],
    repetitions: [
      { start_ms: 0, end_ms: 3000, pattern_scores: [{ code: "knee_rigid", score: 0.1, measured_degrees: null, side: null, peak_ms: null }], signal_scores: [{ code: "rigid", score: 0, measured_degrees: 70, side: null, peak_ms: null }], keyframes: [] },
      { start_ms: 3000, end_ms: 6000, pattern_scores: [{ code: "knee_rigid", score: 0.8, measured_degrees: null, side: null, peak_ms: null }], signal_scores: [{ code: "rigid", score: 0.8, measured_degrees: 52, side: null, peak_ms: null }], keyframes: [] },
    ],
  },
};
const source = { analysis, athleteName: "Ana Pérez", coachName: null, explanation: "## Resumen\n**Buen** aterrizaje.\n\n- Rodilla estable\n- Tronco 🙂 erguido" };
const model = async (explanation = source.explanation) => buildReportModel({ source: { ...source, explanation }, timeline: await buildTimeline(measurements, analysis.risk_assessment, { moderate: 0.33, high: 0.66 }, async () => {}), t, f });

test("vista de frente, el informe da el valgo de cada rodilla, qué pierna quedó en riesgo y en qué segundo", async () => {
  const valgus = (id: number, side: "left" | "right", ms: number, degrees: number): JointAngleMeasurement => ({ id, joint_name: "knee_valgus", side, frame_timestamp_ms: ms, angle_degrees: degrees });
  const frontSignal: RiskSignal = { ...signal("knee_valgus_right", "higher_is_riskier", 10), joint: "knee_valgus", side: "right" };
  const samples = [valgus(1, "left", 1000, -4), valgus(2, "right", 1500, 22), valgus(3, "left", 4000, 2), valgus(4, "right", 4500, 6)];
  const front: JumpAnalysis = {
    ...analysis,
    knee_median_peak_degrees: null,
    angle_measurements: samples,
    risk_assessment: {
      ...analysis.risk_assessment!,
      camera_view: "front",
      patterns: [{ code: "knee_valgus_right", score: 0.8, repetitions_triggered: 1, signals: [frontSignal] }],
      repetitions: [
        { start_ms: 0, end_ms: 3000, pattern_scores: [{ code: "knee_valgus_right", score: 0.8, measured_degrees: 22, side: "right", peak_ms: 1500 }], signal_scores: [{ code: "knee_valgus_right", score: 0.8, measured_degrees: 22, side: "right", peak_ms: 1500 }], keyframes: [] },
        { start_ms: 3000, end_ms: 6000, pattern_scores: [{ code: "knee_valgus_right", score: 0, measured_degrees: 6, side: "right", peak_ms: 4500 }], signal_scores: [{ code: "knee_valgus_right", score: 0, measured_degrees: 6, side: "right", peak_ms: 4500 }], keyframes: [] },
      ],
    },
  };
  const timeline = await buildTimeline(samples, front.risk_assessment, { moderate: 0.33, high: 0.66 }, async () => {});
  const report = buildReportModel({ source: { ...source, analysis: front }, timeline, t, f });
  assert.deepEqual(report.figures.slice(0, 4).map((figure) => figure.value), ["De frente", "-1°", "14°", "15°"]);
  assert.deepEqual(report.repetitions?.headers, [t.report.repetition, t.report.peak, t.report.focus, t.report.risk]);
  assert.deepEqual(report.repetitions?.rows.map((row) => row.cells), [["1", "22°", "Rodilla derecha hacia adentro · 1.5 s", "Alto"], ["2", "6°", "—", "Bajo"]]);
  assert.equal(report.chart?.minDegrees, -30);
  assert.deepEqual(report.chart?.series.map((series) => series.label), [t.analysis.valgus.left, t.analysis.valgus.right]);
  assert.deepEqual(report.notes, [t.analysis.valgusNote]);
});

test("el informe lleva la explicación inicial de la IA, no las preguntas posteriores", () => {
  const thread = [message(1, "assistant", "Explicación inicial"), message(2, "user", "¿Y el tronco?"), message(3, "assistant", "Respuesta")];
  assert.equal(openingExplanation(thread), "Explicación inicial");
  assert.equal(openingExplanation([]), null);
});

test("la explicación pierde las marcas de Markdown y conserva las viñetas", () => {
  assert.deepEqual(plainParagraphs(source.explanation), ["Resumen", "Buen aterrizaje.", "• Rodilla estable", "• Tronco 🙂 erguido"]);
});

test("cada repetición se lee con la zona del rango que puntuó la IA", async () => {
  const report = await model();
  assert.deepEqual(report.repetitions?.rows.map((row) => row.cells), [["1", "70°", "En el objetivo", "Bajo"], ["2", "52°", "Rígida", "Alto"]]);
  assert.deepEqual(report.repetitions?.rows.map((row) => row.color), [COLORS["zone-target"][0], COLORS["zone-under"][0]]);
  assert.deepEqual(report.figures.map((figure) => figure.value), ["De lado", "72°", "60°–80°", "25°", "1 de 2 en el rango sin riesgo", "Riesgo moderado · 40 %"]);
  assert.equal(report.chart?.bands.length, 3);
  assert.equal(report.people[1].value, t.report.noCoach);
  assert.deepEqual(report.notes, [t.analysis.rangesNote]);
});

test("el worker acepta el modelo que arma la app y descarta uno incompleto", async () => {
  const built = await model();
  assert.equal(isReportModel(built), true);
  assert.equal(isReportModel({ ...built, notes: "una nota" }), false);
  assert.equal(isReportModel({ ...built, colors: { ...built.colors, accent: 7 } }), false);
  assert.equal(isReportModel(null), false);
});

test("el worker dibuja un PDF válido y pagina una explicación larga aunque traiga emojis", async () => {
  const short = await PDFDocument.load(await renderReport(await model()));
  const long = await PDFDocument.load(await renderReport(await model(Array.from({ length: 60 }, () => "Párrafo largo 🚀 con la rodilla a 70° y el tronco erguido durante la fase de aterrizaje del salto.").join("\n\n"))));
  assert.ok(long.getPageCount() > short.getPageCount());
});
