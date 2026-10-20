import type { ReactNode } from "react";

import { Glyph } from "./Glyph";

import { cssVars } from "@/lib/design/css";
import type { GlyphName } from "@/lib/design/icons";
import { RISK_FILL, RISK_SOFT, RISK_STEP, RISK_TEXT, type RiskLevel } from "@/lib/design/risk";
import { type Zone, ZONE_CLASS } from "@/lib/design/signals";

type Tone = "info" | "success" | "warning";

// El aviso de advertencia usa el ámbar del riesgo moderado: es la misma idea de "atención"
const NOTICE: Record<Tone, { glyph: GlyphName; tint: string; text: string }> = {
  info: { glyph: "info", tint: "var(--kin-accent)", text: "text-accent" },
  success: { glyph: "check", tint: "var(--kin-zone-target)", text: "text-zone-target" },
  warning: { glyph: "alert", tint: "var(--kin-risk-moderate)", text: "text-risk-moderate" },
};

export function Notice({ tone, children }: { tone: Tone; children: ReactNode }) {
  const { glyph, tint, text } = NOTICE[tone];
  return (
    <p className="kin-card kin-tinted flex items-start gap-3 p-3.5 text-sm text-ink" style={cssVars({ "--tint": tint })} role="status">
      <Glyph name={glyph} size={20} className={`mt-px flex-none ${text}`} />
      <span>{children}</span>
    </p>
  );
}

export type AiState = "waking" | "ready" | "unavailable";

const AI: Record<AiState, { dot: string; ring: string }> = {
  waking: { dot: "bg-trunk kin-waking text-trunk", ring: "shadow-[inset_0_0_0_1px_var(--kin-trunk)]" },
  ready: { dot: "bg-zone-target text-zone-target", ring: "shadow-[inset_0_0_0_1px_var(--kin-zone-target)]" },
  unavailable: { dot: "bg-ink-muted text-ink-muted", ring: "shadow-[inset_0_0_0_1px_var(--kin-line-strong)]" },
};

/** Estado de la IA: el punto late mientras despierta. role="status" anuncia cada cambio. */
export function AiStatus({ state, label, hint }: { state: AiState; label: string; hint?: string }) {
  return (
    <p className="grid justify-items-start gap-1" role="status">
      <span className={`inline-flex min-h-9 items-center gap-2 rounded-full bg-panel px-3 text-sm font-semibold whitespace-nowrap text-ink ${AI[state].ring}`}>
        <span className={`size-2.5 flex-none rounded-full ${AI[state].dot}`} aria-hidden />
        <Glyph name="ai" size={16} className="text-ink-muted" />
        {label}
      </span>
      {hint && <span className="px-1 text-sm text-ink-muted">{hint}</span>}
    </p>
  );
}

/** Nivel de riesgo con su palabra y de uno a tres escalones: el color nunca va solo. */
export function RiskScale({ level, label, steps, value }: { level: RiskLevel; label: string; steps: string; value?: string }) {
  const step = RISK_STEP[level];
  return (
    <div className={`inline-flex items-center gap-3 rounded-panel px-3 py-2 ${RISK_SOFT[level]}`}>
      <span className="flex items-end gap-1" role="img" aria-label={steps}>
        {[1, 2, 3].map((n) => (
          <span key={n} className={`w-2 rounded-full ${n <= step ? RISK_FILL[level] : "bg-line-strong opacity-40"}`} style={{ height: `${0.375 + n * 0.3125}rem` }} />
        ))}
      </span>
      <span className={`font-display text-lg font-semibold ${RISK_TEXT[level]}`}>{label}</span>
      {value && <span className="font-display text-lg font-semibold text-ink [font-variant-numeric:tabular-nums]">{value}</span>}
    </div>
  );
}

/** Zona de una medida: color de la zona más su nombre escrito. */
export function ZoneChip({ zone, label }: { zone: Zone; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ZONE_CLASS[zone].soft} ${ZONE_CLASS[zone].text}`}>
      <span className={`size-2 rounded-full ${ZONE_CLASS[zone].bg}`} aria-hidden />
      {label}
    </span>
  );
}
