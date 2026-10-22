import { GuideSection, Specimen } from "./GuideSection";
import { Glyph } from "../Glyph";

import { GLYPHS, type GlyphName } from "@/lib/design/icons";
import { getT } from "@/lib/i18n/server";

// Pasos de la escala tal como están en los tokens de Tailwind, del más grande al más chico
const SCALE = [
  { className: "text-hero", token: "hero" },
  { className: "text-3xl", token: "3xl" },
  { className: "text-2xl", token: "2xl" },
  { className: "text-xl", token: "xl" },
  { className: "text-base", token: "base" },
  { className: "text-sm", token: "sm" },
  { className: "text-xs", token: "xs" },
];

export async function TypeSection() {
  const t = await getT();
  const ty = t.styleGuide.type;
  return (
    <GuideSection id="type" title={t.styleGuide.sections.type} lead={ty.lead} tint="var(--kin-trunk)">
      <div className="grid gap-5 lg:grid-cols-2">
        <article className="kin-card grid content-start gap-4 p-6" aria-labelledby="type-display">
          <p className="font-display text-[5.5rem] leading-none font-bold text-trunk" aria-hidden>Aa</p>
          <h3 id="type-display" className="font-display text-2xl font-semibold text-ink">{ty.display}</h3>
          <p className="text-sm text-ink-muted">{ty.displayUse}</p>
          <p className="font-display text-3xl font-semibold text-ink">{ty.sampleTitle}</p>
          <div className="kin-well grid gap-1 p-4">
            <span className="text-xs text-ink-muted">{ty.figures}</span>
            <span className="font-display text-3xl font-semibold text-ink [font-variant-numeric:tabular-nums]">0123456789°</span>
          </div>
        </article>
        <article className="kin-card grid content-start gap-4 p-6" aria-labelledby="type-sans">
          <p className="font-sans text-[5.5rem] leading-none font-semibold text-ink" aria-hidden>Aa</p>
          <h3 id="type-sans" className="font-display text-2xl font-semibold text-ink">{ty.sans}</h3>
          <p className="text-sm text-ink-muted">{ty.sansUse}</p>
          <p className="max-w-prose text-base text-ink">{ty.sampleBody}</p>
          <p className="max-w-prose text-sm text-ink-muted">{ty.sampleBody}</p>
        </article>
      </div>
      <Specimen title={ty.scale}>
        <ul className="kin-card grid gap-3 p-6">
          {SCALE.map((step) => (
            <li key={step.token} className="grid grid-cols-[3rem_1fr] items-baseline gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
              <span className="text-xs text-ink-muted">{step.token}</span>
              <span className={`${step.className} truncate font-display font-semibold text-ink`}>{ty.sampleTitle}</span>
            </li>
          ))}
        </ul>
      </Specimen>
    </GuideSection>
  );
}

export async function GlyphSection() {
  const t = await getT();
  const names = Object.keys(GLYPHS) as GlyphName[];
  return (
    <GuideSection id="glyphs" title={t.styleGuide.sections.glyphs} lead={t.styleGuide.glyphs.lead} tint="var(--kin-center)">
      <ul className="kin-card grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-x-2 gap-y-5 p-5 sm:p-6">
        {names.map((name) => (
          <li key={name} className="grid justify-items-center gap-2 text-center">
            <span className="kin-well grid size-12 place-items-center text-ink"><Glyph name={name} size={24} /></span>
            <span className="max-w-full truncate text-xs text-ink-muted">{name}</span>
          </li>
        ))}
      </ul>
    </GuideSection>
  );
}
