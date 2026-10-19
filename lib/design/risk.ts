// Niveles de riesgo que calcula el backend (RiskLevel del contrato), en el orden de la escala.
export const RISK_LEVELS = ["low", "moderate", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];
