import type { AnalysisStatistics } from "@/lib/analysis-stats";
import { formatDateTime, formatPercent } from "@/lib/format";
import { t } from "@/lib/i18n";

import type { StatTile } from "./StatGrid";

type StatKey = keyof AnalysisStatistics;

const LABELS: Record<StatKey, string> = {
  total: t.stats.recordings,
  processed: t.stats.processed,
  pending: t.stats.pending,
  failed: t.stats.failed,
  averageRisk: t.stats.averageRisk,
  highestRisk: t.stats.highestRisk,
  highRiskCount: t.stats.highRiskCount,
  lastRecordedAt: t.stats.lastRecording,
};

function display(stats: AnalysisStatistics, key: StatKey): string {
  const value = stats[key];
  if (value === null) return t.stats.none;
  if (key === "averageRisk" || key === "highestRisk") return formatPercent(value as number);
  if (key === "lastRecordedAt") return formatDateTime(value as string);
  return String(value);
}

/** Tarjetas en el orden pedido: el dashboard muestra 4, la pestaña de estadísticas las 8. */
export function statTiles(stats: AnalysisStatistics, keys: StatKey[]): StatTile[] {
  return keys.map((key) => ({ label: LABELS[key], value: display(stats, key) }));
}
