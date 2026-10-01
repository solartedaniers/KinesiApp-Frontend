// Métricas de una lista de análisis: lógica pura (sin React ni red), testeada en analysis-stats.test.ts.
// Mismo cálculo que AnalysisStatistics del cliente Flutter.
import type { JointAngleMeasurement, JumpAnalysis } from "./types";

// Umbrales de nivel de riesgo sobre risk_score ∈ [0, 1]. "Alto" es el de Flutter; "moderado" es un
// corte de presentación. Ninguno tiene validación clínica (video-analysis-pipeline.md §5)
export const RISK_THRESHOLDS = { moderate: 0.33, high: 0.66 } as const;

export type RiskLevel = "low" | "moderate" | "high";

export type AnalysisStatistics = {
  total: number;
  pending: number;
  processed: number;
  failed: number;
  averageRisk: number | null;
  highestRisk: number | null;
  highRiskCount: number;
  lastRecordedAt: string | null;
};

export function riskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.high) return "high";
  return score >= RISK_THRESHOLDS.moderate ? "moderate" : "low";
}

export function sortByRecordedDesc(analyses: JumpAnalysis[]): JumpAnalysis[] {
  return [...analyses].sort((a, b) => Date.parse(b.recorded_at) - Date.parse(a.recorded_at));
}

export function computeStatistics(analyses: JumpAnalysis[]): AnalysisStatistics {
  const scores = analyses.flatMap((analysis) => (analysis.risk_score === null ? [] : [analysis.risk_score]));
  const count = (status: JumpAnalysis["status"]) => analyses.filter((analysis) => analysis.status === status).length;
  return {
    total: analyses.length,
    pending: count("pending"),
    processed: count("processed"),
    failed: count("failed"),
    averageRisk: scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null,
    highestRisk: scores.length ? Math.max(...scores) : null,
    highRiskCount: scores.filter((score) => score >= RISK_THRESHOLDS.high).length,
    lastRecordedAt: sortByRecordedDesc(analyses)[0]?.recorded_at ?? null,
  };
}

export type RiskPoint = { analysisId: number; recordedAt: string; score: number };

/** Serie temporal del gráfico: sólo análisis con puntaje, del más antiguo al más reciente. */
export function riskTrend(analyses: JumpAnalysis[]): RiskPoint[] {
  return sortByRecordedDesc(analyses)
    .reverse()
    .flatMap((analysis) =>
      analysis.risk_score === null
        ? []
        : [{ analysisId: analysis.id, recordedAt: analysis.recorded_at, score: analysis.risk_score }],
    );
}

export type JointSeries = { joint: string; points: JointAngleMeasurement[]; peak: number };

/** Mediciones agrupadas por articulación, cada serie en orden temporal: un gráfico por articulación. */
export function anglesByJoint(measurements: JointAngleMeasurement[]): JointSeries[] {
  const groups = new Map<string, JointAngleMeasurement[]>();
  for (const measurement of measurements) {
    groups.set(measurement.joint_name, [...(groups.get(measurement.joint_name) ?? []), measurement]);
  }
  return [...groups].map(([joint, points]) => {
    const sorted = [...points].sort((a, b) => a.frame_timestamp_ms - b.frame_timestamp_ms);
    return { joint, points: sorted, peak: Math.max(...sorted.map((point) => point.angle_degrees)) };
  });
}
