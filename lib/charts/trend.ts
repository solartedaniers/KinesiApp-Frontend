// Puntos y ejes de la tendencia del riesgo por sesión: los usa la guía con su ejemplo y la app con datos reales.
import type { Formatters } from "@/lib/format";
import { format } from "@/lib/i18n";
import type { RiskLevel } from "@/lib/design/risk";

export type RiskSession = { date: string; score: number; level: RiskLevel };

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
