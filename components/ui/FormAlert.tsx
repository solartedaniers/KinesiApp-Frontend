import type { ReactNode } from "react";

import { Glyph } from "@/components/instrument/Glyph";
import { cssVars } from "@/lib/design/css";
import type { GlyphName } from "@/lib/design/icons";

type Tone = "error" | "success" | "info";

// Sin rojo: es del riesgo. El error se distingue por el brillo de tinta y el ícono, como el campo inválido
const TONE: Record<Tone, { glyph: GlyphName; tint: string; text: string }> = {
  error: { glyph: "alert", tint: "var(--kin-ink)", text: "text-ink" },
  success: { glyph: "check", tint: "var(--kin-zone-target)", text: "text-zone-target" },
  info: { glyph: "info", tint: "var(--kin-accent)", text: "text-accent" },
};

export function FormAlert({ tone, children }: { tone: Tone; children: ReactNode }) {
  const { glyph, tint, text } = TONE[tone];
  return (
    <div
      className="kin-card kin-tinted flex items-start gap-3 p-3.5 text-sm text-ink"
      style={cssVars({ "--tint": tint })}
      role={tone === "error" ? "alert" : "status"}
    >
      <Glyph name={glyph} size={20} className={`mt-px flex-none ${text}`} />
      <div className="grid gap-1 [&_strong]:font-semibold">{children}</div>
    </div>
  );
}
