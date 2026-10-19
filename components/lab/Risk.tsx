import type { RiskLevel } from "@/lib/design/risk";

// El riesgo nunca depende sólo del color: cada nivel suma una barra y tiene su propia trama
const BARS: Record<RiskLevel, number> = { low: 1, moderate: 2, high: 3 };

export const RISK_TEXT: Record<RiskLevel, string> = { low: "text-risk-low", moderate: "text-risk-moderate", high: "text-risk-high" };
const RISK_SOFT: Record<RiskLevel, string> = { low: "bg-risk-low-soft", moderate: "bg-risk-moderate-soft", high: "bg-risk-high-soft" };

/** Id del <pattern> de cada nivel; las definiciones las monta RiskPatterns una vez por página. */
export const riskPatternId = (level: RiskLevel) => `lab-risk-${level}`;

export function RiskGauge({ level, size = 16 }: { level: RiskLevel; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden className={RISK_TEXT[level]}>
      {[0, 1, 2].map((bar) => (
        <rect
          key={bar}
          x={1 + bar * 5}
          y={10 - bar * 4}
          width={4}
          height={5 + bar * 4}
          rx={0.5}
          fill={bar < BARS[level] ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={bar < BARS[level] ? 0 : 1}
          strokeOpacity={0.55}
        />
      ))}
    </svg>
  );
}

/** Nivel de riesgo con su palabra; `value` es el puntaje ya formateado, en cifras de métrica. */
export function RiskTag({ level, label, value }: { level: RiskLevel; label: string; value?: string }) {
  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-tag px-2 text-sm font-semibold ${RISK_SOFT[level]} ${RISK_TEXT[level]}`}>
      <RiskGauge level={level} />
      {label}
      {value && <span className="font-mono text-xs font-medium [font-variant-numeric:tabular-nums]">{value}</span>}
    </span>
  );
}

/** Tramas de riesgo para rellenar áreas de las gráficas: puntos, rayado y cuadriculado. */
export function RiskPatterns() {
  return (
    <svg width={0} height={0} aria-hidden className="absolute">
      <defs>
        <pattern id={riskPatternId("low")} width={6} height={6} patternUnits="userSpaceOnUse" className="text-risk-low">
          <circle cx={3} cy={3} r={0.9} fill="currentColor" />
        </pattern>
        <pattern id={riskPatternId("moderate")} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)" className="text-risk-moderate">
          <line x1={0} y1={0} x2={0} y2={6} stroke="currentColor" strokeWidth={1.6} />
        </pattern>
        <pattern id={riskPatternId("high")} width={5} height={5} patternUnits="userSpaceOnUse" patternTransform="rotate(45)" className="text-risk-high">
          <path d="M0 0V5M0 0H5" stroke="currentColor" strokeWidth={1.4} fill="none" />
        </pattern>
      </defs>
    </svg>
  );
}
