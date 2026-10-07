import type { RiskLevel } from "@/lib/analysis-stats";

// Color por nivel de riesgo: la única parte de la interfaz que usa verde, ámbar y rojo
export const RISK_TEXT: Record<RiskLevel, string> = {
  low: "text-risk-low",
  moderate: "text-risk-moderate",
  high: "text-risk-high",
};

export const RISK_FILL: Record<RiskLevel, string> = {
  low: "bg-risk-low",
  moderate: "bg-risk-moderate",
  high: "bg-risk-high",
};
