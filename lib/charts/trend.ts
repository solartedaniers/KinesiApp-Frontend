// Puntos y ejes de la tendencia del riesgo por sesión: los usa la guía con su ejemplo y la app con datos reales.
import { sortByRecordedDesc } from "@/lib/analysis-stats";
import type { Formatters } from "@/lib/format";
import { format } from "@/lib/i18n";
import type { RiskLevel } from "@/lib/design/risk";
import type { AnalysisSummary } from "@/lib/types";

export type RiskSession = { date: string; score: number; level: RiskLevel };

/** Sesiones procesadas en orden cronológico, para la tendencia del riesgo. */
export function riskSessions(analyses: AnalysisSummary[]): RiskSession[] {
  return sortByRecordedDesc(analyses)
    .reverse()
    .flatMap((a) => (a.risk_score === null || a.risk_level === null ? [] : [{ date: a.recorded_at, score: a.risk_score, level: a.risk_level }]));
}

// Más de cuatro fechas no caben debajo de la gráfica en el celular
const MAX_X_LABELS = 4;

export function riskTrendData(sessions: RiskSession[], f: Formatters, lastTemplate: string) {
  const points = sessions.map((s, i) => ({ x: i, score: s.score, level: s.level, label: `${f.shortDate(s.date)}: ${f.percent(s.score)}` }));
  const step = Math.max(1, Math.ceil(sessions.length / MAX_X_LABELS));
  return {
    points,
    yTicks: [0, 0.25, 0.5, 0.75, 1].map((value) => ({ value, label: f.percent(value) })),
    xTicks: sessions.map((s, i) => ({ value: i, label: f.shortDate(s.date) })).filter((_, i) => i % step === 0),
    lastLabel: format(lastTemplate, { score: f.percent(points.at(-1)!.score) }),
  };
}
