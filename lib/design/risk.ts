// Niveles de riesgo que calcula el backend (RiskLevel del contrato), en el orden de la escala.
export const RISK_LEVELS = ["low", "moderate", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

// El riesgo nunca depende sólo del color: cada nivel es un paso más de una escala de tres
export const RISK_STEP: Record<RiskLevel, 1 | 2 | 3> = { low: 1, moderate: 2, high: 3 };

// Clases literales para que Tailwind las encuentre al compilar
export const RISK_TEXT: Record<RiskLevel, string> = { low: "text-risk-low", moderate: "text-risk-moderate", high: "text-risk-high" };
export const RISK_FILL: Record<RiskLevel, string> = { low: "bg-risk-low", moderate: "bg-risk-moderate", high: "bg-risk-high" };
export const RISK_SOFT: Record<RiskLevel, string> = { low: "bg-risk-low-soft", moderate: "bg-risk-moderate-soft", high: "bg-risk-high-soft" };
