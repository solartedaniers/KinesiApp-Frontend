// Métricas de una lista de análisis: lógica pura (sin React ni red) para poder probarla sola.
import type { AnalysisSummary, RiskCuts } from "./types";

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

/** Nivel de un puntaje que calculo aquí (un promedio, la peor repetición). Un análisis ya trae el suyo. */
export function riskLevel(score: number, cuts: RiskCuts): RiskLevel {
  if (score >= cuts.high) return "high";
  return score >= cuts.moderate ? "moderate" : "low";
}

export function sortByRecordedDesc(analyses: AnalysisSummary[]): AnalysisSummary[] {
  return [...analyses].sort((a, b) => Date.parse(b.recorded_at) - Date.parse(a.recorded_at));
}

export function computeStatistics(analyses: AnalysisSummary[], cuts: RiskCuts): AnalysisStatistics {
  const scores = analyses.flatMap((analysis) => (analysis.risk_score === null ? [] : [analysis.risk_score]));
  const count = (status: AnalysisSummary["status"]) => analyses.filter((analysis) => analysis.status === status).length;
  return {
    total: analyses.length,
    pending: count("pending"),
    processed: count("processed"),
    failed: count("failed"),
    averageRisk: scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null,
    highestRisk: scores.length ? Math.max(...scores) : null,
    highRiskCount: scores.filter((score) => score >= cuts.high).length,
    lastRecordedAt: sortByRecordedDesc(analyses)[0]?.recorded_at ?? null,
  };
}

export type AthleteSummary = { athleteId: string; stats: AnalysisStatistics; latestScore: number | null };

/** Estadísticas por deportista (vista de equipo del coach); sólo deportistas con grabaciones. */
export function statsByAthlete(analyses: AnalysisSummary[], cuts: RiskCuts): Map<string, AthleteSummary> {
  const groups = new Map<string, AnalysisSummary[]>();
  for (const analysis of analyses) groups.set(analysis.athlete_id, [...(groups.get(analysis.athlete_id) ?? []), analysis]);
  return new Map(
    [...groups].map(([athleteId, own]) => [
      athleteId,
      {
        athleteId,
        stats: computeStatistics(own, cuts),
        latestScore: sortByRecordedDesc(own).find((analysis) => analysis.risk_score !== null)?.risk_score ?? null,
      },
    ]),
  );
}

/** Edad cumplida en `today` a partir de "AAAA-MM-DD" (fecha de nacimiento sin hora). */
export function ageOn(birthDate: string, today: Date): number {
  const [year, month, day] = birthDate.split("-").map(Number);
  const hadBirthday = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  return today.getFullYear() - year - (hadBirthday ? 0 : 1);
}
