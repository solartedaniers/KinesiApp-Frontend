import { GuideSection, subtitle } from "./GuideSection";
import { RiskTag } from "../lab/Risk";

import { contrastRatio } from "@/lib/design/contrast";
import { LAB_COLORS, type LabColor } from "@/lib/design/palette";
import { RISK_LEVELS } from "@/lib/design/risk";
import { format } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";

const GROUPS: Record<"surfaces" | "ink" | "accent" | "risk", LabColor[]> = {
  surfaces: ["canvas", "panel", "sunken", "line-strong"],
  ink: ["ink", "ink-muted"],
  accent: ["accent", "accent-soft", "trace-alt"],
  risk: ["risk-low", "risk-moderate", "risk-high"],
};

// Las superficies no llevan texto encima de su propio color: su contraste con el papel no dice nada
const SURFACES: LabColor[] = ["canvas", "panel", "sunken", "accent-soft"];

const styles = {
  modes: "grid gap-4 md:grid-cols-2",
  mode: "paper-grid grid gap-6 rounded-tag p-5 shadow-[inset_0_0_0_1px_var(--kin-line)] sm:p-6",
  modeTitle: "font-display text-2xl font-medium text-ink",
  group: "grid gap-2",
  groupTitle: "text-sm font-semibold text-ink-muted",
  swatches: "grid gap-1.5",
  swatch: "grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 rounded-tag bg-panel p-1.5 pr-3",
  chip: "h-11 rounded-[3px] shadow-[inset_0_0_0_1px_var(--kin-line)]",
  name: "text-sm font-semibold text-ink",
  hex: "block font-mono text-xs text-ink-muted uppercase",
  ratio: "text-right text-xs text-ink-muted [font-variant-numeric:tabular-nums]",
  risk: "grid gap-4",
  riskRow: "flex flex-wrap gap-3",
};

async function ModePanel({ mode }: { mode: 0 | 1 }) {
  const t = await getT();
  const c = t.styleGuide.color;
  return (
    <div data-theme={mode ? "dark" : "light"} className={styles.mode}>
      <h3 className={styles.modeTitle}>{mode ? c.dark : c.light}</h3>
      {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((group) => (
        <div key={group} className={styles.group}>
          <h4 className={styles.groupTitle}>{c.groups[group]}</h4>
          <ul className={styles.swatches}>
            {GROUPS[group].map((name) => {
              const hex = LAB_COLORS[name][mode];
              const ratio = contrastRatio(hex, LAB_COLORS.canvas[mode]);
              return (
                <li key={name} className={styles.swatch}>
                  <span className={styles.chip} style={{ background: `var(--kin-${name})` }} aria-hidden />
                  <span>
                    <span className={styles.name}>{c.names[name as keyof typeof c.names]}</span>
                    <span className={styles.hex}>{hex}</span>
                  </span>
                  {!SURFACES.includes(name) && <span className={styles.ratio}>{format(c.contrastOn, { ratio: ratio.toFixed(1) })}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export async function ColorSection() {
  const t = await getT();
  const c = t.styleGuide.color;
  return (
    <GuideSection id="color" title={t.styleGuide.sections.color} intro={c.intro}>
      <div className={styles.modes}>
        <ModePanel mode={0} />
        <ModePanel mode={1} />
      </div>
      <div className={styles.risk}>
        <h3 className={subtitle}>{c.riskTitle}</h3>
        <p className="max-w-prose text-base text-ink">{c.riskIntro}</p>
        <div className={styles.riskRow}>
          {RISK_LEVELS.map((level) => <RiskTag key={level} level={level} label={t.analysis.risk[level]} />)}
        </div>
      </div>
    </GuideSection>
  );
}
