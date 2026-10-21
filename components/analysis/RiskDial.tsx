import type { ReactNode } from "react";

import { Dial } from "@/components/instrument/Dial";
import { riskLevel } from "@/lib/analysis-stats";
import { RISK_DIAL_BANDS, RISK_DIAL_MAX, RISK_TONE } from "@/lib/design/risk";

/**
 * Medidor de riesgo de 0 a 100 % con sus tres bandas. `mini` es el de las filas: sin escala y sin
 * números. Sin puntaje queda en reposo, igual que las grabaciones que siguen en proceso.
 */
export function RiskDial({ score, label, mini = false, delayMs = 0, className = "", children }: { score: number | null; label: string; mini?: boolean; delayMs?: number; className?: string; children?: ReactNode }) {
  return (
    <Dial
      value={score === null ? 0 : score * RISK_DIAL_MAX}
      max={RISK_DIAL_MAX}
      bands={RISK_DIAL_BANDS}
      tone={score === null ? undefined : RISK_TONE[riskLevel(score)]}
      ticks={!mini}
      labels={!mini}
      labelStep={25}
      sweep={score !== null}
      delayMs={delayMs}
      label={label}
      className={className}
    >
      {children}
    </Dial>
  );
}
