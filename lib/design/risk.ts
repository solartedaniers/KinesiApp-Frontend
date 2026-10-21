// Niveles de riesgo que calcula el backend (RiskLevel del contrato), en el orden de la escala.
export const RISK_LEVELS = ["low", "moderate", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

// El riesgo nunca depende sólo del color: cada nivel es un paso más de una escala de tres
export const RISK_STEP: Record<RiskLevel, 1 | 2 | 3> = { low: 1, moderate: 2, high: 3 };

// Clases literales para que Tailwind las encuentre al compilar
export const RISK_TEXT: Record<RiskLevel, string> = { low: "text-risk-low", moderate: "text-risk-moderate", high: "text-risk-high" };
export const RISK_FILL: Record<RiskLevel, string> = { low: "bg-risk-low", moderate: "bg-risk-moderate", high: "bg-risk-high" };
// Tono de un medidor de riesgo: aguja, arco y brillo del bisel en el color del nivel
export const RISK_TONE: Record<RiskLevel, { stroke: string; fill: string; text: string; tint: string }> = {
  low: { stroke: "stroke-risk-low", fill: "fill-risk-low", text: "text-risk-low", tint: "var(--kin-risk-low)" },
  moderate: { stroke: "stroke-risk-moderate", fill: "fill-risk-moderate", text: "text-risk-moderate", tint: "var(--kin-risk-moderate)" },
  high: { stroke: "stroke-risk-high", fill: "fill-risk-high", text: "text-risk-high", tint: "var(--kin-risk-high)" },
};
export const RISK_SOFT: Record<RiskLevel, string> = { low: "bg-risk-low-soft", moderate: "bg-risk-moderate-soft", high: "bg-risk-high-soft" };
