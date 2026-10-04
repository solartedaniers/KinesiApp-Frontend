import type { AnalysisStatistics } from "@/lib/analysis-stats";
import type { Formatters } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n";

import type { StatTile } from "./StatGrid";

type StatKey = keyof AnalysisStatistics;

const LABEL_KEYS: Record<StatKey, keyof Dictionary["stats"]> = {
  total: "recordings",
  processed: "processed",
  pending: "pending",
  failed: "failed",
  averageRisk: "averageRisk",
  highestRisk: "highestRisk",
  highRiskCount: "highRiskCount",
  lastRecordedAt: "lastRecording",
};

function display(t: Dictionary, fmt: Formatters, stats: AnalysisStatistics, key: StatKey): string {
  const value = stats[key];
  if (value === null) return t.stats.none;
  if (key === "averageRisk" || key === "highestRisk") return fmt.percent(value as number);
  if (key === "lastRecordedAt") return fmt.dateTime(value as string);
  return String(value);
}

/** Tarjetas en el orden pedido, en el idioma activo: el dashboard muestra 4, la pestaña de estadísticas las 8. */
export function statTiles(t: Dictionary, fmt: Formatters, stats: AnalysisStatistics, keys: StatKey[]): StatTile[] {
  return keys.map((key) => ({ label: t.stats[LABEL_KEYS[key]], value: display(t, fmt, stats, key) }));
}
