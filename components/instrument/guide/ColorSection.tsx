import { GuideSection } from "./GuideSection";
import { RiskScale, ZoneChip } from "../Status";

import { contrastRatio } from "@/lib/design/contrast";
import { cssVars } from "@/lib/design/css";
import { COLORS, type PaletteColor } from "@/lib/design/palette";
import { RISK_LEVELS, RISK_STEP } from "@/lib/design/risk";
import { SIGNAL_CLASS, SIGNALS, targetText, ZONES } from "@/lib/design/signals";
import { GUIDE_SAMPLE } from "@/lib/design/guide-sample";
import { format } from "@/lib/i18n";
import { getFormat, getT } from "@/lib/i18n/server";

type Mode = 0 | 1;
const SURFACES: { color: PaletteColor; name: "canvas" | "panel" | "sunken" | "ink" | "inkMuted" | "accent"; on: PaletteColor }[] = [
  { color: "canvas", name: "canvas", on: "ink" },
  { color: "panel", name: "panel", on: "ink" },
  { color: "sunken", name: "sunken", on: "ink" },
  { color: "ink", name: "ink", on: "panel" },
  { color: "ink-muted", name: "inkMuted", on: "panel" },
  { color: "accent", name: "accent", on: "on-accent" },
];

const ratio = (fg: PaletteColor, bg: PaletteColor, mode: Mode) => contrastRatio(COLORS[fg][mode], COLORS[bg][mode]);

/** Paleta en un modo forzado: cada color con su papel y su contraste medido, no estimado. */
async function PalettePanel({ mode }: { mode: Mode }) {
  const [t, f] = await Promise.all([getT(), getFormat()]);
  const c = t.styleGuide.color;
  const contrast = (value: number) => format(c.contrast, { ratio: f.decimal(value) });
  return (
    <div data-theme={mode ? "dark" : "light"} className="kin-card grid gap-7 p-5 sm:p-6">
      <h3 className="font-display text-xl font-bold text-ink">{mode ? c.dark : c.light}</h3>

      <div className="grid gap-3">
        <h4 className="font-display text-lg font-semibold text-ink">{c.signals}</h4>
        <p className="text-sm text-ink-muted">{c.signalsLead}</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {SIGNALS.map((signal) => (
            <li key={signal} className="kin-well flex items-center gap-3 p-3" style={cssVars({ "--tint": `var(--kin-${signal})` })}>
              <svg viewBox="0 0 44 20" className={`h-5 w-11 flex-none ${SIGNAL_CLASS[signal].text}`} aria-hidden>
                <path d="M3 16L22 4L41 12" className={`kin-signal-glow fill-none ${SIGNAL_CLASS[signal].stroke}`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="22" cy="4" r="3" className={SIGNAL_CLASS[signal].fill} />
              </svg>
              <span className="grid min-w-0">
                <span className={`font-semibold ${SIGNAL_CLASS[signal].text}`}>{c.names[signal]}</span>
                <span className="text-xs text-ink-muted [font-variant-numeric:tabular-nums]">{COLORS[signal][mode]} · {contrast(ratio(signal, "panel", mode))}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3">
        <h4 className="font-display text-lg font-semibold text-ink">{c.zones}</h4>
        <p className="text-sm text-ink-muted">{format(c.zonesLead, { range: targetText(GUIDE_SAMPLE.kneeTarget, f.degrees, t.analysis.kneeTarget) })}</p>
        <p className="text-xs text-ink-muted">{t.analysis.rangesNote}</p>
        <ul className="grid gap-2">
          {ZONES.map((zone) => (
            <li key={zone} className="flex flex-wrap items-center justify-between gap-2">
              <ZoneChip zone={zone} label={c.names[zone]} />
              <span className="text-xs text-ink-muted [font-variant-numeric:tabular-nums]">{contrast(ratio(`zone-${zone}`, `zone-${zone}-soft`, mode))}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3">
        <h4 className="font-display text-lg font-semibold text-ink">{c.risk}</h4>
        <p className="text-sm text-ink-muted">{c.riskLead}</p>
        <ul className="grid gap-2">
          {RISK_LEVELS.map((level) => (
            <li key={level} className="flex flex-wrap items-center justify-between gap-2">
              <RiskScale level={level} label={t.analysis.risk[level]} steps={format(t.styleGuide.screens.analysis.riskSteps, { step: RISK_STEP[level] })} />
              <span className="text-xs text-ink-muted [font-variant-numeric:tabular-nums]">{contrast(ratio(`risk-${level}`, `risk-${level}-soft`, mode))}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3">
        <h4 className="font-display text-lg font-semibold text-ink">{c.surfaces}</h4>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SURFACES.map((s) => (
            <li key={s.color} className="grid gap-1.5">
              <span className="h-12 rounded-panel shadow-[inset_0_0_0_1px_var(--kin-line)]" style={{ background: `var(--kin-${s.color})` }} aria-hidden />
              <span className="text-sm font-semibold text-ink">{c.names[s.name]}</span>
              <span className="text-xs text-ink-muted [font-variant-numeric:tabular-nums]">{COLORS[s.color][mode]} · {contrast(ratio(s.on, s.color, mode))}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export async function ColorSection() {
  const t = await getT();
  const c = t.styleGuide.color;
  return (
    <GuideSection id="color" title={t.styleGuide.sections.color} lead={c.lead} tint="var(--kin-knee)">
      <div className="grid gap-5 lg:grid-cols-2">
        <PalettePanel mode={0} />
        <PalettePanel mode={1} />
      </div>
      <p className="kin-well max-w-prose p-4 text-sm text-ink">{c.shared}</p>
    </GuideSection>
  );
}
